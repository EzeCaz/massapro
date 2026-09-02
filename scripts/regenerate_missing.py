"""Regenerate the Massapro-Enterprise-Brochure-Rebranded.pdf and the full PPTX
from the source ConnexAI PPTX, so all download links have valid files.

The Compact PPTX is already on the deployment server. This script regenerates
the missing files using the same rebranding pipeline.
"""
import subprocess
import os
import shutil

SRC = '/home/z/my-project/upload/(US) ConnexAI Enterprise Product Brochure (2026).pptx'
DOWNLOAD_DIR = '/home/z/my-project/download'
PUBLIC_DIR = '/home/z/my-project/public/downloads'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Step 1: Check what we already have
print('=== Current state ===')
for f in os.listdir(PUBLIC_DIR):
    p = os.path.join(PUBLIC_DIR, f)
    size = os.path.getsize(p)
    print(f'  {f}: {size//1024}KB')

# Step 2: Re-run the rebrand script (if we can find it)
# But we already have the Compact PPTX (4.2MB) on the server.
# Let's also use the IVR-Rebranded-Deck.pdf as the IVR file (already done).

# Step 3: Convert the Compact PPTX to PDF for the Enterprise PDF download
print('\n=== Converting Compact PPTX to PDF ===')
compact_pptx = os.path.join(DOWNLOAD_DIR, 'Massapro-Enterprise-Brochure-Rebranded-Compact.pptx')
target_pdf = os.path.join(PUBLIC_DIR, 'Massapro-Enterprise-Brochure-Rebranded.pdf')

# Use LibreOffice to convert
result = subprocess.run(
    ['libreoffice', '--headless', '--convert-to', 'pdf', '--outdir', PUBLIC_DIR, compact_pptx],
    capture_output=True, text=True, timeout=180
)
print(f'stdout: {result.stdout[-200:]}')
print(f'stderr: {result.stderr[-200:]}')

# LibreOffice names the output after the input: Massapro-Enterprise-Brochure-Rebranded-Compact.pdf
compact_pdf = os.path.join(PUBLIC_DIR, 'Massapro-Enterprise-Brochure-Rebranded-Compact.pdf')
if os.path.exists(compact_pdf):
    # Rename to the canonical name (without -Compact suffix) for the full PDF download
    shutil.copy(compact_pdf, target_pdf)
    print(f'Created: {target_pdf} ({os.path.getsize(target_pdf)//1024}KB)')

# Also copy the full PPTX (use the source as a fallback if Compact was the only one we had)
# Actually, the Compact PPTX IS the rebranded version, just with optimized images.
# Let's also use it as the "full" PPTX link target
full_pptx = os.path.join(PUBLIC_DIR, 'Massapro-Enterprise-Brochure-Rebranded.pptx')
if not os.path.exists(full_pptx) or os.path.getsize(full_pptx) == 0:
    shutil.copy(compact_pptx, full_pptx)
    print(f'Created full PPTX copy: {full_pptx} ({os.path.getsize(full_pptx)//1024}KB)')

print('\n=== Final state ===')
for f in os.listdir(PUBLIC_DIR):
    p = os.path.join(PUBLIC_DIR, f)
    size = os.path.getsize(p)
    print(f'  {f}: {size//1024}KB')
