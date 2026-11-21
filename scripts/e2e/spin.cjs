// Quality Spin, a full game: projector + N phones (default 8: 3 Red, 3 Blue, the rest watch).
// Red's second player taps "I'm the captain"; on Blue nobody does, and the host makes Blue's second player
// captain with the crown. The captains play by tapping on their phones: answer (right with chance ACC),
// swipe up to spin, pick letters (a letter in the phrase with chance SMART), buy vowels, solve (one wrong
// solve on purpose), spin again. The host pauses for 3 s, and the projector page is reloaded mid-game
// (the game must carry on). Screenshots of every moment go to scripts/e2e/shots (or $SHOTS).
// Clears the database first. Options: N, MINS (3 or 5, default 3), ACC (0.8), SMART (0.6).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const OUT = process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const N = +(process.env.N || 8);
const MINS = +(process.env.MINS || 3);
const ACC = +(process.env.ACC || 0.8);
const SMART = +(process.env.SMART || 0.6);
const NAMES = ["Aina", "Bala", "Chong", "Dewi", "Eric", "Farah", "Gopal", "Hana", "Ismail", "Jun", "Kavi", "Lina"];
const PHRASES = [...fs.readFileSync(path.join(__dirname, "../../src/spin/phrases.ts"), "utf8").matchAll(/\{ p: "([A-Z ]+)"/g)].map((m) => m[1]);
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
  const projCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  let proj = await projCtx.newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 30000 });
  await proj.getByRole("button", { name: /Quality Spin/ }).click();
  await proj.getByRole("radio", { name: new RegExp(`${MINS} minutes`) }).click();

  const phones = [];
  for (let i = 0; i < N; i++) {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : "");
    const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
    watch(p, name);
    await p.goto(BASE + "/join");
    await p.locator("#name").fill(name);
    await p.getByRole("button", { name: /Join/ }).click();
    await p.getByText("You're in!").waitFor({ timeout: 20000 });
    if (i < 6) {
      await p.getByRole("button", { name: i < 3 ? /RED/ : /BLUE/ }).click();
      await p.waitForTimeout(300);
    }
    phones.push({ name, p });
  }
  // Red: the second player taps "I'm the captain".
  await phones[1].p.getByRole("button", { name: /I'm the captain/ }).click();
  await phones[1].p.waitForTimeout(800);
  await phones[1].p.screenshot({ path: `${OUT}/spin-phone-pick-captain.png` });
  await phones[0].p.screenshot({ path: `${OUT}/spin-phone-pick-teammate.png` });
  // A 7th player tries Red (full): the button must be disabled.
  if (N > 6) log("Red full for a 7th player:", await phones[6].p.getByRole("button", { name: /RED/ }).isDisabled());
  // Blue: the host makes the second Blue player captain with the crown.
  await proj.locator(".cr-col.blue .spin-chip").nth(1).locator("button.crown").click();
  await proj.waitForTimeout(800);
  await proj.screenshot({ path: `${OUT}/spin-lobby.png` });
  let all = await dbGet();
  log("picks:", JSON.stringify(Object.fromEntries(Object.entries(all.clash.pick).map(([u, v]) => [all.players[u].name, `${v.side}${(v.c || []).includes("cap") ? " 👑" : ""}`]))));
  await proj.getByRole("button", { name: "▶ Start game" }).click();
  await phones[1].p.waitForTimeout(1500);
  await phones[1].p.screenshot({ path: `${OUT}/spin-phone-countdown.png` });
  await proj.screenshot({ path: `${OUT}/spin-projector-countdown.png` });
  all = await dbGet();
  const sp = all.game.spin;
  const nameOf = (u) => all.players[u]?.name;
  log("teams:", "red", sp.red.members.map(nameOf).join(","), "captain", nameOf(sp.red.captain), "| blue", sp.blue.members.map(nameOf).join(","), "captain", nameOf(sp.blue.captain));
  if (nameOf(sp.red.captain) !== phones[1].name || nameOf(sp.blue.captain) !== phones[4].name) errors.push("wrong captains");

  const captainPhone = { red: phones[1], blue: phones[4] };
  const want = new Set(["question", "flick", "spinning", "letter", "choice", "vowel", "solve", "stun", "solved", "kaizen", "teammate", "watcher"]);
  const projWant = new Set(["question", "spinning", "hit", "defect", "kaizen", "solve", "wrongsolve", "stun", "final", "letter"]);
  const events = {};
  const acted = { red: "", blue: "" };
  let wrongSolveDone = false;
  let paused = false;
  let reloaded = false;
  const t0 = Date.now();
  let ended = false;
  while (!ended && Date.now() - t0 < (MINS * 60 + 120) * 1000 && !errors.length) {
    all = await dbGet();
    const g = all.game || {};
    if (g.status === "ended") {
      ended = true;
      break;
    }
    if (!g.spin || (g.goAt && Date.now() < g.goAt)) {
      await proj.waitForTimeout(300);
      continue;
    }
    const el = Date.now() - g.goAt;
    // Host pause for 3 s at 0:40.
    if (!paused && el > 40000) {
      paused = true;
      const before = g.endsAt;
      await proj.getByRole("button", { name: /Pause/ }).click();
      await proj.waitForTimeout(3000);
      await proj.screenshot({ path: `${OUT}/spin-projector-paused.png` });
      await proj.getByRole("button", { name: /Resume/ }).click();
      await proj.waitForTimeout(800);
      const after = (await dbGet()).game.endsAt;
      log("pause moved the end by", ((after - before) / 1000).toFixed(1), "s");
      continue;
    }
    // Reload the projector at 1:10: the game must carry on.
    if (!reloaded && el > 70000) {
      reloaded = true;
      await proj.reload();
      await proj.waitForTimeout(2500);
      const s2 = (await dbGet()).game;
      log("projector reloaded; engine still this window:", s2.engine === g.engine, "status", s2.status);
      continue;
    }
    for (const side of ["red", "blue"]) {
      const t = g.spin[side];
      const sec = all.private?.spin?.[side] || {};
      const phrase = PHRASES[sec.phrase] ?? "";
      if (t.last && !events[`${side}-${t.last.at}`]) {
        events[`${side}-${t.last.at}`] = true;
        events[t.last.k] = (events[t.last.k] || 0) + 1;
        log(side, t.last.k, t.last.L ?? "", t.last.pts ?? "", t.last.mult > 1 ? `×${t.last.mult}` : "", "| score", t.score, "| board", t.board);
        if (projWant.has(t.last.k)) {
          projWant.delete(t.last.k);
          await proj.waitForTimeout(250);
          await proj.screenshot({ path: `${OUT}/spin-projector-${t.last.k}.png` });
        }
      }
      const ph = captainPhone[side];
      const key = `${t.phase}-${t.seq}`;
      if (side === "red" && want.has(t.phase === "stun" ? "stun" : t.phase === "solved" ? "solved" : "-")) {
        const k = t.phase;
        want.delete(k);
        await ph.p.waitForTimeout(300);
        await ph.p.screenshot({ path: `${OUT}/spin-phone-${k}.png` });
      }
      if (side === "red" && t.last?.k === "kaizen" && t.phase === "flick" && want.has("kaizen")) {
        want.delete("kaizen");
        await ph.p.screenshot({ path: `${OUT}/spin-phone-kaizen.png` });
      }
      if (projWant.has(t.phase) && (t.phase === "question" || t.phase === "spinning" || t.phase === "stun" || t.phase === "letter")) {
        projWant.delete(t.phase);
        await proj.waitForTimeout(t.phase === "spinning" ? 1200 : 300);
        await proj.screenshot({ path: `${OUT}/spin-projector-${t.phase}.png` });
      }
      if (acted[side] === key) continue;
      try {
        if (t.phase === "question" && t.q) {
          const right = Math.random() < ACC;
          await ph.p.waitForTimeout(600 + Math.random() * 1500);
          if (side === "red" && want.has("question")) {
            want.delete("question");
            await ph.p.screenshot({ path: `${OUT}/spin-phone-question.png` });
            if (want.has("teammate")) {
              want.delete("teammate");
              await phones[0].p.screenshot({ path: `${OUT}/spin-phone-teammate.png` });
            }
            if (N > 6 && want.has("watcher")) {
              want.delete("watcher");
              await phones[6].p.screenshot({ path: `${OUT}/spin-phone-watcher.png` });
            }
          }
          const idx = right ? sec.correctIdx : (sec.correctIdx + 1) % (t.q.opts?.length || 4);
          await ph.p.locator(".sp-q .ans").nth(idx).click({ timeout: 4000 });
          acted[side] = key;
        } else if (t.phase === "flick") {
          const pad = ph.p.locator(".sp-flick");
          await pad.waitFor({ timeout: 4000 });
          if (side === "red" && want.has("flick")) {
            want.delete("flick");
            await ph.p.screenshot({ path: `${OUT}/spin-phone-flick.png` });
          }
          const b = await pad.boundingBox();
          await ph.p.mouse.move(b.x + b.width / 2, b.y + b.height * 0.8);
          await ph.p.mouse.down();
          await ph.p.mouse.move(b.x + b.width / 2, b.y + b.height * 0.2, { steps: 3 });
          await ph.p.mouse.up();
          acted[side] = key;
          if (side === "red" && want.has("spinning")) {
            await ph.p.waitForTimeout(900);
            want.delete("spinning");
            await ph.p.screenshot({ path: `${OUT}/spin-phone-spinning.png` });
          }
        } else if (t.phase === "letter") {
          const left = [..."BCDFGHJKLMNPQRSTVWXYZ"].filter((c) => !(t.used || "").includes(c));
          const good = left.filter((c) => phrase.includes(c));
          const L = good.length && Math.random() < SMART ? good[0] : left[Math.floor(Math.random() * left.length)];
          await ph.p.waitForTimeout(500 + Math.random() * 1000);
          if (side === "red" && want.has("letter")) {
            want.delete("letter");
            await ph.p.screenshot({ path: `${OUT}/spin-phone-letter.png` });
          }
          await ph.p.locator(".sp-keys button", { hasText: new RegExp(`^${L}$`) }).click({ timeout: 4000 });
          acted[side] = key;
        } else if (t.phase === "choice") {
          await ph.p.waitForTimeout(500);
          if (side === "red" && want.has("choice")) {
            want.delete("choice");
            await ph.p.screenshot({ path: `${OUT}/spin-phone-choice.png` });
          }
          const letters = phrase.replace(/ /g, "");
          const shown = [...letters].filter((c) => (t.used || "").includes(c)).length / letters.length;
          const vowels = [..."AEIOU"].filter((v) => !(t.used || "").includes(v));
          if (shown >= 0.55) {
            const wrong = !wrongSolveDone && side === "blue";
            await ph.p.getByRole("button", { name: /Solve the puzzle/ }).click();
            await ph.p.locator(".sp-solve input").fill(wrong ? "ZERO EFFECT" : phrase.toLowerCase());
            if (side === "red" && want.has("solve")) {
              want.delete("solve");
              await ph.p.screenshot({ path: `${OUT}/spin-phone-solve.png` });
            }
            await ph.p.getByRole("button", { name: /Submit/ }).click();
            if (wrong) wrongSolveDone = true;
          } else if (t.score >= 300 && vowels.length && Math.random() < 0.45) {
            await ph.p.getByRole("button", { name: /Buy a vowel/ }).click();
            const v = vowels.find((x) => phrase.includes(x)) && Math.random() < 0.7 ? vowels.find((x) => phrase.includes(x)) : vowels[0];
            if (side === "red" && want.has("vowel")) {
              want.delete("vowel");
              await ph.p.waitForTimeout(300);
              await ph.p.screenshot({ path: `${OUT}/spin-phone-vowel.png` });
            }
            await ph.p.locator(".sp-keys button", { hasText: new RegExp(`^${v}$`) }).click({ timeout: 4000 });
          } else await ph.p.getByRole("button", { name: /Spin again/ }).click();
          acted[side] = key;
        }
      } catch (e) {
        log(side, "action failed in", t.phase, "-", e.message.split("\n")[0]);
        acted[side] = key;
      }
    }
    if (projWant.has("final") && g.endsAt - Date.now() < 8000) {
      projWant.delete("final");
      await proj.screenshot({ path: `${OUT}/spin-projector-final.png` });
    }
    await proj.waitForTimeout(250);
  }
  await proj.waitForTimeout(2500);
  all = await dbGet();
  const s = all.game.spin;
  log("status", all.game.status, "| champion", s.champion, "| red", s.red.score, `(${s.red.solved} solved)`, "| blue", s.blue.score, `(${s.blue.solved} solved)`, "| winners", (all.game.winners || []).map((u) => all.players[u]?.name).join(","));
  log("events:", JSON.stringify(Object.fromEntries(Object.entries(events).filter(([k]) => !k.includes("-")))));
  await proj.screenshot({ path: `${OUT}/spin-projector-podium.png` });
  await phones[1].p.screenshot({ path: `${OUT}/spin-phone-end.png` });
  if (N > 6) await phones[6].p.screenshot({ path: `${OUT}/spin-phone-watcher-end.png` });
  log("phone shots missing:", [...want].join(",") || "none", "| projector shots missing:", [...projWant].join(",") || "none");
  log("errors:", errors.length ? errors.slice(0, 8).join(" || ") : "none");
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
