const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const pages_to_render = [1, 2, 5, 7, 8, 22, 28, 30];
  for (const n of pages_to_render) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const url = `file:///home/z/my-project/download/connexai_massapro_brand/slides/slide_${String(n).padStart(2, '0')}.html`;
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    const out = `/home/z/my-project/download/connexai_massapro_brand/preview/preview_${String(n).padStart(2, '0')}.png`;
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    console.log(`Rendered: ${out}`);
    await ctx.close();
  }
  await browser.close();
})();
