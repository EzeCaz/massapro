// Parallel batch VLM extraction — extracts text from slides 11-30
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Slides 11-30 in 4 parallel batches of 5
const BATCHES = [
  { name: '11_15', slides: [11, 12, 13, 14, 15] },
  { name: '16_20', slides: [16, 17, 18, 19, 20] },
  { name: '21_25', slides: [21, 22, 23, 24, 25] },
  { name: '26_30', slides: [26, 27, 28, 29, 30] },
];

const { execSync } = require('child_process');

async function runBatch(batch) {
  const args = ['-p', 'Extract ALL visible text verbatim from each slide. Include headline, body text, labels, footers, brand name. Format: Slide N: / HEADLINE: ... / BODY: ... / LABELS: ...'];
  for (const n of batch.slides) {
    args.push('-i', `/home/z/my-project/download/connexai_rebrand/preview/page-${String(n).padStart(2,'0')}.png`);
  }
  args.push('-o', `/tmp/extract_${batch.name}.json`);
  
  console.log(`Starting batch ${batch.name}...`);
  // Build CLI args
  const cmdArgs = args.map(a => a.includes(' ') && !a.startsWith('/tmp') ? `"${a}"` : a).join(' ');
  execSync(`z-ai vision ${cmdArgs}`, { stdio: 'inherit' });
  console.log(`Done batch ${batch.name}`);
}

(async () => {
  // Run batches sequentially (CLI is sync per invocation, but quick)
  for (const b of BATCHES) {
    await runBatch(b);
  }
  console.log('All batches done.');
})();
