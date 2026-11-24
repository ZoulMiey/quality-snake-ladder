// Renders letter-cards.html to out/do-you-remember-letter-cards.pdf (+ a preview PNG of page 1 and the answer sheet).
const { chromium } = require("playwright");
const dir = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`file://${dir}/letter-cards.html`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.pdf({ path: `${dir}/out/do-you-remember-letter-cards.pdf`, format: "A4", printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await p.setViewportSize({ width: 794, height: 1123 });
  await p.locator("section").first().screenshot({ path: `${dir}/out/cards-preview-page1.png` });
  await p.locator("section.ans").screenshot({ path: `${dir}/out/cards-preview-answers.png` });
  await b.close();
})();
