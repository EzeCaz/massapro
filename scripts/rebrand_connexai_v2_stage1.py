"""Rebrand ConnexAI PDF as MassaPro Enterprise Brochure.

Mirrors the IVR Telepresencia_Hibrida rebrand approach:

Stage 1: Per-pixel color swap on all 30 PDF page images
  - ConnexAI teal family → MassaPro purple family (luminance-based mapping)

Stage 2: Cover ConnexAI brand areas
  - Top-left + top-right corners: detect brand lockup (white text + colored icon)
    and cover with image's bg color
  - Overlay MassaPro brand badge (purple pill with "M" + "MassaPro") in top-right
  - Chart legends on slides 7, 8: cover "ConnexAI" label with MassaPro badge

Stage 3: Build 30 HTML slides at 1280x720
  - Each slide = recolored page image as full-bleed background
  - MassaPro brand bar overlay (top-right) on every body slide
  - Page footer (bottom-right) on every slide
  - Value-prop overlay text on slides 2, 5, 28, 29, 30 (overview/summary)
  - Use IVR rebrand's global.css for brand book consistency

Stage 4: Export to PPTX via batch_html2pptx.js + convert to PDF via LibreOffice
"""
import os, io, shutil, zipfile, json
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ---------- Paths ----------
SRC_PDF = '/home/z/my-project/upload/(US) ConnexAI Enterprise Product Brochure (2026).pdf'
EXTRACTED_DIR = '/tmp/connexai_extracted'  # 30 page images
WORK_DIR = '/home/z/my-project/download/connexai_massapro_brand'
SLIDES_DIR = os.path.join(WORK_DIR, 'slides')
IMG_DIR = os.path.join(SLIDES_DIR, 'images')
RECOLORED_DIR = os.path.join(WORK_DIR, 'recolored_images')
os.makedirs(SLIDES_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(RECOLORED_DIR, exist_ok=True)

# ---------- MassaPro brand book (mirrors IVR rebrand global.css) ----------
MP_DARK_BG  = (26, 11, 46)      # #1A0B2E
MP_DARKER   = (15, 5, 24)        # #0F0518
MP_PRIMARY  = (124, 58, 237)     # #7C3AED
MP_DARK     = (109, 40, 217)     # #6D28D9
MP_DARKER_P = (91, 33, 182)      # #5B21B6
MP_LIGHT    = (167, 139, 250)    # #A78BFA
MP_SOFT     = (196, 181, 253)    # #C4B5FD
MP_100      = (237, 233, 254)    # #EDE9FE
MP_50       = (245, 243, 255)    # #F5F3FF
MP_WHITE    = (255, 255, 255)
MP_INK      = (31, 41, 55)       # slate-800 body text on light

# ---------- Stage 1: Per-pixel color swap ----------
def is_teal_pixel(r, g, b):
    """Detect ConnexAI teal: low-mid R, mid-high G, mid B, G > R > B."""
    return (r < 200) & (g > 80) & (g < 230) & (b > 50) & (b < 220) & (g > r) & (g >= b - 30)

def teal_to_purple_luminance(r, g, b):
    """Map a teal pixel to its MassaPro purple equivalent based on luminance."""
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if lum > 180: return MP_LIGHT     # very light teal → MP_LIGHT
    if lum > 130: return MP_PRIMARY   # mid-bright teal → MP_PRIMARY
    if lum > 80:  return MP_DARK      # mid-dark teal → MP_DARK
    return MP_DARKER_P                # very dark teal → MP_DARKER

def recolor_image_pixels(img):
    """Recolor teal pixels in image to MassaPro purple. Returns new PIL Image."""
    if img.mode != 'RGB': img = img.convert('RGB')
    arr = np.array(img)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    teal_mask = is_teal_pixel(r, g, b)
    if teal_mask.sum() == 0:
        return img
    # Compute luminance per pixel
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    # Vectorized mapping by luminance thresholds
    very_light = teal_mask & (lum > 180)
    mid_bright = teal_mask & (lum > 130) & ~very_light
    mid_dark   = teal_mask & (lum > 80)  & ~very_light & ~mid_bright
    very_dark  = teal_mask & ~very_light & ~mid_bright & ~mid_dark
    new_arr = arr.copy()
    new_arr[very_light] = MP_LIGHT
    new_arr[mid_bright] = MP_PRIMARY
    new_arr[mid_dark]   = MP_DARK
    new_arr[very_dark]  = MP_DARKER_P
    return Image.fromarray(new_arr)

# ---------- Stage 2: Cover ConnexAI brand areas ----------
def find_brand_area(img, region='both'):
    """Detect brand lockup area (white text + colored icon) in top-left or top-right."""
    if img.mode != 'RGB': img = img.convert('RGB')
    w, h = img.size
    arr = np.array(img)
    regions_to_check = []
    if region in ('both', 'left'):
        regions_to_check.append(('left', 0, int(w*0.45), 0, int(h*0.20)))
    if region in ('both', 'right'):
        regions_to_check.append(('right', int(w*0.55), w, 0, int(h*0.20)))
    
    areas = []
    for side, rx1, rx2, ry1, ry2 in regions_to_check:
        region_arr = arr[ry1:ry2, rx1:rx2]
        if region_arr.size == 0: continue
        r, g, b = region_arr[:,:,0], region_arr[:,:,1], region_arr[:,:,2]
        # White text pixels (ConnexAI wordmark in white)
        white_mask = (r > 200) & (g > 200) & (b > 200)
        # Purple icon pixels (was teal, now recolored to purple)
        purple_mask = (r < 180) & (g < 130) & (b > 180)
        combined = white_mask | purple_mask
        if combined.sum() < 100:
            continue
        ys, xs = np.where(combined)
        # Convert back to image coords + add padding
        pad = max(int(w * 0.008), 8)
        real_x1 = max(0, xs.min() + rx1 - pad)
        real_x2 = min(w, xs.max() + rx1 + pad)
        real_y1 = max(0, ys.min() + ry1 - pad)
        real_y2 = min(h, ys.max() + ry1 + pad)
        # Sample bg color just outside the brand area
        bg_x = max(2, real_x1 - 30) if side == 'left' else min(w-3, real_x2 + 30)
        bg_y = max(2, (real_y1 + real_y2) // 2)
        try:
            bg_pixel = arr[bg_y, bg_x]
        except IndexError:
            bg_pixel = arr[max(2, real_y2 + 5), real_x1]
        areas.append({
            'side': side, 'x1': real_x1, 'y1': real_y1,
            'x2': real_x2, 'y2': real_y2,
            'bg_color': tuple(int(c) for c in bg_pixel[:3]),
        })
    return areas

def draw_massapro_badge(draw, x1, y1, x2, y2, bg_color):
    """Draw a MassaPro badge (purple icon + 'MassaPro' text) in the given area."""
    area_w = x2 - x1
    area_h = y2 - y1
    icon_size = max(20, min(int(area_h * 0.7), 50))
    pad = 6
    icon_x = x1 + pad
    icon_y = y1 + (area_h - icon_size) // 2
    # Purple square icon
    draw.rectangle([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], fill=MP_PRIMARY + (255,))
    # "M" inside icon
    try:
        m_size = int(icon_size * 0.7)
        font_m = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', m_size)
        draw.text((icon_x + icon_size//4, icon_y + icon_size//10), 'M', fill=MP_WHITE + (255,), font=font_m)
    except: pass
    # "MassaPro" text
    text_size = max(14, int(icon_size * 0.75))
    try:
        font_text = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', text_size)
        # Text color: white if bg is dark, dark purple if bg is light
        text_color = MP_WHITE + (255,) if sum(bg_color[:3]) < 350 else MP_DARK + (255,)
        draw.text((icon_x + icon_size + pad//2, icon_y + 2), 'MassaPro', fill=text_color, font=font_text)
    except: pass

def cover_brand_areas(img):
    """Cover ConnexAI brand lockups (top-left + top-right) with bg color + MassaPro badge."""
    if img.mode != 'RGB': img = img.convert('RGB')
    areas = find_brand_area(img, 'both')
    if not areas:
        return img, False
    img_rgba = img.convert('RGBA')
    draw = ImageDraw.Draw(img_rgba)
    for area in areas:
        bg_color = area['bg_color'] + (255,)
        draw.rectangle([area['x1'], area['y1'], area['x2'], area['y2']], fill=bg_color)
        draw_massapro_badge(draw, area['x1'], area['y1'], area['x2'], area['y2'], area['bg_color'])
    return img_rgba.convert('RGB'), True

# ---------- Stage 2b: Cover ConnexAI chart legends (slides 7, 8) ----------
def find_white_text_bands(arr, y_start_pct=0.4, y_end_pct=0.95, min_height=8, max_height=40, min_width=30, max_width=300):
    """Find horizontal bands of white text in the lower portion of an image."""
    h, w = arr.shape[:2]
    y1 = int(h * y_start_pct)
    y2 = int(h * y_end_pct)
    region = arr[y1:y2, :]
    r, g, b = region[:,:,0], region[:,:,1], region[:,:,2]
    white_mask = (r > 200) & (g > 200) & (b > 200)
    if white_mask.sum() < 50:
        return []
    row_counts = white_mask.sum(axis=1)
    text_rows = np.where(row_counts > 5)[0]
    if len(text_rows) == 0:
        return []
    # Group into bands
    bands = []
    current_start = text_rows[0]
    current_end = text_rows[0]
    for r_idx in text_rows[1:]:
        if r_idx - current_end < 5:
            current_end = r_idx
        else:
            if min_height <= (current_end - current_start) <= max_height:
                bands.append((current_start + y1, current_end + y1))
            current_start = r_idx
            current_end = r_idx
    if min_height <= (current_end - current_start) <= max_height:
        bands.append((current_start + y1, current_end + y1))
    
    # For each band, get x range
    result = []
    for y_start, y_end in bands:
        band_mask = white_mask[y_start - y1:y_end - y1 + 1, :]
        cols = np.where(band_mask.any(axis=0))[0]
        if len(cols) == 0: continue
        x1, x2 = cols.min(), cols.max()
        if min_width <= (x2 - x1) <= max_width:
            result.append({'x1': x1, 'y1': y_start, 'x2': x2, 'y2': y_end})
    return result

def cover_chart_legend_text(img):
    """Cover ConnexAI text in chart legends with MassaPro badge."""
    if img.mode != 'RGB': img = img.convert('RGB')
    arr = np.array(img)
    bands = find_white_text_bands(arr)
    if not bands:
        return img, False
    img_rgba = img.convert('RGBA')
    draw = ImageDraw.Draw(img_rgba)
    changed = False
    for band in bands:
        x1, y1, x2, y2 = band['x1'], band['y1'], band['x2'], band['y2']
        # Sample bg color above the text
        bg_y = max(2, y1 - 8)
        bg_x = (x1 + x2) // 2
        try:
            bg_pixel = arr[bg_y, bg_x]
        except IndexError:
            continue
        bg_color = tuple(int(c) for c in bg_pixel[:3])
        draw.rectangle([x1 - 4, y1 - 2, x2 + 4, y2 + 2], fill=bg_color + (255,))
        # Draw MassaPro badge if band is wide enough
        if (x2 - x1) > 60:
            draw_massapro_badge(draw, x1 - 4, y1 - 2, x2 + 4, y2 + 2, bg_color)
        changed = True
    return img_rgba.convert('RGB'), changed

# ---------- Run Stage 1 + 2 on all 30 images ----------
print('=== Stage 1+2: Recolor + cover brand areas ===')
for i in range(1, 31):
    src = os.path.join(EXTRACTED_DIR, f'page{i}_img{i}.jpg')
    if not os.path.exists(src):
        print(f'  ! missing {src}')
        continue
    img = Image.open(src)
    # Stage 1: per-pixel teal → purple
    recolored = recolor_image_pixels(img)
    # Stage 2: cover brand lockup areas
    covered, _ = cover_brand_areas(recolored)
    # Stage 2b: cover chart legend text (slides 7, 8)
    final, _ = cover_chart_legend_text(covered)
    out_path = os.path.join(RECOLORED_DIR, f'page_{i:02d}.jpg')
    final.convert('RGB').save(out_path, quality=92)
    # Also copy to slides/images/ for HTML reference
    shutil.copy(out_path, os.path.join(IMG_DIR, f'page_{i:02d}.jpg'))
    print(f'  ✓ page {i:02d} processed')

print(f'\nSaved {30} recolored images to {RECOLORED_DIR}')
