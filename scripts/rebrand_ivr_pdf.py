#!/usr/bin/env python3
"""
Rebrand Telepresencia_Hibrida_Interactive_Powers_V3_EN.pdf for MassaPro.

Two-pass transformation:
  Pass A (text) — PyMuPDF:
    - Replace "Interactive Powers" → "MassaPro" everywhere
    - Replace cover title "Telepresence" → "MassaPro IVR"
    - Replace footer email/URL on closing page
    - Replace inline body mention on page 22 ("Interactive Powers never accesses...")
    - Preserve original font (Montserrat-Thin), size, color, position

  Pass B (color) — pikepdf content-stream regex:
    - Replace coral/red-orange palette → MassaPro purple palette
    - Operates on DeviceRGB color operators in PDF content streams
    - Preserves all vector geometry, text, and embedded images exactly

Output: /home/z/my-project/download/Massapro-IVR-Rebranded-Deck.pdf
"""
import fitz  # PyMuPDF
import pikepdf
import re
import io
import os
import sys

SRC = '/home/z/my-project/upload/Telepresencia_Hibrida_Interactive_Powers_V3_EN.pdf'
DST = '/home/z/my-project/download/Massapro-IVR-Rebranded-Deck.pdf'
INTERMEDIATE = '/home/z/my-project/scripts/ivr_rebranded_text.pdf'  # after text pass, before color pass

FONT_THIN = '/home/z/my-project/scripts/fonts/montserrat-thin.ttf'
FONT_REG  = '/home/z/my-project/scripts/fonts/montserrat-regular.ttf'
FONT_BOLD = '/home/z/my-project/scripts/fonts/montserrat-bold.ttf'

# MassaPro purple palette (RGB 0-1 floats for pikepdf; tuples for PyMuPDF)
PURPLE_MAIN   = (0x7C, 0x3A, 0xED)   # #7C3AED — primary
PURPLE_DARK   = (0x6D, 0x28, 0xD9)   # #6D28D9
PURPLE_LIGHT  = (0xA7, 0x8B, 0xFA)   # #A78BFA
PURPLE_100    = (0xED, 0xE9, 0xFE)   # #EDE9FE
PURPLE_50     = (0xF5, 0xF3, 0xFF)   # #F5F3FF

# Source coral palette → MassaPro purple mapping (RGB hex strings)
COLOR_MAP = {
    # Primary coral (90 fills + 9 strokes) → MassaPro primary purple
    '#FD6B5E': '#7C3AED',
    '#FE6C5F': '#7C3AED',  # text-color variant (essentially same coral)
    # Lighter coral (1 fill + 9 strokes) → lighter purple
    '#ED7666': '#A78BFA',
    # Very pale coral (1 stroke) → pale purple
    '#F7CFC7': '#EDE9FE',
    # Coral tint background (1 fill) → purple tint
    '#FFF3F2': '#F5F3FF',
}

# ============================================================
# PASS A — TEXT REPLACEMENT with PyMuPDF
# ============================================================

def hex_to_float_tuple(hex_color):
    """'#7C3AED' → (0.486, 0.227, 0.929) for PyMuPDF insert_text color arg"""
    h = hex_color.lstrip('#')
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r, g, b)

def get_original_color_hex(span_color_int):
    """PyMuPDF span color int → '#RRGGBB'"""
    r = (span_color_int >> 16) & 0xFF
    g = (span_color_int >> 8) & 0xFF
    b = span_color_int & 0xFF
    return f'#{r:02X}{g:02X}{b:02X}'

def remap_color(hex_color):
    """If hex is in COLOR_MAP, return the MassaPro purple equivalent; else return unchanged."""
    return COLOR_MAP.get(hex_color.upper(), hex_color)

