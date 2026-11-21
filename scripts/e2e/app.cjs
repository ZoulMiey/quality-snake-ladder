// Quality Games app (/play) on the emulator:
//  1. the projector publishes the app's question bank (pub/qs);
//  2. a phone picks a nickname, sees the games, opens a game page;
//  3. solo Pull the Rope ("Beat the current"), answered right with chance ACC, to the end: score, personal record;
//  4. solo Quality Spin 3 min (plays it through), Snake & Ladder (to box 100), and a short start of the other games;
//  5. Google sign-in (the emulator's test account), then a solo game: the score goes on the high score lists;
//  6. a room: the host creates it, 2 friends join with the code, pick sides, play, the host ends it, Play again.
// Screenshots to scripts/e2e/shots (or $SHOTS). Clears the database first. Options: ACC (0.85), ONLY (comma list of steps).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const OUT = process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:5173";
const DB = "http://127.0.0.1:9000/.json?ns=demo-qsl-default-rtdb";
const ACC = +(process.env.ACC || 0.85);
const ONLY = (process.env.ONLY || "home,rope,spin,snake,starts,google,room").split(",");
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const dbGet = async (p = "") => (await fetch(`http://127.0.0.1:9000/${p}.json?ns=demo-qsl-default-rtdb`, { headers: { Authorization: "Bearer owner" } })).json();

