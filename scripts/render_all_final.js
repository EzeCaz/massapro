const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (let n = 1; n <= 30; n++) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const num = String(n).padStart(2, '0');
    const url = `file:///home/z/my-project/download/connexai_massapro_brand/slides/slide_${num}.html`;
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const out = `/home/z/my-project/download/connexai_massapro_brand/preview/preview_${num}.png`;
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    process.stdout.write(`${num} `);
    await ctx.close();
  }
  console.log('\nDone');
  await browser.close();
})();
