"""Merge cover.pdf + body.pdf into the final manual PDF."""
import sys
from pypdf import PdfReader, PdfWriter, Transformation

A4_W, A4_H = 595.28, 841.89

def normalize_to_a4(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 2 or abs(h - A4_H) > 2:
        sx, sy = A4_W / w, A4_H / h
        # Use uniform scale (smaller of two) to preserve aspect ratio
        s = min(sx, sy)
        page.add_transformation(Transformation().scale(sx=s, sy=s))
        page.mediabox.lower_left = (0, 0)
        page.mediabox.upper_right = (A4_W, A4_H)
    return page

cover = '/home/z/my-project/scripts/cover.pdf'
body  = '/home/z/my-project/scripts/body.pdf'
out   = '/home/z/my-project/download/Massapro-AI-Technical-Manual.pdf'

writer = PdfWriter()
# Cover
cover_page = PdfReader(cover).pages[0]
writer.add_page(normalize_to_a4(cover_page))
# Body
for page in PdfReader(body).pages:
    writer.add_page(normalize_to_a4(page))

writer.add_metadata({
    '/Title': 'MassaPro AI Omni-Channel Platform — Technical & Integration Manual',
    '/Author': 'MassaPro',
    '/Creator': 'MassaPro',
    '/Subject': 'Technical and integration reference for MassaPro AI platform integrators',
})

with open(out, 'wb') as f:
    writer.write(f)

reader = PdfReader(out)
print(f'Merged PDF: {out}')
print(f'Total pages: {len(reader.pages)}')
import os
print(f'File size: {os.path.getsize(out)/1024:.1f} KB')