def replace_text_on_page(page, font_thin, font_reg, font_bold):
    """
    Walk all text spans on the page. For any span containing target text,
    capture font/size/color/position, redact the original, then insert the
    replacement text with the same geometry (but recolored to MassaPro purple
    where the original was coral).
    """
    replacements_made = []

    # Define the text-level replacements we want to perform.
    # Each entry: (search_text, replacement_text)
    # PyMuPDF's search_for works on whole-phrase matches.
    TEXT_REPLACEMENTS = [
        ('Interactive Powers', 'MassaPro'),
        ('ivan.sixto@ivrpowers.com  ·  interactivepowers.com',
         'hello@massapro.com  ·  massapro.com'),
        # Page 1 cover: "Telepresence" appears as title, paired with "Phygital"
        # We replace "Telepresence" with "MassaPro IVR" — but only on page 1
    ]

    # Get full text structure with span details
    text_dict = page.get_text("dict")

    # Collect spans to replace, with their geometry + style
    spans_to_replace = []  # list of dicts: {rect, text, font, size, color, origin, replacement}

    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = span.get("text", "")
                if not text:
                    continue
                # Check if this span matches any target
                for search, replacement in TEXT_REPLACEMENTS:
                    if search in text:
                        # Determine the replacement text for this specific span
                        # If span text == search exactly, use replacement verbatim
                        # If span text contains search as substring, do inline replace
                        if text.strip() == search:
                            new_text = replacement
                        else:
                            new_text = text.replace(search, replacement)

                        spans_to_replace.append({
                            'rect': fitz.Rect(span['bbox']),
                            'origin': span['origin'],
                            'text': text,
                            'new_text': new_text,
                            'font': span['font'],
                            'size': span['size'],
                            'color': get_original_color_hex(span['color']),
                            'flags': span.get('flags', 0),
                        })
                        break  # only one search match per span

    if not spans_to_replace:
        return 0

    # Now: redact each span's rect, then re-insert the new text at the same origin
    for s in spans_to_replace:
        # Add redaction annotation. Use the span's own background color so the
        # redaction fill matches the slide (we don't know the exact bg per span,
        # but redactions without fill just remove the text graphics).
        page.add_redact_annot(s['rect'], fill=None)

    # Apply redactions — this removes the original text (text + graphics beneath
    # within the rect). Use TEXT_PRESERVE_IMAGES to keep images intact.
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    # Now insert the new text at each span's origin with recolored font
    for s in spans_to_replace:
        # Recolor: if original color was coral, use MassaPro purple equivalent
        new_color_hex = remap_color(s['color'])

        # Choose font based on original font name
        # Original uses Montserrat-Thin and MontserratRoman-Bold
        orig_font = s['font'].lower()
        if 'bold' in orig_font:
            font_path = FONT_BOLD
            font_name = 'F2'  # we'll register multiple fonts with different names
        elif 'thin' in orig_font:
            font_path = FONT_THIN
            font_name = 'F0'
        else:
            font_path = FONT_REG
            font_name = 'F1'

        # Register font (idempotent — PyMuPDF caches by page)
        page.insert_font(fontname=font_name, fontfile=font_path)

        # Insert text at original origin (baseline left point)
        # PyMuPDF insert_text uses (x, y) where y is the baseline
        x, y = s['origin']
        page.insert_text(
            point=(x, y),
            text=s['new_text'],
            fontname=font_name,
            fontsize=s['size'],
            color=hex_to_float_tuple(new_color_hex),
            overlay=True,
        )
        replacements_made.append(s)

    return len(replacements_made)


