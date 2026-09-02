"""Generate 30 MassaPro-rebranded HTML slides from the extracted PDF data."""
import json
import os
from PIL import Image

EXTRACT_DIR = "/home/z/my-project/download/rebranded_slides/extracted"
SLIDES_DIR = "/home/z/my-project/download/rebranded_slides"
IMG_SRC_DIR = os.path.join(EXTRACT_DIR, "images")
IMG_DST_DIR = os.path.join(SLIDES_DIR, "images")
PAGE_PNG_DIR = os.path.join(EXTRACT_DIR, "page_pngs")
JSON_PATH = os.path.join(EXTRACT_DIR, "pdf_extract.json")

os.makedirs(IMG_DST_DIR, exist_ok=True)
# Symlink extracted images into slides dir (avoid duplicating 91 files)
for fname in os.listdir(IMG_SRC_DIR):
    src = os.path.join(IMG_SRC_DIR, fname)
    dst = os.path.join(IMG_DST_DIR, fname)
    if not os.path.exists(dst):
        try: os.symlink(src, dst)
        except FileExistsError: pass

with open(JSON_PATH) as f:
    data = json.load(f)

SLIDE_W, SLIDE_H = 1280, 720
PDF_W, PDF_H = 960.0, 540.0
SX, SY = SLIDE_W / PDF_W, SLIDE_H / PDF_H

COLOR_MAP = {
    "#fe6c5f": "#7C3AED", "#ed7666": "#7C3AED", "#ff8a7e": "#A78BFA",
    "#ff6f5f": "#7C3AED", "#ff7a6a": "#7C3AED",
}
def map_color(c):
    return COLOR_MAP.get(c.lower(), c) if c and c.startswith("#") else c

TEXT_REPLACE = [
    ("Interactive Powers", "MassaPro"),
    ("interactivepowers.com", "massapro.com"),
    ("ivrpowers.com", "massapro.com"),
    ("IVRPowers", "MassaPro"),
    ("IVR Powers", "MassaPro"),
]
def replace_text(text, page_number):
    if page_number == 1 and text.strip() == "Telepresence":
        return "MassaPro"
    for old, new in TEXT_REPLACE:
        text = text.replace(old, new)
    return text

def is_pua_only(text):
    return bool(text) and all(0xE000 <= ord(c) <= 0xF8FF for c in text)

