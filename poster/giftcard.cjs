// Renders giftcard.html to out/giftcard-egames-no1.png (print quality) and .pdf (card size 170 x 100 mm).
const { chromium } = require("playwright");
const dir = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${dir}/giftcard.html`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.locator(".card").screenshot({ path: `${dir}/out/giftcard-egames-no1.png`, omitBackground: true });
  await p.pdf({ path: `${dir}/out/giftcard-egames-no1.pdf`, width: "170mm", height: "100mm", printBackground: true, scale: 170 / 1700 * 3.7795, pageRanges: "1", margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await b.close();
})();
