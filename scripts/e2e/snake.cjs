const { chromium, devices } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

(async () => {
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };

  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("button", { name: /Snake & Ladder/ }).click();
  log("projector ready (PIN created)");

  const names = [["Aina", "Lion"], ["Bala", "Rocket"], ["Chong", "Bee"]];
  const phones = [];
  for (const [name, tok] of names) {
    const ctx = await browser.newContext({ ...devices["Pixel 7"] });
    const p = await ctx.newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 10000 });
    phones.push({ name, p });
    if (name === "Aina") await p.screenshot({ path: OUT + "/phone-lobby.png" });
    log(name, "joined");
  }
  // A 4th phone sees the join form (name only: pieces are given at random at Start).
  const extra = await (await browser.newContext({ ...devices["Pixel 7"] })).newPage();
  await extra.goto(BASE + "/join");
  await extra.locator("#name").waitFor();
  log("4th phone join form has no piece picker:", (await extra.locator("button.token-btn").count()) === 0);
  await extra.screenshot({ path: OUT + "/phone-join.png" });

  await proj.waitForTimeout(500);
  await proj.screenshot({ path: OUT + "/projector-lobby.png" });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  log("game started");
  await proj.waitForTimeout(1600);
  await proj.screenshot({ path: OUT + "/projector-countdown.png" });
  await phones[0].p.screenshot({ path: OUT + "/phone-countdown.png" });
  log("phone during countdown:", (await phones[0].p.locator(".phone-main").innerText()).replace(/\n/g, " | ").slice(0, 80));
  const qBefore = await phones[0].p.locator("button.ans").count();
  log("question buttons during countdown (expect 0):", qBefore);

  // Late joiner should be refused.
  await extra.waitForTimeout(800);
  log("late joiner sees:", (await extra.locator(".phone-main").innerText()).slice(0, 60).replace(/\n/g, " | "));

  let shotQ = false, shotR = false, shotGame = 0, shotPen = false, shotSp = false;
  const start = Date.now();
  let answered = 0;
  while (Date.now() - start < 9 * 60 * 1000) {
    if (errors.length) { log("ERRORS", errors); break; }
    const over = await proj.locator(".podium").count();
    if (over) break;
    for (const ph of phones) {
      if (!shotSp && (await ph.p.locator(".sp-card").count())) {
        await ph.p.waitForTimeout(700);
        await ph.p.screenshot({ path: OUT + "/phone-special.png" });
        await proj.screenshot({ path: OUT + "/projector-special.png" });
        shotSp = true;
        log("special card seen on", ph.name);
      }
      const btns = ph.p.locator("button.ans:not([disabled])");
      if (await btns.count()) {
        if (!shotQ && ph.name === "Aina") {
          await ph.p.screenshot({ path: OUT + "/phone-question.png" });
          shotQ = true;
        }
        // Chong lets one question time out to test the timer.
        if (ph.name === "Chong" && answered === 3 && !ph.waited) {
          ph.waited = true;
          log("Chong waits out the timer");
          continue;
        }
        const n = await btns.count();
        if (!ph.timerChecked && ph.name === "Bala") {
          ph.timerChecked = true;
          log("timer shows:", await ph.p.locator(".timer-num").innerText());
        }
        const dbAll = await (await fetch("http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb", { headers: { Authorization: "Bearer owner" } })).json();
        const uid = Object.entries(dbAll.players || {}).find(([, v]) => v.name === ph.name)?.[0];
        const right = dbAll.private?.[uid]?.correctIdx ?? 0;
        const pick = Math.random() < 0.8 ? right : (right + 1) % n;
        await btns.nth(pick).click().catch(() => {});
        if (pick !== right && !shotPen && ph.name === "Aina") {
          await ph.p.waitForTimeout(1500);
          await ph.p.screenshot({ path: OUT + "/phone-penalty.png" });
          shotPen = true;
        }
        answered++;
      } else if (!shotR && ph.name === "Aina" && (await ph.p.locator(".rcard .outcome").count())) {
        await ph.p.waitForTimeout(400);
        await ph.p.screenshot({ path: OUT + "/phone-result.png" });
        shotR = true;
      }
    }
    if (answered > 12 && shotGame === 0) {
      await proj.screenshot({ path: OUT + "/projector-game.png" });
      shotGame = 1;
    }
    if (answered > 40 && shotGame === 1) {
      await proj.screenshot({ path: OUT + "/projector-game2.png" });
      shotGame = 2;
    }
    await proj.waitForTimeout(300);
  }
  log("answers given:", answered, "time:", Math.round((Date.now() - start) / 1000) + "s");
  await proj.waitForTimeout(1500);
  await proj.screenshot({ path: OUT + "/projector-end.png" });
  log("podium:", (await proj.locator(".podium").innerText().catch(() => "none")).replace(/\n/g, " | "));
  log("feed:", (await proj.locator(".feed").innerText({ timeout: 3000 }).catch(() => "none")).split("\n").slice(0, 6).join(" | "));
  await phones[0].p.screenshot({ path: OUT + "/phone-end.png" });
  await phones[0].p.getByRole("button", { name: /Exit/ }).click();
  await phones[0].p.getByText("Thank you for playing!").waitFor({ timeout: 5000 });
  await phones[0].p.screenshot({ path: OUT + "/phone-exit.png" });
  log("exit works");
  log("errors:", errors.length ? errors.slice(0, 10) : "none");
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
