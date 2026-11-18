// Full Quality Clash battle on the emulator. MODE=team (default: 6 fighters + 1 watcher) or MODE=solo (2 players).
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const MODE = process.env.MODE === "solo" ? "solo" : "team";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const get = async () => (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
const PLAYERS =
  MODE === "team"
    ? [
        ["Aina", "red", ["Kaizen Dragon"]],
        ["Ravi", "blue", ["Audit Owl"]],
        ["Hafiz", "red", ["Viscosity Turtle"]],
        ["Siti", "blue", ["Calibration Golem"]],
        ["Mei Ling", "red", ["Sigma Fox"]],
        ["Daniel", "blue", ["pH Shark"]],
        ["Watcher", null, []],
      ]
    : [
        ["Aina", "red", ["Kaizen Dragon", "Sample Otter", "Sensor Bee"]],
        ["Ravi", "blue", ["Audit Owl", "Root Cause Rhino", "Gemba Falcon"]],
      ];

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL|fonts\.g/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("radio", { name: /Quality Clash/ }).click();
  await proj.getByRole("radio", { name: MODE === "solo" ? /Single 1 v 1/ : /Team 3 v 3/ }).click();
  await proj.waitForTimeout(500);

  const phones = [];
  for (const [name, side, mons] of PLAYERS) {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.locator("button.token-btn:not([disabled])").first().click();
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    if (side) {
      await p.locator(`button.cp-side.${side}`).click();
      for (const m of mons) await p.getByRole("button", { name: m, exact: true }).click();
      await p.locator(".cp-ready").waitFor({ timeout: 5000 });
    }
    phones.push({ name, p, side });
  }
  log("joined", phones.length, "phones");
  await phones[0].p.locator(".clash-pick").scrollIntoViewIfNeeded();
  await phones[0].p.screenshot({ path: `${OUT}/clash-${MODE}-phone-pick.png`, fullPage: true });
  await proj.screenshot({ path: `${OUT}/clash-${MODE}-lobby.png` });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  await proj.waitForTimeout(2500);
  await proj.screenshot({ path: `${OUT}/clash-${MODE}-countdown.png` });

  const start = Date.now();
  let answered = 0, rightN = 0, shots = 0;
  while (Date.now() - start < 8 * 60 * 1000) {
    if (errors.length) break;
    if (await proj.locator(".clash-win").count()) break;
    const all = await get();
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph, i) => {
        if (!ph.side || Math.random() < 0.35) return;
        const btns = ph.p.locator(".qcard button.ans:not([disabled])");
        const n = await btns.count();
        if (!n) return;
        const right = all.private?.clash?.qs?.[byName[ph.name]]?.correctIdx ?? 0;
        // Red answers a little better, so the battle has a clear winner.
        const ok = Math.random() < (ph.side === "red" ? 0.85 : 0.7);
        await btns.nth(ok ? right : (right + 1) % n).click({ timeout: 1500 }).catch(() => {});
        answered++;
        if (ok) rightN++;
      }),
    );
    const t = (Date.now() - start) / 1000;
    if (shots === 0 && t > 12) {
      await proj.screenshot({ path: `${OUT}/clash-${MODE}-battle.png` });
      await phones[0].p.screenshot({ path: `${OUT}/clash-${MODE}-phone-q.png` });
      shots++;
    }
    if (shots === 1 && t > 30) {
      await proj.screenshot({ path: `${OUT}/clash-${MODE}-battle2.png` });
      for (const ph of phones.slice(0, 2)) await ph.p.screenshot({ path: `${OUT}/clash-${MODE}-phone-${ph.name}.png` });
      if (phones[6]) await phones[6].p.screenshot({ path: `${OUT}/clash-${MODE}-phone-watcher.png` });
      shots++;
    }
    await proj.waitForTimeout(300);
  }
  const all = await get();
  const b = all.clash?.b;
  log("time:", Math.round((Date.now() - start) / 1000) + "s", "answers:", answered, "right:", rightN);
  log("winner:", b?.winner, "status:", all.game?.status, "winners:", (all.game?.winners || []).map((u) => all.players[u]?.name).join(", "));
  log("fighters:", Object.values(b?.fighters || {}).map((f) => `${f.id}:${f.c}:${f.hp}hp+${f.sh}sh:Lv${f.lv}`).join(" "));
  log("rights:", JSON.stringify(b?.rights), "events:", (all.clash?.ev || []).length);
  await proj.waitForTimeout(1500);
  await proj.screenshot({ path: `${OUT}/clash-${MODE}-end.png` });
  await phones[0].p.screenshot({ path: `${OUT}/clash-${MODE}-phone-end.png` });
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
  if (errors.length || all.game?.status !== "ended") process.exit(1);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
