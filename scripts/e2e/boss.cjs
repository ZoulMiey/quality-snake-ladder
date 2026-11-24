// Full Boss Raid on the emulator. MODE=ta|hs (default ta), N=players (default 6), ACC=chance of a right answer (default 0.8).
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const MODE = process.env.MODE === "hs" ? "hs" : "ta";
const N = Number(process.env.N || 6);
const ACC = Number(process.env.ACC || 0.8);
const TAG = `boss-${MODE}-${N}`;
const NAMES = ["Aina", "Ravi", "Hafiz", "Siti", "Mei Ling", "Daniel", "Farah", "Kumar", "Lina", "Arif", "Jun", "Nora", "Zul", "Priya", "Tan", "Yus", "Hana", "Ken", "Ali", "Bea", "Izzat", "Dewi", "Faiz", "Gopal", "Chen", "Amir", "Sara", "Iqbal", "Wei", "Nurul", "Azlan", "Rina", "Vijay", "Mira", "Hakim", "Joanne", "Syafiq", "Aishah", "Raj", "Ling", "Firdaus", "Kavitha", "Hadi", "Suzy", "Rashid", "Ying", "Fauzi", "Maya", "Danial", "Elena"];
const MONS = ["Kaizen Dragon", "Audit Owl", "Viscosity Turtle", "Calibration Golem", "Sigma Fox", "pH Shark", "Sensor Bee", "Root Cause Rhino", "Sample Otter", "Gemba Falcon"];
// A busy sandbox (50 phones) can time out a screenshot: skip it rather than fail the raid.
const snap = (page, path) => page.screenshot({ path, timeout: 60000 }).catch(() => console.log("screenshot skipped:", path.split("/").pop()));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const get = async (p = "") => (await fetch(DB.replace(".json", p + ".json"), { headers: { Authorization: "Bearer owner" } })).json();

