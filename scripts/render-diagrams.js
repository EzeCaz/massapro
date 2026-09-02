#!/usr/bin/env node
// Render diagram HTMLs to PNG at 2x scale for embedding in ReportLab PDF
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const targets = [
    { html: 'arch-diagram.html', png: 'arch-diagram.png', width: 1400 },
    { html: 'module-map.html', png: 'module-map.png', width: 1400 },
    { html: 'arch-dataflow.html', png: 'arch-dataflow.png', width: 1500 },
  ];
  for (const t of targets) {
    const ctx = await browser.newContext({
      viewport: { width: t.width, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    const fileUrl = 'file://' + path.resolve(__dirname, t.html);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    // Allow web fonts to settle
    await page.waitForTimeout(800);
    // Find the .diagram element and screenshot just it
    const el = await page.$('.diagram');
    if (el) {
      await el.screenshot({ path: t.png });
      console.log(`✓ ${t.png}`);
    } else {
      await page.screenshot({ path: t.png, fullPage: true });
      console.log(`✓ ${t.png} (full page)`);
    }
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
