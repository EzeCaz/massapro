const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const n of [9, 14, 30]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const num = String(n).padStart(2, '0');
    await p.goto(`file:///home/z/my-project/download/connexai_massapro_brand/slides/slide_${num}.html`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    await p.screenshot({ path: `/home/z/my-project/download/connexai_massapro_brand/preview/preview_${num}.png`, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    console.log(`Rendered: ${num}`);
    await ctx.close();
  }
  await browser.close();
})();
