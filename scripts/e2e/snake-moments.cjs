// Projector snake & ladder moments: spotlight (1–8 players) or glow + side cards (9–20).
// Phones answer normal questions right; snake/ladder questions after ~3 s, right half the time.
// Screenshots each stage of a moment on the projector. Options: N (players, default 3), SECS (max run time).
// Start from a fresh emulator (this clears the database first).
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const N = +(process.env.N || 3);
const SECS = +(process.env.SECS || 180);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah", "Gopal", "Hana", "Ismail", "Jun", "Kavi", "Lina", "Mei", "Nizam", "Omar", "Priya", "Qistina", "Raj", "Siti", "Tan"];

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
  await proj.getByRole("button", { name: /Snake & Ladder/ }).click();

  const phones = [];
  for (const name of NAMES.slice(0, N)) {
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    phones.push({ name, p });
  }
  log(N, "joined");
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  log("started");

  const mode = N <= 8 ? "spot" : "glow";
  const want = mode === "spot"
    ? { alert: ".spot-label.ask-snake, .spot-label.ask-ladder", answer: ".m-bubble", verdict: ".spot-label[class*=tone-]", move: ".piece.riding" }
    : { alert: ".m-float.ask-snake, .m-float.ask-ladder", answer: ".m-bubble", verdict: ".m-float[class*=tone-]:not(.big)", move: ".piece.riding", delta: ".m-float.big", cards2: ".m-card + .m-card" };
  const done = new Set();
  const seen = {};
  let stop = false;

  // Phones: answer in the background.
  const phoneLoop = (async () => {
    while (!stop) {
      const all = await (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();
      const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
      await Promise.all(
        phones.map(async (ph) => {
          const uid = byName[ph.name];
          const st = all.state?.[uid];
          if (!st || st.phase !== "question") return;
          const key = `${uid}-${st.seq}`;
          seen[key] ??= Date.now();
          const sl = st.kind === "snake" || st.kind === "ladder";
          if (sl && Date.now() - seen[key] < 3000) return;
          const btns = ph.p.locator("button.ans:not([disabled])");
          const n = await btns.count();
          if (!n) return;
          const right = all.private?.[uid]?.correctIdx ?? 0;
          const ok = sl ? Math.random() < 0.5 : true;
          await btns.nth(ok ? right : (right + 1) % n).click({ timeout: 1500 }).catch(() => {});
        }),
      );
      await new Promise((r) => setTimeout(r, 350));
    }
  })();

  const start = Date.now();
  while (Date.now() - start < SECS * 1000 && done.size < Object.keys(want).length && !errors.length) {
    for (const [name, sel] of Object.entries(want)) {
      if (done.has(name)) continue;
      if (await proj.locator(sel).count()) {
        await proj.waitForTimeout(name === "move" ? 400 : name === "alert" || name === "verdict" || name === "delta" ? 250 : 0);
        await proj.screenshot({ path: `${OUT}/moments-${mode}-${name}.png` });
        done.add(name);
        log("shot", name);
      }
    }
    await proj.waitForTimeout(120);
  }
  stop = true;
  await phoneLoop;
  log("stages caught:", [...done].join(", "), "of", Object.keys(want).join(", "));
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
  if (errors.length) process.exit(1);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