def handle_cover_title(page, font_thin, font_reg, font_bold):
    """
    Page 1 cover has title 'Telepresence' (Montserrat-Thin 46pt white) on the
    left side. Replace with 'MassaPro IVR'. Note 'Phygital' (coral bold) is on
    the same line right after — we leave it alone (it's the product descriptor).

    Actually, looking at the data, the cover shows:
      Line 1: 'Telepresence' (white thin 46pt)
      Line 2: 'Phygital' (coral bold 46pt)

    These are two separate spans on two separate lines. We want the new cover to
    read:
      Line 1: 'MassaPro IVR' (white thin 46pt) — replaces 'Telepresence'
      Line 2: 'Phygital' (now purple bold 46pt) — recolored via color pass
    """
    text_dict = page.get_text("dict")
    spans_to_replace = []
    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if span.get("text", "").strip() == "Telepresence":
                    spans_to_replace.append({
                        'rect': fitz.Rect(span['bbox']),
                        'origin': span['origin'],
                        'text': span['text'],
                        'new_text': 'MassaPro IVR',
                        'font': span['font'],
                        'size': span['size'],
                        'color': get_original_color_hex(span['color']),
                    })

    if not spans_to_replace:
        return 0

    for s in spans_to_replace:
        page.add_redact_annot(s['rect'], fill=None)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    for s in spans_to_replace:
        page.insert_font(fontname='F0', fontfile=FONT_THIN)
        x, y = s['origin']
        # Original color is white — keep it white
        page.insert_text(
            point=(x, y),
            text=s['new_text'],
            fontname='F0',
            fontsize=s['size'],
            color=(1, 1, 1),
            overlay=True,
        )
    return len(spans_to_replace)


def text_pass():
    """Run text replacement on all pages."""
    print(f"\n=== PASS A: Text Replacement ===")
    print(f"Opening: {SRC}")
    doc = fitz.open(SRC)
    print(f"  Pages: {len(doc)}")

    total_replacements = 0
    for i, page in enumerate(doc):
        n = replace_text_on_page(page, FONT_THIN, FONT_REG, FONT_BOLD)
        if i == 0:
            n_cover = handle_cover_title(page, FONT_THIN, FONT_REG, FONT_BOLD)
            n += n_cover
        if n > 0:
            print(f"  Page {i+1}: {n} text replacement(s)")
        total_replacements += n

    # Set proper PDF metadata for the rebranded deck
    doc.set_metadata({
        'title': 'MassaPro IVR — Phygital Telepresence Sales Deck',
        'author': 'MassaPro',
        'subject': 'MassaPro IVR — Face-to-Face Service Over Video',
        'keywords': 'MassaPro, IVR, Phygital, Telepresence, Video Service',
        'creator': 'MassaPro',
        'producer': 'MassaPro Brand System',
    })

    print(f"\nTotal text replacements: {total_replacements}")
    print(f"Saving intermediate (post-text, pre-color): {INTERMEDIATE}")
    doc.save(INTERMEDIATE, garbage=4, deflate=True, clean=True)
    doc.close()
    return INTERMEDIATE


# ============================================================
# PASS B — COLOR RECALIBRATION with pikepdf content-stream regex
# ============================================================

# Literal string replacements for the coral → MassaPro purple color swap.
# Built from the EXACT values found in the source PDF content streams.
# Each tuple: (source_substring, replacement_substring)
# We cover both leading-dot (".9960784") and leading-zero ("0.9960784") forms,
# and all 4 color operators (scn/SCN/rg/RG).
LITERAL_COLOR_REPLACEMENTS = [
    # ── Coral primary #FE6C5F → MassaPro purple #7C3AED ──
    # Source value: .9960784 .4235294 .372549  (85 scn fills + 27 SCN strokes + others)
    # Target value: .4862745 .2274510 .9294118
    # 8 variants per color (4 operators × 2 leading-digit forms)
    *[
        (f'{lead}.9960784 {lead}.4235294 {lead}.372549 {op}',
         f'{lead}.4862745 {lead}.2274510 {lead}.9294118 {op}')
        for lead in ['', '0'] for op in ['scn', 'SCN', 'rg', 'RG']
    ],

    # ── Lighter coral #ED7666 → Lighter MassaPro purple #A78BFA ──
    # Source value: .9294118 .4627451 .4  (18 SCN + 9 scn)
    # Target value: .6549020 .5450980 .9803922
    *[
        (f'{lead}.9294118 {lead}.4627451 {lead}.4 {op}',
         f'{lead}.6549020 {lead}.5450980 {lead}.9803922 {op}')
        for lead in ['', '0'] for op in ['scn', 'SCN', 'rg', 'RG']
    ],

    # ── Very pale coral stroke #F7CFC8 → Pale MassaPro purple #EDE9FE ──
    # Source value: .9686275 .8117647 .7843137  (19 SCN)
    # Target value: .9294118 .9137255 .9960784
    *[
        (f'{lead}.9686275 {lead}.8117647 {lead}.7843137 {op}',
         f'{lead}.9294118 {lead}.9137255 {lead}.9960784 {op}')
        for lead in ['', '0'] for op in ['scn', 'SCN', 'rg', 'RG']
    ],

    # ── Coral tint background #FFF3F2 → Purple tint #F5F3FF ──
    # (only seen once as fill in scan — handle just in case)
    *[
        (f'{lead}.999996 {lead}.953 {lead}.949 {op}',
         f'{lead}.961 {lead}.953 {lead}1 {op}')
        for lead in ['', '0'] for op in ['scn', 'SCN', 'rg', 'RG']
    ],
]


