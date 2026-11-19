const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah"];

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("button", { name: /Quality Cart/ }).click();
  await proj.waitForTimeout(500);

  const phones = [];
  for (const name of NAMES) {
    // Phones are held sideways for the race; the last phone stays upright to check the "turn sideways" message.
    const upright = phones.length === NAMES.length - 1;
    const p = await (await browser.newContext({ viewport: upright ? { width: 390, height: 844 } : { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    phones.push({ name, p, tilt: phones.length % 2 === 0, upright });
  }
  log("joined; phone header:", (await phones[0].p.locator(".qm-title").innerText()).replace(/\n/g, " / "));
  await phones[0].p.screenshot({ path: OUT + "/cart-phone-lobby.png" });
  await proj.screenshot({ path: OUT + "/cart-lobby.png" });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  await proj.waitForTimeout(2000);
  await proj.screenshot({ path: OUT + "/cart-countdown.png" });
  await phones[0].p.screenshot({ path: OUT + "/cart-phone-countdown.png" });
  const up = phones.find((ph) => ph.upright);
  if (up) {
    await up.p.locator(".kr-rotate").waitFor({ timeout: 5000 });
    await up.p.screenshot({ path: OUT + "/cart-phone-upright.png" });
    log("upright phone sees:", (await up.p.locator(".kr-rotate").innerText()).replace(/\n/g, " | ").slice(0, 90));
    await up.p.getByRole("button", { name: /Keep it upright/ }).click();
  }
  let shotQ = false;
  const seenFx = {};

  const start = Date.now();
  let answered = 0, items = 0, shots = 0;
  while (Date.now() - start < 6 * 60 * 1000) {
    if (errors.length) break;
    if (await proj.locator(".podium").count()) break;
    const all = await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph, i) => {
        const uid = byName[ph.name];
        // steer towards a random lane every so often
        const steer = Math.sin(Date.now() / 1500 + i) * 0.9;
        if (ph.tilt) {
          await ph.p.evaluate((g) => window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { gamma: g, beta: g, alpha: 0 })), steer * 25).catch(() => {});
        } else {
          const btn = ph.p.locator(steer < 0 ? "button[aria-label='Steer left']" : "button[aria-label='Steer right']");
          if (await btn.count()) await btn.dispatchEvent("pointerdown").catch(() => {});
          setTimeout(() => btn.dispatchEvent("pointerup").catch(() => {}), 250);
        }
        for (const [k, sel] of [["warn", ".kr-warn"], ["super", ".kr-fx.super"]]) {
          if (!seenFx[k] && (await ph.p.locator(sel).count())) {
            seenFx[k] = ph.name;
            await ph.p.screenshot({ path: OUT + `/cart-phone-${k}.png` });
            log(`seen ${k} on`, ph.name, (await ph.p.locator(sel).first().innerText()).replace(/\n/g, " | "));
          }
        }
        const btns = ph.p.locator(".kr-q button.kr-ans:not([disabled])");
        const n = await btns.count();
        if (n && !shotQ && i === 0) {
          shotQ = true;
          await ph.p.screenshot({ path: OUT + "/cart-phone-question.png" });
        }
        if (n) {
          const right = all.private?.kartsim?.qs?.[uid]?.correctIdx ?? 0;
          await btns.nth(Math.random() < 0.9 ? right : (right + 1) % n).click({ timeout: 1500 }).catch(() => {});
          answered++;
        }
        const item = ph.p.locator("button.kr-item.has");
        if ((await item.count()) && Math.random() < 0.3) {
          await item.click({ timeout: 1500, force: true }).catch(() => {});
          items++;
        }
      }),
    );
    const t = (Date.now() - start) / 1000;
    if (shots === 0 && t > 25) {
      await proj.screenshot({ path: OUT + "/cart-race.png" });
      for (const ph of phones.slice(0, 2)) await ph.p.screenshot({ path: OUT + `/cart-phone-${ph.name}.png` });
      await proj.waitForTimeout(150);
      const inp = (await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json()).kart?.input || {};
      log("steering mid-race:", phones.map((ph) => `${ph.name}(${ph.tilt ? "tilt" : "buttons"})=${inp[byName[ph.name]]?.s}`).join(" "));
      log("hint on Aina:", await phones[0].p.locator(".kr-hint").innerText().catch(() => "?"));
      shots++;
    }
    if (shots === 1 && t > 80) {
      await proj.screenshot({ path: OUT + "/cart-race2.png" });
      await phones[2].p.screenshot({ path: OUT + "/cart-phone-mid.png" });
      shots++;
    }
    await proj.waitForTimeout(350);
  }
  const all = await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
  log("screens seen:", JSON.stringify(seenFx));
  log("time:", Math.round((Date.now() - start) / 1000) + "s", "answers:", answered, "items used:", items);
  log("tilt seen on phone 1:", JSON.stringify(all.kart?.input?.[Object.keys(all.players)[0]]));
  log("results:", JSON.stringify((all.kart?.results || []).map((r) => [all.players[r.uid]?.name, r.rank, r.time])));
  log("feed:", (all.feed || []).slice(-6).map((f) => f.text).join(" | "));
  await proj.waitForTimeout(1500);
  await proj.screenshot({ path: OUT + "/cart-end.png" });
  await phones[0].p.screenshot({ path: OUT + "/cart-phone-end.png" });
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
