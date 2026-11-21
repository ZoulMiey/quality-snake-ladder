// Fishing Derby, a full 5-minute game: projector + N phones (default 4), phones with the side-view pond.
// Bots answer after 2–6 s, right with
// chance ACC (default 0.8). Screenshots: lobby, countdown ("You are"), question, BIG/GOLDEN/SNAP alerts,
// frenzy, projector zoom (1–8 players) or notice cards (9+), podium and the phone's end screen.
// Clears the database first. Options: N, ACC.
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const N = +(process.env.N || 4);
const ACC = +(process.env.ACC || 0.8);
const NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah", "Gopal", "Hana", "Ismail", "Jun", "Kavi", "Lina", "Mei", "Nizam", "Omar", "Priya", "Qistina", "Raj", "Siti", "Tan"];
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const dbGet = async () => (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL|AudioContext|GPU stall|WebGL/.test(m.text()) && errors.push(`${who} console: ${m.text()}`));
  };
  const proj = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 20000 });
  await proj.getByRole("button", { name: /Fishing Derby/ }).click();

  const phones = [];
  for (let i = 0; i < N; i++) {
    const name = NAMES[i % 20] + (i >= 20 ? ` ${Math.floor(i / 20) + 1}` : "");
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 15000 });
    phones.push({ name, p, shots: new Set() });
  }
  log(N, "joined");
  await proj.waitForTimeout(600);
  await proj.screenshot({ path: `${OUT}/fish-lobby.png` });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  await phones[0].p.waitForTimeout(1500);
  await phones[0].p.screenshot({ path: `${OUT}/fish-phone-countdown.png` });
  log("countdown:", (await phones[0].p.locator(".cd-you").innerText().catch(() => "-")).replace(/\n/g, " "));

  const want = new Set(["question", "big", "gold", "snap", "frenzy", "leap", "toast", "soon", "final", "over"]);
  const projWant = new Set([N <= 8 ? "zoom" : "cards", "frenzy", "game", "soon", "final"]);
  // "over": a SNAP! alert with the countdown pill still on top (phone 1 answers wrong during a countdown).
  const domShots = { toast: ".fp-toast", soon: ".fp-soon", final: ".fp-final", over: ".fp-msgs.over .fp-soon, .fp-msgs.over .fp-final" };
  const seen = {};
  const t0 = Date.now();
  let ended = false;
  let answers = 0;
  let clickErr = "";
  while (!ended && Date.now() - t0 < 340000 && !errors.length) {
    const all = await dbGet();
    if (all.game?.status === "ended") ended = true;
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph, idx) => {
        const uid = byName[ph.name];
        const st = all.state?.[uid];
        if (!st) return;
        // Screenshots of phone 1 (3D).
        if (idx === 0) {
          const alertEl = ph.p.locator(".slp-alert");
          const alertCls = (await alertEl.count()) ? await alertEl.first().getAttribute("class", { timeout: 500 }).catch(() => null) : null;
          for (const [k, cls] of [["big", "fa-big"], ["gold", "fa-gold"], ["snap", "fa-snap"], ["frenzy", "fa-frenzy"]])
            if (alertCls && alertCls.includes(cls) && want.has(k)) {
              want.delete(k);
              await ph.p.screenshot({ path: `${OUT}/fish-phone-${k}.png` });
              log("phone shot", k);
              if (k === "big" || k === "gold") ph.leapAt = Date.now() + 1700;
            }
          for (const [k, sel] of Object.entries(domShots))
            if (want.has(k) && (await ph.p.locator(sel).count())) {
              want.delete(k);
              await ph.p.screenshot({ path: `${OUT}/fish-phone-${k}.png` });
              log("phone shot", k, "|", (await ph.p.locator(sel).first().innerText().catch(() => "")).replace(/\n/g, " "));
            }
          if (ph.leapAt && Date.now() > ph.leapAt && want.has("leap")) {
            want.delete("leap");
            await ph.p.screenshot({ path: `${OUT}/fish-phone-leap.png` });
            log("phone shot leap");
          }
        }
        if (st.phase !== "question") return;
        const key = `${uid}-${st.seq}`;
        seen[key] ??= Date.now() + 2000 + Math.random() * 4000;
        if (Date.now() < seen[key]) return;
        const btns = ph.p.locator("button.ans:not([disabled])");
        const n = await btns.count();
        if (!n) return;
        if (idx === 0 && want.has("question")) {
          want.delete("question");
          await ph.p.screenshot({ path: `${OUT}/fish-phone-question.png` });
          log("phone shot question");
        }
        const right = all.private?.[uid]?.correctIdx ?? 0;
        const miss = idx === 0 && want.has("over") && (await ph.p.locator(".fp-soon, .fp-final").count()) > 0;
        await btns
          .nth(!miss && Math.random() < ACC ? right : (right + 1) % n)
          .click({ timeout: 8000 })
          .then(() => answers++)
          .catch((e) => {
            if (!clickErr) log((clickErr = `${ph.name} click failed: ${e.message.split("\n")[0]}`));
          });
      }),
    );
    // Projector shots.
    const el = Date.now() - t0;
    if (projWant.has("game") && el > 30000) {
      projWant.delete("game");
      await proj.screenshot({ path: `${OUT}/fish-projector-game.png` });
    }
    if (projWant.has("frenzy") && el > 70000) {
      projWant.delete("frenzy");
      await proj.screenshot({ path: `${OUT}/fish-projector-frenzy.png` });
      log("projector frenzy chip:", await proj.locator(".fh-frenzy").innerText().catch(() => "-"));
    }
    for (const k of ["soon", "final"])
      if (projWant.has(k) && (await proj.locator(`.fish-bigmsg.${k}`).count())) {
        projWant.delete(k);
        await proj.screenshot({ path: `${OUT}/fish-projector-${k}.png` });
      }
    if (projWant.has("cards") && (await proj.locator(".fish-card").count())) {
      projWant.delete("cards");
      await proj.screenshot({ path: `${OUT}/fish-projector-cards.png` });
    }
    if (projWant.has("zoom") && all.feed && Object.values(all.feed).some((f) => f && (f.k === "big" || f.k === "gold") && Date.now() - 0 > 0 && f.at > (all.game?.goAt ?? 0))) {
      const lastBig = Object.values(all.feed).filter((f) => f && (f.k === "big" || f.k === "gold")).length;
      if (lastBig) {
        await proj.waitForTimeout(1500);
        projWant.delete("zoom");
        await proj.screenshot({ path: `${OUT}/fish-projector-zoom.png` });
      }
    }
    await proj.waitForTimeout(300);
  }
  log("answers:", answers, "ended:", ended, "phone shots missing:", [...want].join(",") || "none", "projector shots missing:", [...projWant].join(",") || "none");
  await proj.waitForTimeout(2500);
  await proj.screenshot({ path: `${OUT}/fish-projector-podium.png` });
  await phones[0].p.screenshot({ path: `${OUT}/fish-phone-end.png` });
  const all = await dbGet();
  const rows = Object.entries(all.state || {}).map(([u, s]) => [all.players[u]?.name, s.kg, s.fish, s.big, s.gold, s.correct + "/" + s.answered, s.rank]);
  rows.sort((a, b) => a[6] - b[6]);
  log("results [name, kg, fish, big, gold, right, rank]:", JSON.stringify(rows));
  log("winners:", JSON.stringify((all.game?.winners || []).map((u) => all.players[u]?.name)));
  log("podium text:", (await proj.locator(".podium").innerText().catch(() => "-")).replace(/\n/g, " | ").slice(0, 200));
  log("errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
  if (errors.length || !ended) process.exit(1);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