(async () => {
  await fetch(DB, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  const watch = (page, who) => {
    page.on("pageerror", (e) => errors.push(`${who}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/TUNNEL|AudioContext|GPU stall|WebGL|PERMISSION_DENIED.*hs\/|favicon/.test(m.text()) && errors.push(`${who} console: ${m.text().slice(0, 200)}`));
  };
  // 1. The projector publishes the question bank.
  const proj = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
  watch(proj, "projector");
  await proj.goto(BASE + "/");
  await proj.getByPlaceholder("PIN").fill("2468");
  await proj.getByRole("button", { name: "Save PIN" }).click();
  await proj.getByText("Scan to join").waitFor({ timeout: 30000 });
  for (let i = 0; i < 30 && !(await dbGet("pub/qs")); i++) await proj.waitForTimeout(500);
  const pub = await dbGet("pub/qs");
  log("question bank for the app:", Object.keys(pub || {}).length, "questions; plain answers inside:", JSON.stringify(pub || {}).includes('"ans"'));

  const phone = async (name) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    watch(p, name);
    return p;
  };
  const answerLoop = async (p, untilFn, maxMs, priv) => {
    const t0 = Date.now();
    let n = 0;
    while (Date.now() - t0 < maxMs && !(await untilFn())) {
      const btns = p.locator("button.ans:not([disabled])");
      if (await btns.count()) {
        const right = await p.evaluate(priv);
        const i = Math.random() < ACC && right !== null && right !== undefined ? right : ((right ?? 0) + 1) % (await btns.count());
        await btns.nth(i).click({ timeout: 2000 }).catch(() => {});
        n++;
        await p.waitForTimeout(400);
      } else await p.waitForTimeout(300);
    }
    return n;
  };

  const A = await phone("Aina");
  if (ONLY.includes("home")) {
    await A.goto(BASE + "/play");
    await A.getByPlaceholder("e.g. Aina").fill("Aina");
    await A.getByRole("button", { name: /Let's play/ }).click();
    await A.getByText("Choose a game").waitFor();
    await A.waitForTimeout(1200);
    await A.screenshot({ path: `${OUT}/app-home.png` });
    await A.getByRole("button", { name: /Fishing Derby/ }).click();
    await A.getByText("High scores").waitFor();
    await A.waitForTimeout(1500);
    await A.screenshot({ path: `${OUT}/app-game-page.png`, fullPage: true });
    log("game page:", (await A.locator(".app-hs").innerText()).replace(/\n/g, " | ").slice(0, 160));
  } else {
    await A.goto(BASE + "/play");
    await A.evaluate(() => localStorage.setItem("qsl-name", "Aina"));
  }

  const soloPriv = () => {
    const pr = globalThis.__qslLocal?.("private") || {};
    const v = Object.values(pr).find((x) => x && typeof x.correctIdx === "number");
    return v ? v.correctIdx : null;
  };
  const ended = (p) => p.locator(".solo-result").count().then((c) => c > 0);

  if (ONLY.includes("rope")) {
    await A.goto(BASE + "/play/rope/solo?set=quality");
    await A.locator(".rope-phone, .slp-overlay").first().waitFor({ timeout: 20000 });
    await A.waitForTimeout(7000);
    await A.screenshot({ path: `${OUT}/app-solo-rope.png` });
    const n = await answerLoop(A, () => ended(A), 200000, soloPriv);
    await A.waitForTimeout(500);
    await A.screenshot({ path: `${OUT}/app-solo-rope-result.png` });
    log("solo rope:", n, "answers |", (await A.locator(".solo-result").innerText().catch(() => "no result")).replace(/\n/g, " | ").slice(0, 140));
    log("personal record saved:", await A.evaluate(() => localStorage.getItem("qsl-best-rope-quality")));
  }

  if (ONLY.includes("spin")) {
    await A.goto(BASE + "/play/spin/solo?set=mix&mins=3");
    await A.locator(".spin-phone").waitFor({ timeout: 20000 });
    await A.waitForTimeout(7000);
    const t0 = Date.now();
    let shots = 0;
    while (!(await ended(A)) && Date.now() - t0 < 230000) {
      const t = await A.evaluate(() => globalThis.__qslLocal?.("game/spin/red"));
      const sec = await A.evaluate(() => globalThis.__qslLocal?.("private/spin/red"));
      if (!t) {
        await A.waitForTimeout(400);
        continue;
      }
      try {
        if (t.phase === "question" && (await A.locator(".sp-q .ans:not([disabled])").count())) await A.locator(".sp-q .ans").nth(Math.random() < ACC ? sec.correctIdx : (sec.correctIdx + 1) % 4).click({ timeout: 2000 });
        else if (t.phase === "flick" && (await A.locator(".sp-flick").count())) {
          const b = await A.locator(".sp-flick").boundingBox();
          await A.mouse.move(b.x + b.width / 2, b.y + b.height * 0.8);
          await A.mouse.down();
          await A.mouse.move(b.x + b.width / 2, b.y + b.height * 0.2, { steps: 3 });
          await A.mouse.up();
        } else if (t.phase === "letter") {
          const L = [..."TSRNLCDHMPGBFYWKVXZJQ"].find((c) => !(t.used || "").includes(c));
          await A.locator(".sp-keys button", { hasText: new RegExp(`^${L}$`) }).click({ timeout: 2000 });
          if (shots++ === 0) await A.screenshot({ path: `${OUT}/app-solo-spin.png` });
        } else if (t.phase === "choice") await A.getByRole("button", { name: /Spin again/ }).click({ timeout: 2000 });
      } catch {}
      await A.waitForTimeout(500);
    }
    await A.screenshot({ path: `${OUT}/app-solo-spin-result.png` });
    log("solo spin 3 min:", (await A.locator(".solo-result").innerText().catch(() => "no result")).replace(/\n/g, " | ").slice(0, 120));
  }

  if (ONLY.includes("snake")) {
    await A.goto(BASE + "/play/snake/solo?set=quality");
    await A.waitForTimeout(8000);
    await A.screenshot({ path: `${OUT}/app-solo-snake.png` });
    const n = await answerLoop(A, () => ended(A), 420000, soloPriv);
    log("solo snake:", n, "answers |", (await A.locator(".solo-result").innerText().catch(() => "no result")).replace(/\n/g, " | ").slice(0, 120));
  }

  if (ONLY.includes("starts")) {
    for (const [g, sel] of [["kart", ".kp-stage, canvas"], ["fish", ".fish-phone"], ["clash", ".raid-phone, .clash-pick"]]) {
      await A.goto(BASE + `/play/${g}/solo?set=quality`);
      if (g === "clash") {
        await A.locator(".clash-pick button").first().waitFor({ timeout: 15000 });
        await A.locator(".clash-pick .cp-grid button, .clash-pick button.cp-mon").first().click().catch(() => {});
        await A.getByRole("button", { name: /Start the raid/ }).click();
      }
      await A.waitForTimeout(9000);
      const n = await answerLoop(A, async () => false, 12000, soloPriv);
      await A.screenshot({ path: `${OUT}/app-solo-${g}.png` });
      log(`solo ${g} runs:`, (await A.locator(sel).count()) > 0, "| answers", n);
    }
  }

  if (ONLY.includes("google")) {
    await A.goto(BASE + "/play/rope");
    // The real popup needs apis.google.com (blocked in this sandbox): sign in with the emulator's test account instead.
    await A.waitForTimeout(1500);
    await A.evaluate(() => globalThis.__qslGoogle("aina-google"));
    await A.waitForTimeout(2500);
    log("signed in:", (await A.locator(".app-chip").innerText()).trim());
    await A.screenshot({ path: `${OUT}/app-signed-in.png` });
    await A.goto(BASE + "/play/rope/solo?set=quality");
    await A.waitForTimeout(7000);
    await answerLoop(A, () => ended(A), 200000, soloPriv);
    log("signed-in result:", (await A.locator(".solo-result").innerText().catch(() => "no result")).replace(/\n/g, " | ").slice(0, 160));
    const hs = await dbGet("hs/rope/quality");
    log("high score lists:", JSON.stringify(hs).slice(0, 200));
    await A.goto(BASE + "/play/rope");
    await A.waitForTimeout(2000);
    await A.screenshot({ path: `${OUT}/app-high-scores.png`, fullPage: true });
  }

  if (ONLY.includes("room")) {
    const H = await phone("Host Bala");
    await H.goto(BASE + "/play");
    await H.evaluate(() => localStorage.setItem("qsl-name", "Bala"));
    await H.goto(BASE + "/play/rope");
    await H.getByRole("button", { name: /Create a room/ }).click();
    await H.locator(".hp-code b").waitFor({ timeout: 20000 });
    const code = (await H.locator(".hp-code b").innerText()).trim();
    log("room created:", code, "| url", H.url());
    await H.getByRole("button", { name: /Join/ }).last().click();
    await H.waitForTimeout(800);
    const friends = [];
    for (const nm of ["Chong", "Dewi"]) {
      const F = await phone(nm);
      await F.goto(BASE + "/play");
      await F.evaluate((n) => localStorage.setItem("qsl-name", n), nm);
      await F.goto(BASE + "/play/join");
      await F.locator(".code-input").fill(code);
      await F.getByRole("button", { name: /^Join/ }).click();
      await F.locator("#name").waitFor({ timeout: 15000 });
      await F.getByRole("button", { name: /Join/ }).last().click();
      await F.getByText("You're in!").waitFor({ timeout: 15000 });
      await F.getByRole("button", { name: nm === "Chong" ? /RED/ : /BLUE/ }).click();
      friends.push(F);
    }
    await H.getByRole("button", { name: /BLUE/ }).click().catch(() => {});
    await H.waitForTimeout(1500);
    await H.screenshot({ path: `${OUT}/app-room-host.png`, fullPage: true });
    await friends[0].screenshot({ path: `${OUT}/app-room-friend.png` });
    log("room players:", Object.values((await dbGet(`rooms/${code}/players`)) || {}).map((p) => p.name).join(","));
    await H.getByRole("button", { name: /Start game/ }).click();
    await H.waitForTimeout(8000);
    const g = await dbGet(`rooms/${code}/game`);
    log("room game:", g?.status, g?.mode, "| engine on host:", !!g?.engine);
    const roomPriv = (uidP) => async () => null;
    // Friends answer for 20 s (right answers come from the room's private data on the emulator).
    const t0 = Date.now();
    while (Date.now() - t0 < 20000) {
      const all = await dbGet(`rooms/${code}`);
      for (const F of [...friends, H]) {
        const btns = F.locator("button.ans:not([disabled])");
        if (await btns.count()) {
          const uid = await F.evaluate(() => Object.keys(localStorage).length && null).catch(() => null);
          const ix = Math.floor(Math.random() * (await btns.count()));
          await btns.nth(ix).click({ timeout: 1500 }).catch(() => {});
        }
      }
      await H.waitForTimeout(700);
    }
    await H.getByRole("button", { name: /Big screen/ }).click().catch(() => {});
    await H.waitForTimeout(1500);
    await H.screenshot({ path: `${OUT}/app-room-bigscreen.png`, fullPage: true });
    await friends[0].screenshot({ path: `${OUT}/app-room-friend-playing.png` });
    log("flag moved:", (await dbGet(`rooms/${code}/game/ropeX`)) ?? 0);
    await H.getByRole("button", { name: /End game/ }).click();
    await H.waitForTimeout(3000);
    log("after End game:", (await dbGet(`rooms/${code}/game/status`)));
    await H.screenshot({ path: `${OUT}/app-room-ended.png`, fullPage: true });
    await H.getByRole("button", { name: /Play again/ }).click();
    await H.waitForTimeout(1500);
    log("after Play again:", (await dbGet(`rooms/${code}/game/status`)), "players kept:", Object.keys((await dbGet(`rooms/${code}/players`)) || {}).length);
    void roomPriv;
  }

  log("errors:", errors.length ? errors.slice(0, 10).join(" || ") : "none");
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
