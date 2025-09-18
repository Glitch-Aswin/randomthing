const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('http://localhost:3001');
  // wait for crossword to render
  await page.waitForSelector('[data-key="5-0"]');
  const el = await page.$('[data-key="5-0"]');
  const box = await el.boundingBox();
  console.log('boundingBox:', box);
  await page.screenshot({ path: 'cell-5-0-412.png', fullPage: false });
  console.log('screenshot saved: cell-5-0-412.png');
  await browser.close();
})();
