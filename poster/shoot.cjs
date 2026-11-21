const { chromium } = require("playwright");
const fs = require("fs");
const dir = process.argv[2], mode = process.argv[3] || "check"; // check | png | gif
const LOOP = 2400, FPS = 12;
(async () => {
  const b = await chromium.launch();
  for (const [hash, w, h, out] of [["badges", 1240, 1754, "poster-A4"], ["land,badges", 1920, 1080, "poster-wide"]]) {
    const dsf = mode === "png" ? 2 : 1;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    await p.goto(`file://${dir}/poster.html#${hash}`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    const at = (t) => p.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), t);
    if (mode !== "gif") {
      await at(600);
      await p.locator("#poster").screenshot({ path: `${dir}/out/${out}${mode === "check" ? "-check" : ""}.png` });
    } else {
      fs.mkdirSync(`${dir}/out/frames-${out}`, { recursive: true });
      const n = Math.round((LOOP / 1000) * FPS);
      for (let i = 0; i < n; i++) {
        await at((i * LOOP) / n);
        await p.locator("#poster").screenshot({ path: `${dir}/out/frames-${out}/f${String(i).padStart(3, "0")}.png` });
      }
    }
    await p.close();
  }
  await b.close();
})();
