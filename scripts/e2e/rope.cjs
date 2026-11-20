// Pull the Rope, a full best-of-3 match: projector + N phones (default 8).
// Phones pick sides (every 4th player leaves it to the game; the host moves one player from Blue to Red).
// Round 1: both teams answer right with chance ACC (default 0.75), so it runs into HEAVE! at 1:00.
// Round 2: the team that lost round 1 answers well (ACC_BLUE 0.95 v ACC_RED 0.4), so the match goes to 1–1;
// round 3: Blue answers well and pulls Red into the river.
// Between rounds every phone presses READY (after round 2 the last phone does not, and the host presses
// "Start round now"), then the 5-second countdown and "ROUND N".
// Screenshots of every moment go to scripts/e2e/shots (or $SHOTS). Clears the database first.
// Options: N, ACC, ACC_RED, ACC_BLUE, R1_SECS (how long round 1 is played evenly, default 75).
const { chromium } = require("playwright");
const OUT = process.env.SHOTS || require("path").join(__dirname, "shots");
require("fs").mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const N = +(process.env.N || 8);
const ACC = +(process.env.ACC || 0.75);
const ACC_RED = +(process.env.ACC_RED || 0.4);
const ACC_BLUE = +(process.env.ACC_BLUE || 0.95);
const R1_SECS = +(process.env.R1_SECS || 75);
const NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah", "Gopal", "Hana", "Ismail", "Jun", "Kavi", "Lina", "Mei", "Nizam", "Omar", "Priya", "Qistina", "Raj", "Siti", "Tan"];
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const dbGet = async () => (await fetch(DB, { headers: { Authorization: "Bearer owner" } })).json();

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
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
  await proj.getByText("Scan to join").waitFor({ timeout: 30000 });
  await proj.screenshot({ path: `${OUT}/rope-lobby-list.png` });
  await proj.getByRole("button", { name: /Pull the Rope/ }).click();

  const phones = [];
  for (let i = 0; i < N; i++) {
    const name = NAMES[i % 20] + (i >= 20 ? ` ${Math.floor(i / 20) + 1}` : "");
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 20000 });
    if (i % 4 !== 3) await p.getByRole("button", { name: i % 2 ? /BLUE/ : /RED/ }).click();
    phones.push({ name, p });
  }
  await phones[0].p.waitForTimeout(800);
  await phones[0].p.screenshot({ path: `${OUT}/rope-phone-pick.png` });
  log(N, "joined and picked");
  // The host moves the first Blue player to Red.
  const move = proj.locator(".cr-col.blue .rope-chip button").first();
  if (await move.count()) {
    await move.click();
    log("host moved a player from Blue to Red");
  }
  await proj.waitForTimeout(800);
  await proj.screenshot({ path: `${OUT}/rope-lobby.png` });
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  await phones[0].p.waitForTimeout(1500);
  await phones[0].p.screenshot({ path: `${OUT}/rope-phone-countdown.png` });
  log("countdown:", (await phones[0].p.locator(".slp-overlay").innerText().catch(() => "-")).replace(/\n/g, " "));
  await proj.screenshot({ path: `${OUT}/rope-projector-countdown.png` });
  let all = await dbGet();
  const teams = all.game.rope.teams;
  const count = { red: 0, blue: 0 };
  Object.values(teams).forEach((s) => count[s]++);
  log("teams at start:", JSON.stringify(count), "order red:", all.game.rope.order.red.length, "blue:", all.game.rope.order.blue.length);

  const want = new Set(["question", "toast", "wrong", "heave", "soon", "break", "river", "ready", "count", "go"]);
  const projWant = new Set(["game", "splash", "soon", "heave", "round", "final", "count", "go"]);
  const readyAt = {};
  let hostPressed = false;
  const seen = {};
  const t0 = Date.now();
  let ended = false;
  let answers = 0;
  let clickErr = "";
  let lastRound = 1;
  let maxX = 0;
  while (!ended && Date.now() - t0 < 900000 && !errors.length) {
    all = await dbGet();
    const g = all.game || {};
    if (g.status === "ended") ended = true;
    const rope = g.rope || {};
    if (rope.round !== lastRound) {
      log("round", rope.round, "wins", JSON.stringify(rope.wins), "last", JSON.stringify(rope.last));
      lastRound = rope.round;
    }
    maxX = Math.max(maxX, Math.abs(g.ropeX || 0));
    const even = rope.round === 1 && Date.now() - t0 < R1_SECS * 1000 + 6000;
    const byName = Object.fromEntries(Object.entries(all.players || {}).map(([u, v]) => [v.name, u]));
    await Promise.all(
      phones.map(async (ph, idx) => {
        const uid = byName[ph.name];
        const st = all.state?.[uid];
        if (!st) return;
        if (idx === 0) {
          for (const [k, sel] of [
            ["toast", ".rp-toast"],
            ["wrong", ".slp-alert.a-bad"],
            ["heave", ".rp-heave, .rp-heave-alert"],
            ["soon", ".rp-soon"],
            ["break", ".rp-break"],
          ])
            if (want.has(k) && (await ph.p.locator(sel).count())) {
              want.delete(k);
              await ph.p.screenshot({ path: `${OUT}/rope-phone-${k}.png` });
              log("phone shot", k, "|", (await ph.p.locator(sel).first().innerText().catch(() => "")).replace(/\n/g, " ").slice(0, 90));
            }
          if (want.has("river") && Math.abs(g.ropeX || 0) > 0.35) {
            want.delete("river");
            await ph.p.locator(".slp-mapbtn").click().catch(() => {});
            await ph.p.waitForTimeout(600);
            await ph.p.screenshot({ path: `${OUT}/rope-phone-river.png` });
            await ph.p.locator(".slp-mapbtn").click().catch(() => {});
            log("phone shot river, flag", g.ropeX);
          }
        }
        // Between rounds: press READY after 1–4 s (after round 2 the last phone waits for the host).
        if (rope.phase === "break" && !rope.breakUntil) {
          const btn = ph.p.locator("button.rp-ready");
          if (!(await btn.count())) return;
          if (idx === phones.length - 1 && rope.round === 2) return;
          readyAt[`${uid}-${rope.round}`] ??= Date.now() + 1000 + Math.random() * 3000;
          if (Date.now() < readyAt[`${uid}-${rope.round}`]) return;
          await btn.click({ timeout: 5000 }).catch(() => {});
          if (idx === 0 && want.has("ready")) {
            want.delete("ready");
            await ph.p.waitForTimeout(400);
            await ph.p.screenshot({ path: `${OUT}/rope-phone-ready.png` });
            log("phone shot ready |", (await ph.p.locator(".rp-break").innerText().catch(() => "")).replace(/\n/g, " ").slice(0, 120));
          }
          return;
        }
        if (idx === 0 && rope.phase === "break" && rope.breakUntil) {
          const k = (await ph.p.locator(".rp-count.go").count()) ? "go" : (await ph.p.locator(".rp-count").count()) ? "count" : "";
          if (k && want.has(k)) {
            want.delete(k);
            await ph.p.screenshot({ path: `${OUT}/rope-phone-${k}.png` });
            log("phone shot", k, "|", (await ph.p.locator(".rp-count").innerText().catch(() => "")).replace(/\n/g, " "));
          }
        }
        if (st.phase !== "question") return;
        const key = `${uid}-${st.seq}`;
        seen[key] ??= Date.now() + 1500 + Math.random() * 4000;
        if (Date.now() < seen[key]) return;
        const btns = ph.p.locator("button.ans:not([disabled])");
        const n = await btns.count();
        if (!n) return;
        if (idx === 0 && want.has("question")) {
          want.delete("question");
          await ph.p.screenshot({ path: `${OUT}/rope-phone-question.png` });
          log("phone shot question");
        }
        // Round 2 goes to the team that lost round 1, so there is always a round 3 (and a break after round 2).
        const fav = rope.round === 2 && rope.last?.win === "blue" ? "red" : "blue";
        const acc = even ? ACC : teams[uid] === fav ? ACC_BLUE : ACC_RED;
        const right = all.private?.[uid]?.correctIdx ?? 0;
        await btns
          .nth(Math.random() < acc ? right : (right + 1) % n)
          .click({ timeout: 8000 })
          .then(() => answers++)
          .catch((e) => {
            if (!clickErr) log((clickErr = `${ph.name} click failed: ${e.message.split("\n")[0]}`));
          });
      }),
    );
    const el = Date.now() - t0;
    if (projWant.has("game") && el > 25000) {
      projWant.delete("game");
      await proj.screenshot({ path: `${OUT}/rope-projector-game.png` });
    }
    if (projWant.has("splash") && Math.abs(g.ropeX || 0) > 0.3 && rope.phase === "play") {
      projWant.delete("splash");
      await proj.waitForTimeout(400);
      await proj.screenshot({ path: `${OUT}/rope-projector-splash.png` });
      log("projector splash shot, flag", g.ropeX);
    }
    for (const [k, sel] of [
      ["soon", ".fish-bigmsg.soon"],
      ["final", ".fish-bigmsg.final"],
      ["heave", ".fh-frenzy.heave"],
    ])
      if (projWant.has(k) && (await proj.locator(sel).count())) {
        projWant.delete(k);
        await proj.screenshot({ path: `${OUT}/rope-projector-${k}.png` });
        log("projector shot", k);
      }
    if (rope.phase === "break" && !rope.breakUntil && rope.round === 2 && !hostPressed) {
      const others = Object.keys(rope.teams).filter((u) => !(rope.ready || {})[u]);
      if (others.length === 1) {
        await proj.waitForTimeout(2000);
        await proj.screenshot({ path: `${OUT}/rope-projector-ready.png` });
        log("projector waiting:", (await proj.locator(".rr-ready").innerText().catch(() => "")).replace(/\n/g, " "));
        await proj.getByRole("button", { name: "▶ Start round now" }).click();
        hostPressed = true;
        log("host pressed Start round now");
      }
    }
    for (const k of ["count", "go"]) {
      const sel = k === "go" ? ".rope-count.go" : ".rope-count";
      if (projWant.has(k) && (await proj.locator(sel).count()) && (k === "go" || !(await proj.locator(".rope-count.go").count()))) {
        projWant.delete(k);
        await proj.screenshot({ path: `${OUT}/rope-projector-${k}.png` });
        log("projector shot", k, "|", (await proj.locator(".rope-count").innerText().catch(() => "")).replace(/\n/g, " "));
      }
    }
    if (projWant.has("round") && (await proj.locator(".rope-round").count())) {
      projWant.delete("round");
      await proj.waitForTimeout(2500);
      await proj.screenshot({ path: `${OUT}/rope-projector-round.png` });
      log("projector round banner:", (await proj.locator(".rope-round").innerText().catch(() => "")).replace(/\n/g, " "));
    }
    await proj.waitForTimeout(300);
  }
  log("answers:", answers, "ended:", ended, "max |flag|:", maxX.toFixed(2), "phone shots missing:", [...want].join(",") || "none", "projector shots missing:", [...projWant].join(",") || "none");
  await proj.waitForTimeout(3000);
  await proj.screenshot({ path: `${OUT}/rope-projector-podium.png` });
  await phones[0].p.screenshot({ path: `${OUT}/rope-phone-end.png` });
  all = await dbGet();
  log("final:", JSON.stringify(all.game?.rope?.wins), "champion", all.game?.rope?.champion, "MVP", all.players?.[all.game?.winners?.[0]]?.name);
  const rows = Object.entries(all.state || {}).map(([u, s]) => [all.players[u]?.name, s.side, s.correct + "/" + s.answered, s.fastest, s.bestStreak, s.pulled]);
  console.table(rows);
  if (errors.length) {
    console.log("ERRORS:\n" + errors.slice(0, 20).join("\n"));
    process.exitCode = 1;
  }
  await browser.close();
})();
