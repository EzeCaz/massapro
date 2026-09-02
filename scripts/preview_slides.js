// Render a few HTML slides to PNG for visual verification
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page_nums = [1, 2, 5, 10, 17, 20, 30];
  const out_dir = '/home/z/my-project/download/rebranded_slides/preview';
  require('fs').mkdirSync(out_dir, { recursive: true });

  for (const n of page_nums) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const url = 'file:///home/z/my-project/download/rebranded_slides/slide_' + String(n).padStart(2, '0') + '.html';
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const out = path.join(out_dir, 'preview_' + String(n).padStart(2, '0') + '.png');
    await p.screenshot({ path: out, fullPage: false, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    console.log('Rendered', out);
    await ctx.close();
  }
  await browser.close();
})();
