const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('file:///home/z/my-project/download/connexai_massapro_brand/slides/slide_28.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/home/z/my-project/download/connexai_massapro_brand/preview/preview_28.png', clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Rendered slide 28');
  await browser.close();
})();