def color_pass(input_pdf):
    """
    Walk each page's content stream and perform literal string replacement
    of coral color operators with MassaPro purple equivalents. Preserves
    every vector drawing, text span, and embedded image exactly.
    """
    print(f"\n=== PASS B: Color Recalibration (literal string replace) ===")
    print(f"Opening: {input_pdf}")
    pdf = pikepdf.open(input_pdf)
    print(f"  Pages: {len(pdf.pages)}")
    print(f"  Literal replacement rules: {len(LITERAL_COLOR_REPLACEMENTS)}")

    total_swaps = 0
    for i, page in enumerate(pdf.pages):
        if '/Contents' not in page.obj:
            continue

        contents = page.obj['/Contents']
        streams = list(contents) if isinstance(contents, pikepdf.Array) else [contents]

        page_swaps = 0
        for stream in streams:
            try:
                raw = stream.read_bytes()
            except Exception as e:
                print(f"  Page {i+1}: stream read error: {e}")
                continue

            # Decode as latin-1 to preserve byte-for-byte fidelity
            text = raw.decode('latin-1')

            # Apply each literal replacement, count how many hits
            for src, dst in LITERAL_COLOR_REPLACEMENTS:
                if src in text:
                    cnt = text.count(src)
                    text = text.replace(src, dst)
                    page_swaps += cnt

            if page_swaps > 0:
                # Encode back to bytes and write to the stream
                new_bytes = text.encode('latin-1')
                stream.write(new_bytes)

        if page_swaps > 0:
            print(f"  Page {i+1}: {page_swaps} color operator swap(s)")
        total_swaps += page_swaps

    print(f"\nTotal color operator swaps: {total_swaps}")
    print(f"Saving final: {DST}")
    # pikepdf.Pdf.save() does NOT accept garbage= / deflate=; use the
    # supported compress_streams + object_stream_mode flags instead.
    pdf.save(DST, compress_streams=True,
             object_stream_mode=pikepdf.ObjectStreamMode.generate)
    pdf.close()
    return DST


# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("MassaPro IVR Rebranding — source: Telepresencia_Hibrida_Interactive_Powers_V3_EN.pdf")

    # Make sure download dir exists
    os.makedirs(os.path.dirname(DST), exist_ok=True)

    # Pass A: text replacement
    intermediate = text_pass()

    # Pass B: color recalibration
    final = color_pass(intermediate)

    print(f"\n✓ Done. Final PDF: {final}")
    print(f"  Size: {os.path.getsize(final) / 1024 / 1024:.2f} MB")

    # Cleanup intermediate
    if os.path.exists(intermediate):
        os.remove(intermediate)
        print(f"  Cleaned intermediate: {intermediate}")
