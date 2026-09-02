"""Extract all text + images + layout from the ConnexAI source PDF.

Mirrors the approach used for the IVR Telepresencia_Hibrida rebrand:
- Each page rendered to a 2000x1125 PNG (for visual reference + icon cropping)
- All embedded images extracted verbatim (preserved for the rebranded deck)
- All text blocks extracted with bbox + font + color (so we can recolor)
"""
import fitz
import json
import os
import hashlib

PDF = "/home/z/my-project/upload/(US) ConnexAI Enterprise Product Brochure (2026).pdf"
OUT = "/home/z/my-project/download/connexai_src/extracted"
IMG_DIR = os.path.join(OUT, "images")
PAGE_PNG_DIR = os.path.join(OUT, "page_pngs")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(PAGE_PNG_DIR, exist_ok=True)

doc = fitz.open(PDF)
print(f"PDF: {PDF}")
print(f"Pages: {doc.page_count}")
print(f"Metadata: {doc.metadata}")
print("=" * 70)

img_hash_to_path = {}
extracted_images = []
pages_data = []

for pno in range(doc.page_count):
    page = doc[pno]
    page_rect = page.rect
    print(f"\n--- Page {pno+1} ({page_rect.width:.1f} x {page_rect.height:.1f}) ---")

    # 1) Render full-page PNG at 150 DPI
    page_png_path = os.path.join(PAGE_PNG_DIR, f"page_{pno+1:02d}.png")
    pix = page.get_pixmap(dpi=150)
    pix.save(page_png_path)

    # 2) Extract text blocks with bbox + font + color
    text_blocks = []
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if b.get("type", 0) == 0:  # text
            for line in b.get("lines", []):
                line_text = ""
                max_size = 0
                font_name = ""
                color = 0
                for span in line.get("spans", []):
                    line_text += span.get("text", "")
                    if span.get("size", 0) > max_size:
                        max_size = span.get("size", 0)
                        font_name = span.get("font", "")
                        color = span.get("color", 0)
                # Include if has any text (even PUA glyph markers)
                if line_text or any(0xE000 <= ord(c) <= 0xF8FF for c in line_text):
                    bbox = line.get("bbox")
                    text_blocks.append({
                        "text": line_text,
                        "bbox": [round(bbox[0], 1), round(bbox[1], 1),
                                 round(bbox[2], 1), round(bbox[3], 1)],
                        "font_size": round(max_size, 1),
                        "font": font_name,
                        "color": f"#{color:06x}",
                    })

    # 3) Extract embedded images
    image_placements = []
    for img_info in page.get_image_info(xrefs=True):
        xref = img_info.get("xref", 0)
        bbox = img_info.get("bbox")
        if not bbox or xref == 0:
            continue
        try:
            base_img = doc.extract_image(xref)
            img_bytes = base_img["image"]
            img_ext = base_img["ext"]
            h = hashlib.sha256(img_bytes).hexdigest()[:16]
            if h not in img_hash_to_path:
                fname = f"img_{len(extracted_images)+1:03d}_{h}.{img_ext}"
                fpath = os.path.join(IMG_DIR, fname)
                with open(fpath, "wb") as f:
                    f.write(img_bytes)
                img_hash_to_path[h] = fname
                extracted_images.append({
                    "hash": h, "filename": fname,
                    "width": base_img.get("width", 0),
                    "height": base_img.get("height", 0),
                    "ext": img_ext, "ref_count": 0,
                })
            for ei in extracted_images:
                if ei["hash"] == h:
                    ei["ref_count"] += 1
                    break
            image_placements.append({
                "image_filename": img_hash_to_path[h],
                "bbox": [round(bbox[0], 1), round(bbox[1], 1),
                         round(bbox[2], 1), round(bbox[3], 1)],
            })
        except Exception as e:
            print(f"  ! Failed xref={xref}: {e}")

    # Compute normalized bbox
    page_w, page_h = page_rect.width, page_rect.height
    for tb in text_blocks:
        b = tb["bbox"]
        tb["norm_bbox"] = [round(b[0]/page_w, 4), round(b[1]/page_h, 4),
                           round(b[2]/page_w, 4), round(b[3]/page_h, 4)]
    for ip in image_placements:
        b = ip["bbox"]
        ip["norm_bbox"] = [round(b[0]/page_w, 4), round(b[1]/page_h, 4),
                           round(b[2]/page_w, 4), round(b[3]/page_h, 4)]

    pages_data.append({
        "page_index": pno, "page_number": pno + 1,
        "page_size": [round(page_w, 1), round(page_h, 1)],
        "page_png": page_png_path,
        "text_blocks": text_blocks,
        "image_placements": image_placements,
    })
    print(f"  Text blocks: {len(text_blocks)} | Images: {len(image_placements)}")

# Save JSON
out_json = os.path.join(OUT, "pdf_extract.json")
with open(out_json, "w") as f:
    json.dump({"pdf_source": PDF, "page_count": doc.page_count,
               "extracted_images": extracted_images, "pages": pages_data},
              f, indent=2, ensure_ascii=False)

print(f"\n{len(pages_data)} pages, {len(extracted_images)} unique images")
print(f"JSON: {out_json}")