def detect_bg(page_png_path):
    try:
        img = Image.open(page_png_path).convert("RGB")
        w, h = img.size
        pts = [(5,5),(w-5,5),(5,h-5),(w-5,h-5),(w//2,5),(w//2,h-5),(5,h//2),(w-5,h//2)]
        rs=gs=bs=0
        for x,y in pts:
            r,g,b = img.getpixel((x,y)); rs+=r; gs+=g; bs+=b
        n=len(pts); avg=(rs//n, gs//n, bs//n)
        lum = 0.299*avg[0] + 0.587*avg[1] + 0.114*avg[2]
        return ("#1A0B2E", True) if lum < 110 else ("#FFFFFF", False)
    except Exception:
        return ("#FFFFFF", False)

def esc(t):
    return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;")

def weight_for(size, is_dark):
    if size >= 40: return 800
    if size >= 20: return 700
    if size >= 13: return 600
    return 500

def family_for(size):
    return "'Playfair Display', Georgia, serif" if size >= 50 else "'Inter', system-ui, sans-serif"

for page in data["pages"]:
    pno = page["page_number"]
    page_png = os.path.join(PAGE_PNG_DIR, f"page_{pno:02d}.png")
    bg_color, is_dark = detect_bg(page_png)

    # Override: if all text is light, force dark
    text_colors = [tb.get("color", "") for tb in page["text_blocks"] if "text" in tb]
    light_count = sum(1 for c in text_colors if c.lower() in ("#ffffff", "#a8b4be", "#ed7666"))
    dark_count = sum(1 for c in text_colors if c.lower() in ("#22303a", "#6b7a85", "#000000"))
    if light_count > 0 and dark_count == 0 and not is_dark:
        bg_color, is_dark = "#1A0B2E", True

    text_color_default = "#FFFFFF" if is_dark else "#1A0B2E"

    image_html_parts = []
    for ip in page["image_placements"]:
        b = ip["bbox"]
        x = round(b[0]*SX, 1); y = round(b[1]*SY, 1)
        w = round((b[2]-b[0])*SX, 1); h = round((b[3]-b[1])*SY, 1)
        clip_left = -x if x < 0 else 0
        clip_top = -y if y < 0 else 0
        clip_right = (x+w) - SLIDE_W if (x+w) > SLIDE_W else 0
        clip_bottom = (y+h) - SLIDE_H if (y+h) > SLIDE_H else 0
        clip_css = ""
        if clip_left or clip_top or clip_right or clip_bottom:
            clip_css = f" clip-path: inset({clip_top}px {clip_right}px {clip_bottom}px {clip_left}px);"
        image_html_parts.append(
            f'<img src="images/{ip["image_filename"]}" style="position:absolute; left:{x}px; top:{y}px; '
            f'width:{w}px; height:{h}px; object-fit:fill;{clip_css}" />'
        )

    page_png_img = None
    PNG_SX = PNG_SY = 0.0
    text_html_parts = []
    icon_idx = 0
    for tb in page["text_blocks"]:
        if "text" not in tb: continue
        original = tb["text"]
        if not original and not is_pua_only(original): continue
        if not original.strip() and not is_pua_only(original): continue

        if is_pua_only(original):
            if page_png_img is None:
                page_png_img = Image.open(page_png).convert("RGB")
                PNG_SX = page_png_img.width / PDF_W
                PNG_SY = page_png_img.height / PDF_H
            b = tb["bbox"]
            pad = max(tb.get("font_size", 24) * 0.6, 8)
            crop_box = (
                max(0, int((b[0]-pad)*PNG_SX)),
                max(0, int((b[1]-pad)*PNG_SY)),
                min(page_png_img.width, int((b[2]+pad)*PNG_SX)),
                min(page_png_img.height, int((b[3]+pad)*PNG_SY)),
            )
            crop = page_png_img.crop(crop_box)
            bg_pixel = crop.getpixel((0, 0))[:3]
            crop_rgba = Image.new("RGBA", crop.size)
            for y_px in range(crop.height):
                for x_px in range(crop.width):
                    p = crop.getpixel((x_px, y_px))[:3]
                    if all(abs(p[i] - bg_pixel[i]) < 28 for i in range(3)):
                        crop_rgba.putpixel((x_px, y_px), (255, 255, 255, 0))
                    else:
                        crop_rgba.putpixel((x_px, y_px), p + (255,))
            icon_idx += 1
            icon_filename = f"icon_p{pno:02d}_{icon_idx:02d}.png"
            crop_rgba.save(os.path.join(IMG_DST_DIR, icon_filename))
            x = round(b[0]*SX - pad*SX, 1); y = round(b[1]*SY - pad*SY, 1)
            w = round((b[2]-b[0]+2*pad)*SX, 1); h = round((b[3]-b[1]+2*pad)*SY, 1)
            image_html_parts.append(
                f'<img src="images/{icon_filename}" style="position:absolute; '
                f'left:{x}px; top:{y}px; width:{w}px; height:{h}px; object-fit:contain;" />'
            )
            continue

        text = replace_text(original, pno)
        color = map_color(tb.get("color", text_color_default))
        size_orig = tb.get("font_size", 12)
        size_px = min(round(size_orig * SX, 1), 90)
        b = tb["bbox"]
        x = round(b[0]*SX, 1); y = round(b[1]*SY, 1)
        weight = weight_for(size_orig, is_dark)
        family = family_for(size_orig)
        letter_sp = "0.18em" if (size_orig <= 11 and text == text.upper() and len(text) > 3) else "normal"
        text_shadow = "text-shadow: 0 1px 3px rgba(0,0,0,0.4);" if is_dark else ""
        text_html_parts.append(
            f'<div style="position:absolute; left:{x}px; top:{y}px; color:{color}; '
            f'font-family:{family}; font-size:{size_px}px; font-weight:{weight}; '
            f'line-height:1.15; white-space:nowrap; letter-spacing:{letter_sp}; {text_shadow}">{esc(text)}</div>'
        )

    show_brand_bar = pno not in (1, 30)
    brand_bar = ""
    if show_brand_bar:
        bc = "#A78BFA" if is_dark else "#7C3AED"
        bb = "rgba(167,139,250,0.10)" if is_dark else "rgba(124,58,237,0.06)"
        bd = "rgba(167,139,250,0.30)" if is_dark else "rgba(124,58,237,0.25)"
        brand_bar = (
            f'<div style="position:absolute; top:18px; left:24px; z-index:50; display:flex; '
            f'align-items:center; gap:8px; padding:5px 12px; background:{bb}; border:1px solid {bd}; '
            f'border-radius:999px; font-family:\'Inter\',sans-serif; font-weight:700; font-size:11px; '
            f'letter-spacing:0.14em; color:{bc}; text-transform:uppercase;">'
            f'<span style="display:inline-block; width:8px; height:8px; background:{bc}; '
            f'border-radius:2px; transform:rotate(45deg);"></span>MassaPro</div>'
        )

    pnc = "rgba(255,255,255,0.45)" if is_dark else "rgba(31,41,55,0.45)"
    page_footer = (
        f'<div style="position:absolute; bottom:18px; right:24px; z-index:50; '
        f'font-family:\'Inter\',sans-serif; font-size:10px; letter-spacing:0.2em; '
        f'color:{pnc}; text-transform:uppercase;">MassaPro · {pno:02d} / {data["page_count"]:02d}</div>'
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Slide {pno:02d} — MassaPro</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;900&display=swap');
  html, body {{ margin:0; padding:0; width:1280px; height:720px; overflow:hidden; background:{bg_color}; }}
  .slide-canvas {{ position:relative; width:1280px; height:720px; background:{bg_color}; color:{text_color_default}; overflow:hidden; font-family:'Inter',system-ui,sans-serif; }}
</style>
</head>
<body>
<div class="slide-canvas">
{brand_bar}
{chr(10).join(image_html_parts)}
{chr(10).join(text_html_parts)}
{page_footer}
</div>
</body>
</html>
"""
    with open(os.path.join(SLIDES_DIR, f"slide_{pno:02d}.html"), "w", encoding="utf-8") as f:
        f.write(html)

print(f"Generated {len(data['pages'])} slides")
