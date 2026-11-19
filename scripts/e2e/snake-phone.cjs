// Snake & Ladder phone board: plays a game with 3 phones and takes a screenshot of each phone screen
// the first time it appears (countdown, question, dice, snake/ladder alerts, verdicts, penalty, win).
// Start from a fresh emulator. Run: node scripts/e2e/snake-phone.cjs
const { chromium, devices } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const ACC = +(process.env.ACC || 0.75);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const SCREENS = {
  countdown: ".slp-overlay .slp-cd",
  question: ".slp-sheet .slp-q:not(.framed)",
  dice: ".slp-dice",
  "snake-alert": ".slp-alert.a-snake",
  "snake-question": ".slp-qhead.snake",
  "ladder-alert": ".slp-alert.a-ladder",
  "ladder-question": ".slp-qhead.ladder",
  safe: ".slp-alert.a-safe",
  correct: ".slp-alert.a-correct",
  wrong: ".slp-alert.a-wrong",
  penalty: ".slp-sheet .slp-pen",
  special: ".slp-float .sp-card",
  won: ".slp-alert.a-won",
};

(async () => {
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  const pin = proj.getByPlaceholder("PIN");
  await pin.waitFor({ timeout: 15000 });
  await pin.fill("2468");
  await proj.getByRole("button", { name: /Save PIN|Open/ }).first().click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("button", { name: /Snake & Ladder/ }).click();

  const phones = [];
  for (const [name, tok] of [["Aina", "Lion"], ["Bala", "Rocket"], ["Chong", "Panda"]]) {
    const p = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("radio", { name: new RegExp(tok) }).click();
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 10000 });
    phones.push({ name, p });
  }
  log("3 phones joined");
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  const seen = {};
  const start = Date.now();
  let answered = 0;
  while (Date.now() - start < 8 * 60 * 1000) {
    if (errors.length) break;
    if (await proj.locator(".podium").count()) break;
    for (const ph of phones) {
      for (const [k, sel] of Object.entries(SCREENS)) {
        if (seen[k] || !(await ph.p.locator(sel).count())) continue;
        seen[k] = ph.name;
        await ph.p.waitForTimeout(k === "dice" ? 900 : 350);
        await ph.p.screenshot({ path: `${OUT}/sl-phone-${k}.png` });
        if (k === "snake-question" || k === "ladder-question")
          log(k, "timer:", await ph.p.locator(".timer-num").innerText().catch(() => "?"));
        log("seen", k, "on", ph.name);
      }
      const btns = ph.p.locator(".slp-sheet button.ans:not([disabled])");
      const n = await btns.count();
      if (!n) continue;
      if (!seen.peek && ph.name === "Aina") {
        await ph.p.getByRole("button", { name: /Board/ }).click();
        await ph.p.waitForTimeout(600);
        await ph.p.screenshot({ path: `${OUT}/sl-phone-peek.png` });
        await ph.p.getByRole("button", { name: /Question/ }).click();
        await ph.p.waitForTimeout(500);
        seen.peek = "Aina";
        log("seen peek (Board button)");
      }
      const dbAll = await (await fetch("http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb", { headers: { Authorization: "Bearer owner" } })).json();
      const uid = Object.entries(dbAll.players || {}).find(([, v]) => v.name === ph.name)?.[0];
      const right = dbAll.private?.[uid]?.correctIdx ?? 0;
      const pick = Math.random() < ACC ? right : (right + 1) % n;
      await btns.nth(pick).click({ timeout: 2000 }).catch(() => {});
      answered++;
    }
    await proj.waitForTimeout(250);
  }
  log("answers:", answered, "time:", Math.round((Date.now() - start) / 1000) + "s");
  log("screens seen:", Object.keys(seen).join(", "));
  log("not seen:", Object.keys(SCREENS).filter((k) => !seen[k]).join(", ") || "none");
  log("errors:", errors.length ? errors.slice(0, 10) : "none");
  await browser.close();
  if (errors.length) process.exit(1);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
