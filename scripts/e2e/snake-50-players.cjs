// 50 phones + projector: join (name only), a 51st phone is refused, Quality Cart can start with 50 (every game
// allows 50 since 23 Nov 2026), random pieces at Start ("You are …" in the countdown), play ~2 minutes. Options: N (default 50), SECS.
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const BASE_NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah", "Gopal", "Hana", "Ismail", "Jun", "Kavi", "Lina", "Mei", "Nizam", "Omar", "Priya", "Qistina", "Raj", "Siti", "Tan"];
const N = +(process.env.N || 50);
const SECS = +(process.env.SECS || 120);
const NAMES = Array.from({ length: N }, (_, i) => BASE_NAMES[i % 20] + (i >= 20 ? ` ${Math.floor(i / 20) + 1}` : ""));

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL|AudioContext/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("button", { name: /Snake & Ladder/ }).click();

  const phones = [];
  for (const name of NAMES) {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    phones.push({ name, p });
  }
  log(N, "joined");
  const p21 = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p21.goto(BASE + "/join");
  await p21.waitForTimeout(2500);
  log(`${N + 1}th phone sees:`, (await p21.locator(".phone-main").innerText()).replace(/\n/g, " | ").slice(0, 70));
  await phones[N - 1].p.screenshot({ path: OUT + "/phone50-lobby.png" });
  // Quality Cart allows 50 too (was 30): Start is not blocked.
  await proj.getByRole("button", { name: /Change game/ }).click();
  await proj.getByRole("button", { name: /Quality Cart/ }).click();
  await proj.waitForTimeout(500);
  log("cart start disabled (should be false):", await proj.getByRole("button", { name: "▶ Start game" }).isDisabled(), "|", (await proj.locator(".too-many").innerText().catch(() => "no message")).slice(0, 80));
  await proj.screenshot({ path: OUT + "/projector50-cart.png" });
  await proj.getByRole("button", { name: /Change game/ }).click();
  await proj.getByRole("button", { name: /Snake & Ladder/ }).click();
  await proj.waitForTimeout(800);
  log("lobby lists:", await proj.locator(".lobby-players li").count(), "|", await proj.locator(".more-players").innerText().catch(() => ""), "|", await proj.locator(".lobby-head .count").innerText());
  await proj.screenshot({ path: OUT + "/projector50-lobby.png" });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  log("started");
  await phones[0].p.waitForTimeout(1800);
  await phones[0].p.screenshot({ path: OUT + "/phone50-countdown.png" });
  log("phone countdown:", (await phones[0].p.locator(".cd-you").innerText().catch(() => "no 'You are'")).replace(/\n/g, " "));
  const pieces = Object.values((await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json()).players || {}).map((p) => p.token);
  log("pieces given:", pieces.filter(Boolean).length, "unique:", new Set(pieces).size);

  const start = Date.now();
  let answered = 0;
  let shot = false;
  while (Date.now() - start < SECS * 1000) {
    if (errors.length) break;
    const all = await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph) => {
        const btns = ph.p.locator("button.ans:not([disabled])");
        const n = await btns.count();
        if (!n) return;
        const right = all.private?.[byName[ph.name]]?.correctIdx ?? 0;
        await btns.nth(Math.random() < 0.8 ? right : (right + 1) % n).click({ timeout: 2000 }).catch(() => {});
        answered++;
      }),
    );
    if (!shot && Date.now() - start > SECS * 500) {
      await proj.screenshot({ path: OUT + "/projector50-game.png" });
      shot = true;
    }
    await proj.waitForTimeout(400);
  }
  log("answers given:", answered);
  const all = await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
  const pos = Object.values(all.state || {}).map((s) => s.pos).sort((a, b) => b - a);
  log("positions at the end:", pos.join(","));
  await proj.screenshot({ path: OUT + "/projector50-game2.png" });
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
