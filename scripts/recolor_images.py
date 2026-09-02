"""Recolor ConnexAI teal brand colors inside embedded images to MassaPro purple.

For each image in the PPTX:
- Detect teal/green pixels (ConnexAI brand color #49B395 family)
- Recolor them to MassaPro purple (#7C3AED family)
- Leave neutral colors (white, black, gray, screenshots) untouched
- Save modified image back into the PPTX
"""
import zipfile, shutil, os, io
from PIL import Image, ImageDraw, ImageFont
import numpy as np

SRC = '/home/z/my-project/download/connexai_massapro_full.pptx'
DST = '/home/z/my-project/download/connexai_massapro_full_v2.pptx'

# MassaPro brand colors (RGB)
MP_PURPLE   = (124, 58, 237)   # #7C3AED primary
MP_DARK     = (109, 40, 217)   # #6D28D9 dark
MP_DARKER   = (91, 33, 182)    # #5B21B6 darker
MP_LIGHT    = (167, 139, 250)  # #A78BFA light
MP_SOFT     = (196, 181, 253)  # #C4B5FD soft
MP_WHITE    = (255, 255, 255)
MP_100      = (237, 233, 254)  # #EDE9FE
MP_50       = (245, 243, 255)  # #F5F3FF

# ConnexAI teal family to detect (RGB)
# Source uses #49B395, #5DA391, #3F796B, #249A87, #369383, #427062, #6B8E87
def is_teal_pixel(r, g, b):
    """Detect ConnexAI teal: low-mid R, mid-high G, mid B, G > R > B."""
    return (r < 200) & (g > 80) & (g < 230) & (b > 50) & (b < 220) & (g > r) & (g >= b - 30)

def teal_to_purple(r, g, b):
    """Map a teal pixel to its MassaPro purple equivalent based on luminance."""
    # Calculate luminance of original teal
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    # Map: brighter teal → brighter purple
    if lum > 180:  # very light teal
        return MP_LIGHT
    elif lum > 130:  # mid-bright teal (most logos)
        return MP_PURPLE
    elif lum > 80:   # mid-dark teal
        return MP_DARK
    else:             # very dark teal
        return MP_DARKER

def recolor_image(img):
    """Recolor teal pixels in image to MassaPro purple. Returns new PIL Image."""
    if img.mode != 'RGB':
        img = img.convert('RGB')
    arr = np.array(img)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    teal_mask = is_teal_pixel(r, g, b)

    if teal_mask.sum() == 0:
        return img  # no teal — leave unchanged

    # Apply mapping
    # Vectorized: compute target color per pixel
    ys, xs = np.where(teal_mask)
    new_arr = arr.copy()
    # Compute luminance per pixel
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    # Map by luminance thresholds
    very_light = teal_mask & (lum > 180)
    mid_bright = teal_mask & (lum > 130) & ~very_light
    mid_dark   = teal_mask & (lum > 80)  & ~very_light & ~mid_bright
    very_dark  = teal_mask & ~very_light & ~mid_bright & ~mid_dark

    new_arr[very_light] = MP_LIGHT
    new_arr[mid_bright] = MP_PURPLE
    new_arr[mid_dark]   = MP_DARK
    new_arr[very_dark]  = MP_DARKER

    return Image.fromarray(new_arr)

# Read original PPTX, process each image, write new PPTX
with zipfile.ZipFile(SRC, 'r') as zin:
    items = zin.namelist()
    file_data = {i: zin.read(i) for i in items}

processed = 0
for name in items:
    if not name.startswith('ppt/media/'): continue
    if not name.endswith(('.png', '.jpg', '.jpeg')): continue
    try:
        img = Image.open(io.BytesIO(file_data[name])).convert('RGB')
        new_img = recolor_image(img)
        # Save back to bytes (same format)
        buf = io.BytesIO()
        if name.endswith('.jpg') or name.endswith('.jpeg'):
            new_img.save(buf, format='JPEG', quality=88)
        else:
            new_img.save(buf, format='PNG')
        new_bytes = buf.getvalue()
        # Only replace if smaller or similar size (avoid bloating)
        if len(new_bytes) < len(file_data[name]) * 1.5:
            file_data[name] = new_bytes
            processed += 1
            # Save a preview of before/after for first 3 images
            if processed <= 3:
                print(f'  ✓ {os.path.basename(name)}: {len(file_data[name])//1024}KB (was {len(zin.read(name))//1024}KB)')
    except Exception as e:
        print(f'  ! {name}: {e}')

print(f'\nProcessed {processed} images')

# Write new PPTX
with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in items:
        zout.writestr(item, file_data[item])

print(f'Saved: {DST}')
print(f'Size: {os.path.getsize(DST)//1024//1024} MB')
