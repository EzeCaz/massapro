"""Compress the PPTX by downsizing embedded images to max 1280px wide and
re-encoding as JPEG quality 80. This typically cuts PPTX size by 60-80%
without visible quality loss for a 16:9 slide deck.
"""
import os, shutil, zipfile, io, tempfile
from PIL import Image

SRC = "/home/z/my-project/download/Massapro-IVR-Rebranded-Dec.pptx"
DST = "/home/z/my-project/download/Massapro-IVR-Rebranded-Dec-Compact.pptx"
MAX_W = 1280  # max width in pixels — slides are 1280x720 so this is full-res
JPEG_Q = 80

# Work in a temp dir
with tempfile.TemporaryDirectory() as tmp:
    # Unzip
    with zipfile.ZipFile(SRC, 'r') as zin:
        zin.extractall(tmp)
    
    media_dir = os.path.join(tmp, 'ppt', 'media')
    if not os.path.isdir(media_dir):
        print("No media dir found!")
        exit(1)
    
    total_before = 0
    total_after = 0
    n_processed = 0
    
    for fname in os.listdir(media_dir):
        fpath = os.path.join(media_dir, fname)
        if not os.path.isfile(fpath):
            continue
        size_before = os.path.getsize(fpath)
        total_before += size_before
        
        try:
            img = Image.open(fpath).convert('RGB')
            w, h = img.size
            # Downscale if wider than MAX_W
            if w > MAX_W:
                new_h = int(h * MAX_W / w)
                img = img.resize((MAX_W, new_h), Image.LANCZOS)
            
            # Re-encode as JPEG (even for PNGs — they're photos/screenshots here)
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=JPEG_Q, optimize=True)
            new_bytes = buf.getvalue()
            
            # Only replace if smaller
            if len(new_bytes) < size_before:
                # Remove old file, write new with same base name but .jpg extension
                # But PPTX internal references use the original filename, so we need
                # to keep the same name. Use original extension.
                with open(fpath, 'wb') as f:
                    f.write(new_bytes)
                total_after += len(new_bytes)
                n_processed += 1
                print(f"  {fname}: {size_before//1024}KB -> {len(new_bytes)//1024}KB")
            else:
                total_after += size_before
        except Exception as e:
            print(f"  ! {fname}: {e}")
            total_after += size_before
    
    print(f"\nProcessed {n_processed} images")
    print(f"Total media: {total_before//1024}KB -> {total_after//1024}KB "
          f"({100*(1-total_after/total_before):.0f}% reduction)")
    
    # Re-zip
    if os.path.exists(DST):
        os.remove(DST)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zout:
        for root, dirs, files in os.walk(tmp):
            for f in files:
                full = os.path.join(root, f)
                arcname = os.path.relpath(full, tmp)
                zout.write(full, arcname)

src_size = os.path.getsize(SRC)
dst_size = os.path.getsize(DST)
print(f"\nOriginal PPTX: {src_size/1024/1024:.1f} MB")
print(f"Compact  PPTX: {dst_size/1024/1024:.1f} MB  ({100*(1-dst_size/src_size):.0f}% smaller)")