(async () => {
  // Clear everything except the best-time record, so a second run can test "best time".
  const rec = await get("/clash/records");
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  if (rec) await fetch(DB.replace(".json", "/clash/records.json"), { method: "PUT", headers: { Authorization: "Bearer owner" }, body: JSON.stringify(rec) });
  // 3D (Clash look A, 24 Nov 2026): SwiftShader gives headless windows WebGL, but drawing 3D in software is slow, so only
  // the projector and the first phone draw 3D; the other phones have no WebGL and fall back to the 2D arena.
  const browser = await chromium.launch({ args: ["--no-proxy-server", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const flat = await chromium.launch({ args: ["--no-proxy-server", "--disable-gpu", "--disable-webgl", "--disable-3d-apis"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => ((m.type() === "error" && !/TUNNEL|fonts\.g|AudioContext/.test(m.text())) || /3D arena stopped/.test(m.text())) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 15000 });
  await proj.getByRole("button", { name: /Quality Clash/ }).click();
  await proj.getByRole("radio", { name: /Boss Raid/ }).click();
  await proj.getByRole("radio", { name: MODE === "hs" ? /High Score/ : /Time Attack/ }).click();
  await proj.waitForTimeout(400);

  const phones = [];
  for (let i = 0; i < N; i++) {
    const p = await (await (i === 0 ? browser : flat).newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: i === 0 ? 2 : 1 })).newPage();
    watch(p, NAMES[i]);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(NAMES[i]);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    await p.getByRole("button", { name: MONS[i % MONS.length], exact: true }).click();
    await p.locator(".cp-ready").waitFor({ timeout: 5000 });
    phones.push({ name: NAMES[i], p });
  }
  log("joined", N, "phones");
  await snap(phones[0].p, `${OUT}/${TAG}-phone-pick.png`);
  await snap(proj, `${OUT}/${TAG}-lobby.png`);
  await proj.getByRole("button", { name: "▶ Start game" }).click();

  const start = Date.now();
  let answered = 0, shots = 0, sawWarn = false, sawRevive = false, sawRage = false, sawCounter = false;
  const stomps = new Map();
  while (Date.now() - start < 7 * 60 * 1000) {
    if (errors.length) break;
    if (await proj.locator(".raid-win").count()) break;
    const all = await get();
    // Titan defeated: shots through the break, the BOOM, the 3-2-1 and the results (owner, eighth session).
    if (all.game?.status === "ended" && all.clash?.raid?.winner === "players") {
      const t0 = all.game.endedAt;
      for (const [sec, tag] of [[0.8, "crack"], [1.75, "boom"], [2.4, "fire"], [3.4, "count3"], [5.4, "count1"], [6.6, "results"]]) {
        const wait = t0 + sec * 1000 - Date.now();
        if (wait > 0) await proj.waitForTimeout(wait);
        await Promise.all([snap(proj, `${OUT}/${TAG}-defeat-${tag}.png`), snap(phones[0].p, `${OUT}/${TAG}-phone-defeat-${tag}.png`)]);
      }
      log("results on projector after 6 s:", await proj.locator(".raid-win").count(), "| on phone:", await phones[0].p.locator(".cph-end").count());
      break;
    }
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph) => {
        if (Math.random() < (process.env.SKIP ? Number(process.env.SKIP) : 0.45)) return;
        const btns = ph.p.locator(".qcard button.ans:not([disabled])");
        const n = await btns.count();
        if (!n) return;
        const isRevive = (await ph.p.locator(".raid-revive").count()) > 0;
        if (isRevive && !sawRevive) {
          sawRevive = true;
          await snap(ph.p, `${OUT}/${TAG}-phone-revive.png`);
          await snap(proj, `${OUT}/${TAG}-fainted.png`);
          log(ph.name, "got a revive question");
        }
        const right = all.private?.clash?.qs?.[byName[ph.name]]?.correctIdx ?? 0;
        await btns.nth(Math.random() < ACC || isRevive ? right : (right + 1) % n).click({ timeout: 1500 }).catch(() => {});
        answered++;
      }),
    );
    const t = (Date.now() - start) / 1000;
    for (const e of all.clash?.rev || []) if (e && e.kind === "stomp") stomps.set(e.n, e.counter ? "counter" : "timed");
    if (!sawCounter && all.clash?.raid?.counterAt && Date.now() < all.clash.raid.counterAt) {
      sawCounter = true;
      await snap(proj, `${OUT}/${TAG}-counter.png`);
    }
    const rage = (all.clash?.rev || []).find((e) => e && e.kind === "rage");
    if (rage && !sawRage && Date.now() > rage.at + 900) {
      sawRage = true;
      await snap(proj, `${OUT}/${TAG}-rage.png`);
      await snap(phones[0].p, `${OUT}/${TAG}-phone-rage.png`);
      log("Titan enraged; shield", rage.sh, "stomp", rage.stomp);
    }
    if (!sawWarn && t > 8 && (await phones[0].p.locator(".cph-stage.shake").count())) {
      sawWarn = true;
      await snap(proj, `${OUT}/${TAG}-warn.png`);
      await snap(phones[0].p, `${OUT}/${TAG}-phone-warn.png`);
    }
    if (shots === 0 && t > 18) {
      log("3D arena: projector", (await proj.locator("canvas.c3d").count()) ? "yes" : "no (2D)", "| phone", (await phones[0].p.locator("canvas.c3d").count()) ? "yes" : "no (2D)");
      await snap(proj, `${OUT}/${TAG}-raid.png`);
      await snap(phones[0].p, `${OUT}/${TAG}-phone-q.png`);
      shots++;
    }
    await proj.waitForTimeout(300);
  }
  await proj.waitForTimeout(2500);
  const all = await get();
  const r = all.clash?.raid;
  log("time:", Math.round((Date.now() - start) / 1000) + "s", "answers:", answered, "status:", all.game?.status);
  log("winner:", r?.winner, "titan:", r?.titan?.hp + "/" + r?.titan?.max, "stomp:", r?.stomp);
  log("raiders:", Object.values(r?.raiders || {}).map((x) => `${all.players[x.uid]?.name}:${x.hp}/${x.max}:${x.pts}pts:${x.revive}`).join(" "));
  log("result:", JSON.stringify({ ...all.clash?.result, rank: (all.clash?.result?.rank || []).slice(0, 3).map((x) => all.players[x.uid]?.name + " " + x.pts) }));
  log("best:", JSON.stringify(all.clash?.records?.best?.ms), "saw warning:", sawWarn, "saw revive:", sawRevive, "saw rage:", sawRage, "saw counter:", sawCounter);
  const kinds = [...stomps.values()];
  log("stomps:", kinds.filter((k) => k === "timed").length, "timed +", kinds.filter((k) => k === "counter").length, "counter");
  await snap(proj, `${OUT}/${TAG}-end.png`);
  await snap(phones[0].p, `${OUT}/${TAG}-phone-end.png`);
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
  await flat.close();
  if (errors.length || all.game?.status !== "ended") process.exit(1);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
