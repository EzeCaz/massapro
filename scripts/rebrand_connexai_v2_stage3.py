"""Stage 3: Build 30 MassaPro-branded HTML slides (1280x720).

Mirrors the IVR Telepresencia_Hibrida rebrand structure exactly:
- Each slide = full-bleed recolored page image as background
- MassaPro brand bar (purple pill with "M" + "MassaPro") at top-right corner
- Page footer "MassaPro · NN / 30" at bottom-right
- Value-prop overlay text on overview/summary slides (2, 5, 28, 29, 30)
- global.css with MassaPro brand book tokens
"""
import os, shutil, json

WORK_DIR = '/home/z/my-project/download/connexai_massapro_brand'
SLIDES_DIR = os.path.join(WORK_DIR, 'slides')
IMG_DIR = os.path.join(SLIDES_DIR, 'images')
os.makedirs(SLIDES_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

# Copy recolored images into slides/images/
recolored_dir = os.path.join(WORK_DIR, 'recolored_images')
for f in os.listdir(recolored_dir):
    shutil.copy(os.path.join(recolored_dir, f), os.path.join(IMG_DIR, f))

# ---------- global.css (mirror of IVR rebrand) ----------
GLOBAL_CSS = """/* MassaPro Enterprise Brochure — Global Stylesheet
   Brand book mirrors secretary.massapro.com + IVR rebrand
   Palette: MassaPro purple brand system
   Typography: Inter (heading + body + numeric), Playfair Display (display accent)
*/

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  /* MassaPro Purple Palette */
  --bg-dark:       #1A0B2E;
  --bg-darker:     #0F0518;
  --primary:       #7C3AED;
  --primary-dark:  #6D28D9;
  --primary-darker:#5B21B6;
  --primary-light: #A78BFA;
  --primary-soft:  #C4B5FD;
  --primary-100:   #EDE9FE;
  --primary-50:    #F5F3FF;

  --white:         #FFFFFF;
  --ink:           #1F2937;
  --ink-soft:      #374151;
  --muted:         #6B7280;
  --line:          #E5E7EB;
  --line-soft:     #F3F4F6;

  --success:       #10B981;
  --warning:       #F59E0B;
  --danger:        #EF4444;

  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-num:     'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  --fs-display: 64px;
  --fs-h1:      44px;
  --fs-h2:      32px;
  --fs-h3:      22px;
  --fs-body:    16px;
  --fs-small:   13px;
  --fs-micro:   11px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1280px;
  height: 720px;
  overflow: hidden;
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.slide-canvas {
  position: relative;
  width: 1280px;
  height: 720px;
  overflow: hidden;
  background: var(--white);
}

.bg-image {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  object-fit: fill;
  z-index: 1;
}

/* MassaPro brand bar — purple pill with "M" icon + "MassaPro" text */
.massapro-brand-bar {
  position: absolute;
  top: 22px;
  right: 28px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 10px;
  background: rgba(255, 255, 255, 0.96);
  border: 1.5px solid var(--primary);
  border-radius: 999px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.18);
  backdrop-filter: blur(8px);
}

.massapro-brand-bar .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: var(--white);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 800;
}

/* Page footer */
.page-footer {
  position: absolute;
  bottom: 18px;
  right: 28px;
  z-index: 50;
  font-family: var(--font-body);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* Value-prop overlay (used on overview/summary slides) */
.value-prop-overlay {
  position: absolute;
  z-index: 40;
  background: rgba(26, 11, 46, 0.92);
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-left: 4px solid var(--primary);
  border-radius: 12px;
  padding: 18px 22px;
  font-family: var(--font-body);
  color: var(--white);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.value-prop-overlay .vp-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--primary-light);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.value-prop-overlay .vp-headline {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--white);
  margin-bottom: 10px;
}

.value-prop-overlay .vp-body {
  font-size: 13px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
}

.value-prop-overlay .vp-highlight {
  color: var(--primary-light);
  font-weight: 600;
}

.hidden { display: none !important; }
"""

with open(os.path.join(SLIDES_DIR, 'global.css'), 'w') as f:
    f.write(GLOBAL_CSS)
print(f'✓ global.css written ({len(GLOBAL_CSS)} bytes)')

# ---------- MassaPro value-prop overlay content per slide ----------
VALUE_PROP_OVERLAYS = {
    2: {  # Overview slide
        'position': {'top': '85px', 'left': '60px', 'width': '560px'},
        'eyebrow': 'THE MASSAPRO PLATFORM',
        'headline': 'One Platform. A Complete Agentic AI Workforce.',
        'body': 'Our <span class="vp-highlight">proprietary LLM</span> orchestrates the entire customer journey across every channel — replacing the call center with a <span class="vp-highlight">growth machine</span> powered by Agentic AI. Unlike most providers that charge per-minute AI tokens for voice or text, MassaPro offers a flat <span class="vp-highlight">pay-per-agent + volume pricing</span> — scaling without surprise bills.',
    },
    5: {  # Architecture diagram slide
        'position': {'top': '90px', 'left': '60px', 'width': '520px'},
        'eyebrow': 'PROPRIETARY LLM · OMNI-CHANNEL',
        'headline': 'A single LLM orchestrating every customer touchpoint.',
        'body': 'Voice, video, chat, email, and WhatsApp — all routed through <span class="vp-highlight">our proprietary LLM</span>. No third-party token fees. No per-minute charges. Just <span class="vp-highlight">predictable per-agent pricing</span> that scales with your business.',
    },
    22: {  # Build Your AI Workforce slide
        'position': {'top': '85px', 'left': '60px', 'width': '540px'},
        'eyebrow': 'AGENTIC AI WORKFORCE',
        'headline': 'Replace your call center with a coordinated AI workforce.',
        'body': 'AI agents are not chatbots. They are autonomous systems that reason, decide, and act — orchestrated by <span class="vp-highlight">our proprietary LLM</span>. Specialized agents handle sales, service, retention, and claims together, scaling without headcount or per-minute token costs.',
    },
    28: {  # Summary slide
        'position': {'top': '90px', 'left': '60px', 'width': '560px'},
        'eyebrow': 'THE MASSAPRO ADVANTAGE',
        'headline': 'A growth machine, not a cost center.',
        'body': 'Replace the entire call center and customer journey platform with <span class="vp-highlight">Agentic AI orchestrated by our proprietary LLM</span>. Scale without per-minute AI token fees — pay a flat <span class="vp-highlight">per-agent + volume price</span>. Save costs. Boost productivity. Turn service into growth.',
    },
    29: {  # AI Marketplace slide
        'position': {'top': '85px', 'left': '60px', 'width': '520px'},
        'eyebrow': 'CONNECT EVERYTHING',
        'headline': 'Live CRM, payments, and logistics — all under one LLM.',
        'body': 'MassaPro agents act inside your existing tech stack via the AI Marketplace. Two-way CRM sync, webhooks, REST APIs, and MCP — every tool called by <span class="vp-highlight">our proprietary LLM</span> in real time, with no per-token billing.',
    },
}

# ---------- Generate 30 HTML slides ----------
SLIDES_BRIEF = {
    'design': {
        'title': 'MassaPro Enterprise Brochure (Rebranded from ConnexAI)',
        'style_name': 'MassaPro Purple Brand Book',
        'palette': {
            'background': '#1A0B2E',
            'primary': '#7C3AED',
            'accent': '#A78BFA',
        },
        'typography': {'heading': 'Inter', 'body': 'Inter', 'numeric': 'Inter'},
        'reference': 'MassaPro IVR rebrand + secretary.massapro.com',
    },
    'global_css_path': os.path.join(SLIDES_DIR, 'global.css'),
    'slides_dir': SLIDES_DIR,
    'language': 'en',
    'speaker_notes': 'none',
    'slides': [],
}

for pno in range(1, 31):
    # Cover slide (1) and closing slide (30) — no brand bar (cleaner look)
    show_brand_bar = pno not in (1, 30)
    
    # Value-prop overlay (only on specified slides)
    show_value_prop = pno in VALUE_PROP_OVERLAYS
    vp_html = ''
    if show_value_prop:
        vp = VALUE_PROP_OVERLAYS[pno]
        pos_style = f"top:{vp['position']['top']};left:{vp['position']['left']};width:{vp['position']['width']};"
        vp_html = f'''<div class="value-prop-overlay" style="{pos_style}">
  <div class="vp-eyebrow">{vp['eyebrow']}</div>
  <div class="vp-headline">{vp['headline']}</div>
  <div class="vp-body">{vp['body']}</div>
</div>'''
    
    brand_bar_html = ''
    if show_brand_bar:
        brand_bar_html = '''<div class="massapro-brand-bar">
  <span class="icon">M</span>
  MassaPro
</div>'''
    
    page_footer_html = f'<div class="page-footer">MassaPro · {pno:02d} / 30</div>'
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Slide {pno:02d} — MassaPro Enterprise Brochure</title>
<link rel="stylesheet" href="global.css">
</head>
<body>
<div class="slide-canvas">
  <img src="images/page_{pno:02d}.jpg" class="bg-image" alt="Slide {pno:02d}" />
{brand_bar_html}
{vp_html}
{page_footer_html}
</div>
</body>
</html>
"""
    out_path = os.path.join(SLIDES_DIR, f'slide_{pno:02d}.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    SLIDES_BRIEF['slides'].append({
        'title': f'Slide {pno:02d}',
        'layout': 'cover' if pno == 1 else ('closing' if pno == 30 else 'body'),
        'output_path': out_path,
        'task_brief': f'Recolored page image as background + MassaPro brand bar + page footer' + (' + value-prop overlay' if show_value_prop else ''),
    })

# Save slides_brief.json
with open(os.path.join(SLIDES_DIR, 'slides_brief.json'), 'w') as f:
    json.dump(SLIDES_BRIEF, f, indent=2)

print(f'\n✓ Generated 30 HTML slides at {SLIDES_DIR}')
print(f'✓ slides_brief.json saved')
print(f'  - global.css: 1 file')
print(f'  - HTML slides: 30 files')
print(f'  - images: {len(os.listdir(IMG_DIR))} files')
