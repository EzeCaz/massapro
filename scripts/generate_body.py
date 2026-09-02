"""
MassaPro AI Omni-Channel Platform — Technical & Integration Manual
Body PDF generator (ReportLab). Cover is generated separately via html2poster.js
and merged in via pypdf.

Palette: MassaPro site palette (user-specified)
  Primary:  #7c3aed  (purple-600)
  Dark:     #6d28d9  (purple-700)
  Light:    #ede9fe  (purple-100)
  Ultralight:#f5f3ff (purple-50)
  Text:     #1f2937
  Muted:    #6b7280
  Border:   #e5e7eb
"""
import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle,
    KeepTogether, HRFlowable, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from PIL import Image as PILImage

# ─── PDF Skill scripts on path for install_font_fallback ───
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))
from pdf import install_font_fallback

# ───────────────────── Color Palette (MassaPro site palette) ─────────────────────
ACCENT         = colors.HexColor('#7c3aed')   # purple-600
ACCENT_DARK    = colors.HexColor('#6d28d9')   # purple-700
ACCENT_LIGHT   = colors.HexColor('#ede9fe')   # purple-100
ACCENT_ULTRA   = colors.HexColor('#f5f3ff')   # purple-50
TEXT_PRIMARY   = colors.HexColor('#1f2937')
TEXT_MUTED     = colors.HexColor('#6b7280')
BG_SURFACE     = colors.HexColor('#f9fafb')
BG_PAGE        = colors.white
BORDER_LIGHT   = colors.HexColor('#e5e7eb')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = ACCENT_ULTRA

# ───────────────────── Font Registration ─────────────────────
# Use Liberation Serif (open-source Times New Roman metric-compatible equivalent).
# Carlito is metric-compatible with Calibri. DejaVuSans for code/symbols.
pdfmetrics.registerFont(TTFont('Tinos', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Tinos-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Tinos-Italic', '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Tinos-BoldItalic', '/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('Tinos', normal='Tinos', bold='Tinos-Bold', italic='Tinos-Italic', boldItalic='Tinos-BoldItalic')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')
install_font_fallback()

# ───────────────────── Page Geometry ─────────────────────
PAGE_W, PAGE_H = A4
LEFT_M  = 0.85 * inch
RIGHT_M = 0.85 * inch
TOP_M   = 0.85 * inch
BOT_M   = 0.85 * inch
AVAIL_W = PAGE_W - LEFT_M - RIGHT_M  # ~428pt

# ───────────────────── Styles ─────────────────────
BODY_FONT = 'Tinos'

h1_style = ParagraphStyle('H1', fontName=BODY_FONT, fontSize=20, leading=26,
    textColor=ACCENT_DARK, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT)
h2_style = ParagraphStyle('H2', fontName=BODY_FONT, fontSize=14, leading=20,
    textColor=ACCENT, spaceBefore=14, spaceAfter=6, alignment=TA_LEFT)
h3_style = ParagraphStyle('H3', fontName=BODY_FONT, fontSize=11.5, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=4, alignment=TA_LEFT)
body_style = ParagraphStyle('Body', fontName=BODY_FONT, fontSize=10.5, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=8, alignment=TA_JUSTIFY)
body_left_style = ParagraphStyle('BodyLeft', parent=body_style, alignment=TA_LEFT)
bullet_style = ParagraphStyle('Bullet', fontName=BODY_FONT, fontSize=10.5, leading=15,
    textColor=TEXT_PRIMARY, leftIndent=18, bulletIndent=6, spaceBefore=1, spaceAfter=3,
    alignment=TA_LEFT)
muted_style = ParagraphStyle('Muted', fontName=BODY_FONT, fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10)
caption_style = ParagraphStyle('Caption', fontName=BODY_FONT, fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=14, italic=True)

# Table styles
th_style = ParagraphStyle('TH', fontName=BODY_FONT, fontSize=10, leading=13,
    textColor=colors.white, alignment=TA_LEFT, leftIndent=0)
th_center = ParagraphStyle('THC', parent=th_style, alignment=TA_CENTER)
td_style = ParagraphStyle('TD', fontName=BODY_FONT, fontSize=9.5, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leftIndent=0)
td_center = ParagraphStyle('TDC', parent=td_style, alignment=TA_CENTER)
td_bold = ParagraphStyle('TDB', parent=td_style, fontName=BODY_FONT)
td_bold = ParagraphStyle('TDBold', parent=td_style, fontName=BODY_FONT)

# Callout
stat_big = ParagraphStyle('StatBig', fontName=BODY_FONT, fontSize=22, leading=26,
    textColor=ACCENT, alignment=TA_CENTER)
stat_lbl = ParagraphStyle('StatLbl', fontName=BODY_FONT, fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER)

# TOC styles
toc_h1 = ParagraphStyle('TOCH1', fontName=BODY_FONT, fontSize=11.5, leading=18,
    textColor=TEXT_PRIMARY, leftIndent=0, spaceBefore=4)
toc_h2 = ParagraphStyle('TOCH2', fontName=BODY_FONT, fontSize=10, leading=16,
    textColor=TEXT_MUTED, leftIndent=24, spaceBefore=2)


# ───────────────────── Helpers ─────────────────────
def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

MAX_KEEP_H = A4[1] * 0.4
def safe_keep(elements):
    total = 0
    for el in elements:
        try:
            w, h = el.wrap(AVAIL_W, A4[1])
            total += h
        except Exception:
            total += 50
    if total <= MAX_KEEP_H:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    else:
        return list(elements)

def h1(text):
    """H1 with orphan-prevention (CondPageBreak, not PageBreak)."""
    return [CondPageBreak(A4[1] * 0.18), add_heading(text, h1_style, level=0),
            HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceBefore=2, spaceAfter=10)]

def h2(text):
    return [CondPageBreak(A4[1] * 0.10), add_heading(text, h2_style, level=1)]

def h3(text):
    return [CondPageBreak(A4[1] * 0.07), Paragraph('<b>%s</b>' % text, h3_style)]

def p(text):
    return Paragraph(text, body_style)

def pl(text):
    return Paragraph(text, body_left_style)

def bullet(text):
    return Paragraph('•  %s' % text, bullet_style)

def caption(text):
    return Paragraph('<i>%s</i>' % text, caption_style)

def embed_image(path, max_width=None, max_height=None):
    if max_width is None:
        max_width = AVAIL_W
    if max_height is None:
        max_height = A4[1] * 0.55
    img = PILImage.open(path)
    w, h = img.size
    rw = max_width / w if w > max_width else 1.0
    rh = max_height / h if h > max_height else 1.0
    r = min(rw, rh)
    return Image(path, width=w * r, height=h * r)

def callout(stat, label, width=140):
    t = Table(
        [[Paragraph('<b>%s</b>' % stat, stat_big)],
         [Paragraph(label, stat_lbl)]],
        colWidths=[width]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_ULTRA),
        ('BOX', (0,0), (-1,-1), 1, ACCENT),
        ('LINEABOVE', (0,1), (-1,1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return t

def callout_row(items):
    """Row of stat callouts, evenly spaced."""
    n = len(items)
    each_w = AVAIL_W / n
    cells = []
    for stat, lbl in items:
        c = callout(stat, lbl, width=each_w - 10)
        cells.append(c)
    outer = Table([cells], colWidths=[each_w] * n, hAlign='CENTER')
    outer.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    return outer

def std_table(data_rows, col_ratios, header=True):
    """data_rows: list of lists of strings (already-plain). First row is header if header=True.
    col_ratios: list of floats summing to 1.0"""
    col_widths = [r * AVAIL_W for r in col_ratios]
    # Wrap all cells in Paragraph
    rows = []
    for ri, row in enumerate(data_rows):
        prow = []
        for ci, cell in enumerate(row):
            if header and ri == 0:
                prow.append(Paragraph('<b>%s</b>' % cell, th_style))
            else:
                prow.append(Paragraph(cell, td_style))
        rows.append(prow)
    t = Table(rows, colWidths=col_widths, hAlign='CENTER', repeatRows=1 if header else 0)
    style = [
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.4, BORDER_LIGHT),
    ]
    if header:
        style += [
            ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ]
        # Alternating rows
        for i in range(1, len(rows)):
            bg = TABLE_ROW_ODD if (i % 2 == 1) else TABLE_ROW_EVEN
            style.append(('BACKGROUND', (0,i), (-1,i), bg))
    t.setStyle(TableStyle(style))
    return t

def info_box(text, label=None):
    """Light purple info callout box."""
    rows = []
    if label:
        rows.append([Paragraph('<b>%s</b>' % label, ParagraphStyle('ibL', fontName=BODY_FONT, fontSize=9, textColor=ACCENT, alignment=TA_LEFT, spaceAfter=4))])
    rows.append([Paragraph(text, ParagraphStyle('ibT', fontName=BODY_FONT, fontSize=10, leading=15, textColor=TEXT_PRIMARY, alignment=TA_LEFT))])
    t = Table(rows, colWidths=[AVAIL_W], hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_ULTRA),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    return t


# ───────────────────── Page Header / Footer ─────────────────────
def header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFont(BODY_FONT, 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_M, A4[1] - TOP_M + 22, 'MassaPro AI Omni-Channel Platform')
    canvas.drawRightString(PAGE_W - RIGHT_M, A4[1] - TOP_M + 22, 'Technical & Integration Manual')
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.6)
    canvas.line(LEFT_M, A4[1] - TOP_M + 16, PAGE_W - RIGHT_M, A4[1] - TOP_M + 16)
    # Footer
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_M, BOT_M - 22, 'MassaPro  |  eze@massapro.com  |  massapro.com')
    page_num = canvas.getPageNumber()
    canvas.drawRightString(PAGE_W - RIGHT_M, BOT_M - 22, 'Page %d' % page_num)
    canvas.setStrokeColor(BORDER_LIGHT)
    canvas.setLineWidth(0.4)
    canvas.line(LEFT_M, BOT_M - 14, PAGE_W - RIGHT_M, BOT_M - 14)
    canvas.restoreState()


# ───────────────────── TOC DocTemplate ─────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))


# ───────────────────── Build Story ─────────────────────
story = []

# ── TOC PAGE ──
toc_title = ParagraphStyle('TOCTitle', fontName=BODY_FONT, fontSize=22, leading=28,
    textColor=ACCENT_DARK, alignment=TA_LEFT, spaceBefore=0, spaceAfter=18)
story.append(Paragraph('Table of Contents', toc_title))
story.append(HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceBefore=2, spaceAfter=14))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: PLATFORM OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('1. Platform Overview'))

story.append(p(
    'The MassaPro AI Omni-Channel Platform is an enterprise-grade, modular cloud ecosystem engineered for high-scale customer interaction management. '
    'Formerly referenced as the Athena Suite, the platform has been rebranded and unified under the MassaPro identity, bringing together advanced speech recognition, '
    'autonomous conversational bots, an internal knowledge repository driven by large language models, and real-time analytics into a single cohesive framework. '
    'The platform is purpose-built for organizations that require low-latency performance across multiple communication channels while maintaining rigorous security standards '
    'such as SOC 2 Type II, GDPR, HIPAA, and ISO compliance.'
))

story.append(p(
    'MassaPro is hosted within a Dedicated Private Tenant (VPC) on AWS, ensuring complete data isolation, predictable performance, and high availability. '
    'The architecture is designed to orchestrate real-time omni-channel data through contextual LLM routing, achieving up to 5x faster data processing compared to legacy frameworks. '
    'The proprietary MassaPro Large Language Model powers every conversational surface on the platform, from autonomous AI Agents handling inbound customer queries to the AI Guru co-pilot '
    'that augments human agents with retrieval-augmented generation during live calls.'
))

story.extend(h3('Design Philosophy'))
story.append(p(
    'The platform is built around four core principles: <b>modularity</b> (each AI engine can be deployed independently or together), <b>low-latency real-time processing</b> '
    '(sustained sub-300ms roundtrip on the ASR & Voice layer), <b>security-by-design</b> (TLS 1.3 in transit, AES-256 at rest, automatic PII redaction), and '
    '<b>orchestration flexibility</b> via the MassaPro Flow drag-and-drop workflow builder. This combination allows integrators to deploy MassaPro in a fully managed SaaS model '
    'or as a customized enterprise installation tailored to specific industry workflows.'
))

story.extend(h3('Platform Identity Transition'))
story.append(p(
    'The platform previously operated under the Athena Suite product naming convention. All references to legacy naming have been consolidated under the MassaPro brand. '
    'The four flagship AI engines — AI Agent, AI Guru, AI Analytics, and ASR & Voice — retain their functional identity but are now marketed and documented as MassaPro modules. '
    'Existing integrations, API endpoints, and configuration files continue to function unchanged; only the brand surface has been updated.'
))

story.extend(h3('Core Value Propositions'))
story.append(callout_row([
    ('5x', 'Faster data processing vs. legacy frameworks'),
    ('50x', 'More interactions than human-operated queues'),
    ('70%', 'Decrease in average handle time'),
    ('24/7', 'Always-on autonomous operation'),
]))
story.append(Spacer(1, 14))

story.extend(h3('High-Level Architecture Summary'))
story.append(p(
    'The infrastructure is categorized into five critical layers, each isolated within its own private subnet and orchestrated through a centralized API Gateway. '
    'These layers, detailed in Section 2, are: (1) the Edge Security Layer providing WAF and load balancing; (2) the Telephony & Carrier Layer managing SIP/RTP voice transport '
    'via global Tier-1 carriers; (3) the Omni-Channel Ingestion Layer receiving voice, SMS, email, live chat, and social media inputs; (4) the Core AI Engines Layer running ASR & Voice, '
    'AI Agent, AI Guru, and AI Analytics; and (5) the Orchestration & Integration Layer exposing REST APIs, Webhooks, WebSockets, and 100+ marketplace connectors.'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: SYSTEM ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('2. System Architecture'))

story.append(p(
    'The MassaPro system architecture is a layered, modular cloud framework designed for real-time orchestration across diverse communication paths. '
    'Each layer is independently scalable, fault-tolerant, and isolated within its own AWS private subnet. The diagram below illustrates the five functional layers '
    'and their constituent components, followed by a detailed technical description of each.'
))

# Architecture diagram
arch_img = embed_image('/home/z/my-project/scripts/arch-diagram.png', max_width=AVAIL_W, max_height=A4[1] * 0.62)
story.append(KeepTogether([arch_img, caption('Figure 2.1 — MassaPro AI Platform System Architecture: Five functional layers from edge security to analytics output')]))
story.append(Spacer(1, 8))

story.extend(h2('2.1 Edge Security Layer'))
story.append(p(
    'The Edge Security Layer is the public-facing perimeter of the platform. It utilizes a Web Application Firewall (WAF) to inspect and filter all inbound HTTP/HTTPS traffic '
    'against OWASP Top 10 rules, SQL injection patterns, cross-site scripting attempts, and volumetric DDoS attacks. Behind the WAF, Network Load Balancers (L4) distribute raw '
    'TCP/UDP traffic, while Application Load Balancers (L7) handle HTTPS termination with TLS 1.3 and route requests to the appropriate microservices running in Private Subnets. '
    'This dual-balancer design ensures that both voice (RTP/UDP) and web (HTTPS) traffic receive optimized routing without contention.'
))

story.extend(h2('2.2 Telephony & Carrier Layer'))
story.append(p(
    'The Telephony Layer manages all voice ingress and egress through carrier-grade protocols. SIP signaling over TCP port 5060 handles session initiation, handshakes, and call setup. '
    'Real-time audio media is transported via RTP over UDP ports 10000-20000, with dynamic port allocation per media stream. The platform maintains direct interconnects with global Tier-1 '
    'carriers and Mobile Network Operators (MNOs), with localized peering in Israel, the United States, Europe, Africa, and Australia. Dynamic Intelligent Routing continuously optimizes '
    'the path across multiple in-region carriers in real time, minimizing jitter, packet loss, and round-trip latency. This layer is detailed further in Section 4.'
))

story.extend(h2('2.3 Omni-Channel Ingestion Layer'))
story.append(p(
    'The Ingestion Layer is the entry point for all customer interactions regardless of channel. It supports Voice (inbound and outbound calls), SMS (two-way text messaging), '
    'Email (parsed and threaded), Live Chat (web and in-app), and Social Media including WhatsApp, Facebook Messenger, Instagram Direct, X (formerly Twitter), and Apple Business Chat. '
    'A PCI DSS-compliant payment flow is embedded for secure transaction processing. All channels feed into a normalized event stream that downstream AI modules consume.'
))

story.extend(h2('2.4 Core AI Engines Layer'))
story.append(p(
    'The Core AI Engines Layer hosts the four primary intelligence modules: ASR & Voice (speech-to-text and text-to-speech with sub-300ms latency), AI Agent (autonomous LLM-powered '
    'conversational bot with deterministic guardrails), AI Guru (RAG-powered co-pilot for human agents), and AI Analytics (real-time stream processing for sentiment, keyphrase, entity, '
    'and topic analysis). All four modules share the proprietary MassaPro Large Language Model and a centralized knowledge base. Section 3 provides a full deep-dive on each module.'
))

story.extend(h2('2.5 Orchestration, Integration & Analytics Layer'))
story.append(p(
    'The topmost layer combines three functions. <b>MassaPro Flow</b> is the drag-and-drop orchestration engine that lets architects design complex customer journeys, embed AI Agent and '
    'ASR features, and configure intelligent routing by skill set, language, or topic expertise. The <b>API Gateway</b> serves as the secure, centralized entry point for all external '
    'system requests, exposing RESTful APIs, Webhooks, and WebSockets for real-time integration with CRM, ERP, and BI tools. <b>Real-Time Analytics & Storage</b> processes interaction '
    'streams into structured telemetry, with all data encrypted at rest using AES-256. Over 100 marketplace connectors (Salesforce, HubSpot, Zendesk, Shopify, Slack, Stripe, and more) '
    'are pre-configured for one-click integration.'
))

story.extend(h2('2.6 End-to-End Data Flow & Telephony View'))
story.append(p(
    'While Figure 2.1 presents the platform as a stack of five functional layers, integrators frequently need a single-page view of how a customer interaction actually traverses the '
    'platform end-to-end &mdash; from the moment a lead or customer initiates contact, through AI processing, to telephony egress into the public switched network and data egress into '
    'external business systems. The diagram below provides that consolidated view.'
))
story.append(p(
    'Customer interactions enter the VPC through one of two paths: HTTPS for digital channels (Live Chat, Email, WhatsApp, Facebook, Instagram, X, Apple Business Chat, Web Form), and '
    'Tier-1 carrier interconnects for inbound voice. All ingress traffic first passes through the Web Application Firewall, which enforces OWASP Top 10 rules and DDoS protection. '
    'Authorised administrators reach the platform from the opposite flank via VPN Endpoint, Single Sign-On, or the Corporate Network. The proprietary MassaPro LLM &mdash; shown as the '
    'AI Core at the top of the VPC &mdash; powers both the <b>MassaPro Platform</b> block (where the AI Agent orchestrates every channel and back-office function from Tickets to '
    'Campaign Management) and the <b>AI Quality</b> block (where the MassaPro brain performs LLM scoring, entity recognition, call transcription, keyphrase analysis, and sentiment '
    'analysis). A service bus connects the upper processing layer to the lower egress layer, where voice traffic flows through the five-step Telephony chain (SIP Signalling &rarr; '
    'Session Setup &rarr; RTP Media Transport &rarr; Dynamic Routing &rarr; Carrier Network) and data flows through the API Gateway into external Data Warehouse, ERP, CRM, and BI systems.'
))

story.append(CondPageBreak(A4[1] * 0.55))
flow_img = embed_image('/home/z/my-project/scripts/arch-dataflow.png', max_width=AVAIL_W, max_height=A4[1] * 0.62)
story.append(KeepTogether([flow_img, caption('Figure 2.2 — MassaPro End-to-End Data Flow &amp; Telephony Architecture: WAF-protected AWS VPC showing customer ingress, AI processing, telephony egress, and admin access paths')]))
story.append(Spacer(1, 8))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: CORE AI MODULES
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('3. Core AI Modules'))

story.append(p(
    'The platform\'s intelligence is distributed across four primary engines, each engineered to handle a distinct function within the customer interaction lifecycle. '
    'All four modules share the proprietary MassaPro Large Language Model and a centralized knowledge repository. Updates to knowledge articles circulate instantly across the '
    'ecosystem, and the system can automatically identify content gaps based on real customer interactions, generating new articles to expand the knowledge base. '
    'The module map below illustrates the functional relationship between the four engines and the MassaPro Flow orchestration layer that binds them.'
))

mod_img = embed_image('/home/z/my-project/scripts/module-map.png', max_width=AVAIL_W, max_height=A4[1] * 0.62)
story.append(KeepTogether([mod_img, caption('Figure 3.1 — MassaPro Core AI Modules Map: Four engines sharing the in-house LLM, orchestrated via MassaPro Flow')]))
story.append(Spacer(1, 8))

story.extend(h2('3.1 MassaPro ASR & Voice'))
story.append(p(
    'The MassaPro Automatic Speech Recognition (ASR) and Voice synthesis engine provides the foundational interface for human-to-machine engagement. '
    'It is engineered to prioritize precision and linguistic nuance, sustaining a roundtrip latency threshold below 300ms, which eliminates the staccato effect of traditional voice bots '
    'and enables fluid, natural-sounding conversations. The module employs adaptive noise filtering and custom acoustic models to ensure high-accuracy capture even in challenging '
    'acoustic environments, including background office noise, mobile network degradation, and varied accents or dialects.'
))
story.append(p(
    'On the synthesis side, the Text-to-Speech (TTS) engine offers three configuration sliders that allow integrators to define brand-specific voice identities. '
    'Tone of Voice can be tuned from Friendly to Authoritative; Formality Level ranges from Casual to Formal; and Language Complexity ranges from Simple to Complex. '
    'These sliders ensure that every automated voice interaction aligns with the client\'s brand identity, regardless of the language being spoken. '
    'Specialized synchronization between Speech-to-Text (STT) and TTS maintains conversational context across multi-turn interactions, which is critical for handling complex transactions '
    'such as appointment booking and payment processing where context retention across turns directly affects completion rates.'
))

story.extend(h3('Key Technical Specifications'))
story.append(std_table([
    ['Specification', 'Value', 'Functional Detail'],
    ['Roundtrip Latency', '<300ms', 'Sustained across all voice channels'],
    ['ASR Accuracy', '99%', 'Measured on standard telephony audio'],
    ['Language Support', '100+ languages', 'Multi-language synchronization'],
    ['Tone of Voice', 'Friendly to Authoritative', 'Brand-configurable slider'],
    ['Formality Level', 'Casual to Formal', 'Brand-configurable slider'],
    ['Language Complexity', 'Simple to Complex', 'Brand-configurable slider'],
    ['Acoustic Processing', 'Adaptive noise filtering', 'Custom acoustic models per region'],
], [0.30, 0.25, 0.45]))
story.append(Spacer(1, 14))

story.extend(h3('ASR Customization: Confidence Scores & Intents'))
story.append(p(
    'The ASR module allows administrators to customize confidence scores and intent mappings to match specific business needs. Intent Mapping connects specific customer phrases '
    'to predefined user journeys. When the AI encounters phrases with a low confidence score, administrators can manually confirm the correct intent, which trains the model to recognize '
    'and respond to those phrases more accurately in future interactions. This precision control ensures that customer journeys are tailored and that the ASR assistant provides the most '
    'personal and relevant level of support. The training module includes a summary page with Knowledge Recommendations and Confidence Levels, helping administrators identify knowledge '
    'gaps where additional articles or training data may be required.'
))

story.extend(h2('3.2 MassaPro AI Agent'))
story.append(p(
    'The AI Agent is an autonomous conversational engine powered by the proprietary MassaPro Large Language Model with deterministic guardrails. '
    'These guardrails are hardened logic layers that ensure the LLM remains within brand-safe parameters, delivering consistent, professional responses even in edge cases. '
    'The AI Agent is designed to handle 50x more interactions than standard human-operated queues while achieving a 70% decrease in average handle time. '
    'It provides 24/7 multi-language support across 100+ languages and can perform complex transactions including automated payment processing, appointment booking, invoice extraction '
    'and validation, claims processing intake, and lead qualification — all without human intervention.'
))
story.append(p(
    'A key differentiator is the AI Agent\'s self-learning capability. The training module matches specific customer phrases and intents to predefined user journeys, '
    'allowing administrators to boost confidence levels through manual intent confirmation. When the agent encounters phrases it has a low confidence of understanding, '
    'the administrator can confirm the correct intent and the model trains itself to recognize and respond to those phrases more accurately in future interactions. '
    'This creates a continuous improvement loop where the agent becomes more accurate over time as it processes more real customer conversations.'
))

story.extend(h3('Transactional Capabilities'))
story.append(p(
    'The AI Agent manages high-value financial and administrative tasks through predefined scripts and integration with secure backend systems. '
    'Transaction Completion enables the agent to engage with customers in natural-sounding conversations to manage payment processing and complete transactions without human intervention. '
    'Workflow Automation handles routine financial tasks such as invoice processing (automatically extracting and validating data) and claims processing (automating intake and validation). '
    'By using predefined scripts and integrating with secure backend systems, the agent minimizes human error and ensures that financial interactions meet regulatory disclosures and '
    'compliance requirements. This is particularly valuable in high-compliance sectors such as legal and healthcare, where disclosure accuracy is non-negotiable.'
))

story.extend(h2('3.3 MassaPro AI Guru'))
story.append(p(
    'The AI Guru module functions as a Retrieval-Augmented Generation (RAG) intelligent co-pilot for human agents. It creates a technical synergy between the in-house MassaPro LLM '
    'and an enterprise knowledge repository, significantly reducing agent training time while providing instant return on investment. The system utilizes live transcription to feed the '
    'RAG engine during active calls, which then provides Real-Time Coaching Prompts and CSAT Recommendations directly to the human agent\'s screen. '
    'This empowers agents to handle a wider range of queries without extensive prior training, decreasing response times and allowing experienced staff to focus on strategic tasks.'
))

story.extend(h3('Knowledge Source Ingestion'))
story.append(p(
    'AI Guru can ingest and synthesize the following source types: <b>Document Assets</b> (PDFs and local text files), <b>Visual Data</b> (images and infographics), '
    '<b>External Content</b> (automated web-scraped content and Knowledge Base Articles), and <b>Third-Party Assets</b> (data pulled from integrated third-party application stacks). '
    'Users upload proprietary documentation and local assets directly into the platform\'s knowledge repository to power up the internal LLM, making the AI Agents more advanced '
    'and contextually aware of specific company procedures or products. Internal best-practice documents and files enrich AI prompts, ensuring the AI provides support that aligns '
    'perfectly with a company\'s unique brand voice and documentation. The web scraping capability consolidates information from various external sources into the LLM without requiring '
    'manual data entry.'
))

story.extend(h3('Real-Time Coaching Mechanism'))
story.append(p(
    'During live customer interactions, AI Guru analyzes the ongoing conversation using real-time call transcripts and sentiment detection. '
    'When it identifies specific customer triggers — for example, a customer stating "cancel my contract" — it automatically displays contextual coaching prompts on the agent\'s screen. '
    'These prompts suggest effective responses, such as offering a specific discount or a tailored retention script. Using RAG, AI Guru instantly scans the enterprise knowledge base '
    'to provide agents with precise answers and relevant article suggestions, reducing the time spent searching for information. Sentiment insights from AI Analytics feed directly into '
    'AI Guru to trigger relevant coaching prompts, ensuring agents respond with the appropriate level of empathy or authority based on the customer\'s current mood.'
))

story.extend(h3('Knowledge Article Synchronization'))
story.append(p(
    'Knowledge articles and snippets are synchronized with AI Guru through a centralized, real-time distribution system within the AI Knowledge hub. '
    'When content is created or updated in the Article Editor, it is circulated throughout the entire AI ecosystem instantly, ensuring that AI Guru and other agents always have the most '
    'current information. The system can automatically identify content gaps based on real customer interactions and generate new articles to expand the knowledge base, which AI Guru '
    'then uses to resolve future queries. This eliminates the manual burden of article maintenance and ensures the knowledge base evolves naturally with customer needs.'
))

story.extend(h2('3.4 MassaPro AI Analytics'))
story.append(p(
    'The AI Analytics engine employs real-time stream processing to convert raw conversational data into high-density telemetry for data-driven decision-making. '
    'It transforms unstructured interaction data — voice calls, chat transcripts, email threads, social media messages — into structured, actionable business intelligence. '
    'The module offers six primary analytical functions, each designed to surface different categories of insight from the same underlying interaction data.'
))

story.extend(h3('Analytics Capabilities'))
story.append(std_table([
    ['Capability', 'Description', 'Business Use Case'],
    ['Sentiment Analysis', 'Assesses emotional states (positive, neutral, negative) by analyzing language and context. Highlights traits such as Politeness, Anger, and Empathy.', 'Live monitoring of emotional health; proactive issue escalation before complaints.'],
    ['Keyphrase Analysis', 'Identifies trending keywords and phrases via wordclouds. Groups popular terms to spot industry shifts.', 'Spot emerging product issues; identify common customer pain points.'],
    ['Entity Recognition', 'Automatically identifies and classifies critical elements such as product names, locations, and financial amounts.', 'Convert unstructured data into structured fields; automate routing.'],
    ['Topic-Based Modeling', 'Groups interactions by similar characteristics and time periods for deeper organizational understanding.', 'Segment support volume by topic; forecast seasonal demand.'],
    ['Interaction Summarization', 'Automatically produces concise summaries of conversations, eliminating manual interpretation.', 'Reduce after-call work; faster supervisor review.'],
    ['PII Redaction', 'Automatic identification and redaction of Personally Identifiable Information from transcripts and reports.', 'GDPR/HIPAA compliance; safe reporting without sensitive data exposure.'],
], [0.22, 0.42, 0.36]))
story.append(Spacer(1, 12))

story.append(p(
    'A particularly powerful application of Entity Recognition is proactive issue prevention. For example, if a manufacturer begins shipping defective products and starts receiving '
    'calls regarding specific defects, leaders can spot this trend early and take immediate action to prevent further defective units from being shipped. '
    'This proactive approach is vital across industries, allowing businesses to address potential problems swiftly, minimize negative impacts, and enhance customer satisfaction.'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: TELEPHONY & NETWORK
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('4. Telephony & Network Infrastructure'))

story.append(p(
    'The MassaPro platform utilizes carrier-grade protocols and specific port allocations to ensure high-fidelity voice transport. '
    'The network architecture is optimized for global reach with localized connectivity in key regions, including direct interconnects with Mobile Network Operators (MNOs) '
    'and fixed-line providers. This section documents the exact protocol specifications, port allocations, and routing logic that integrators need when configuring SIP trunking, '
    'firewall rules, or carrier interconnects.'
))

story.extend(h2('4.1 Protocol & Port Specifications'))
story.append(std_table([
    ['Process', 'Protocol / Specification', 'Functional Detail'],
    ['SIP Signaling', 'SIP over TCP (Port 5060)', 'Manages session initiation, SIP handshakes, and call setup procedures.'],
    ['Media Transport', 'RTP over UDP (Ports 10000-20000)', 'Facilitates real-time audio transport with dynamic port allocation for media streams.'],
    ['Carrier Connectivity', 'Tier-1 Global & Regional Peering', 'Direct integration with MNOs and fixed-line providers in Israel, US, EU, Africa, Australia.'],
    ['Routing Logic', 'Dynamic Intelligent Routing', 'Real-time path optimization across multiple in-region carriers to minimize jitter and latency.'],
    ['TLS Encryption', 'TLS 1.3', 'All SIP signaling and HTTPS traffic encrypted in transit.'],
    ['Media Encryption', 'SRTP (optional)', 'Secure Real-time Transport Protocol for encrypted media streams on regulated deployments.'],
], [0.22, 0.30, 0.48]))
story.append(Spacer(1, 14))

story.extend(h2('4.2 Carrier Connectivity & Global Reach'))
story.append(p(
    'MassaPro maintains direct interconnects with global Tier-1 carriers and regional Mobile Network Operators. The platform operates from dedicated private tenants on AWS '
    'with localized peering points in Israel (HQ operations), the United States (Miami), Spain (Barcelona), the United Kingdom (Manchester), South Africa (Durban), '
    'Australia (Melbourne), Nigeria, and Kenya. This distributed footprint ensures that voice traffic can be terminated locally in most major markets, '
    'reducing international transit costs and improving audio quality. The Dynamic Intelligent Routing engine continuously monitors carrier health metrics '
    '(jitter, packet loss, round-trip time) and reroutes traffic in real time to the best-performing carrier for each destination.'
))

story.extend(h2('4.3 Firewall & Network Configuration'))
story.append(p(
    'When deploying MassaPro in an enterprise environment, the following firewall rules must be configured to allow voice traffic to flow correctly. '
    'SIP signaling requires inbound and outbound TCP port 5060 to be open between the enterprise SIP trunk and the MassaPro telephony layer. '
    'RTP media requires UDP ports 10000-20000 to be open in both directions. For deployments behind a Session Border Controller (SBC), the SBC should be configured '
    'to anchor media and forward SIP to the MassaPro telephony ingress. All signaling traffic should be encrypted using TLS 1.3, and media should use SRTP where regulatory '
    'requirements mandate end-to-end media encryption.'
))

story.extend(h3('Required Firewall Rules'))
story.append(std_table([
    ['Direction', 'Protocol', 'Port Range', 'Purpose'],
    ['Inbound', 'TCP', '5060', 'SIP signaling from carrier / SBC to MassaPro'],
    ['Outbound', 'TCP', '5060', 'SIP signaling from MassaPro to carrier / SBC'],
    ['Inbound', 'UDP', '10000-20000', 'RTP media from carrier / SBC to MassaPro'],
    ['Outbound', 'UDP', '10000-20000', 'RTP media from MassaPro to carrier / SBC'],
    ['Outbound', 'TCP', '443', 'HTTPS API calls to CRM / ERP / BI integrations'],
    ['Outbound', 'TCP', '80', 'OCSP / CRL checks for TLS certificate validation'],
], [0.16, 0.14, 0.20, 0.50]))
story.append(Spacer(1, 10))

story.append(info_box(
    'Always test SIP connectivity using a packet capture (Wireshark) on port 5060 before opening a support ticket. '
    'Most SIP registration failures are caused by asymmetric routing or NAT traversal issues at the enterprise firewall, not by MassaPro platform configuration.',
    label='Integration Note'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5: SECURITY & COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('5. Security, Compliance & Data Integrity'))

story.append(p(
    'MassaPro incorporates rigorous safeguards to meet the requirements of high-compliance industries such as legal, healthcare, financial services, and government. '
    'The platform adheres to a Security-by-Design philosophy, maintaining rigorous international certifications and advanced encryption standards. '
    'This section documents the full security stack, compliance frameworks, access control mechanisms, and privacy engineering controls that integrators must understand '
    'when deploying MassaPro in regulated environments.'
))

story.extend(h2('5.1 Encryption Standards'))
story.append(p(
    'All data in transit between MassaPro and external systems (carriers, browsers, API clients, integrated CRMs) is encrypted using TLS 1.3, the current industry standard '
    'for transport-layer security. TLS 1.3 provides forward secrecy, eliminates vulnerable cipher suites from previous TLS versions, and reduces handshake latency. '
    'All data at rest — including call recordings, chat transcripts, analytics summaries, knowledge base documents, and configuration data — is encrypted using AES-256 '
    '(Advanced Encryption Standard with 256-bit keys), which is approved by the U.S. National Security Agency for top-secret information. '
    'Encryption keys are managed within AWS Key Management Service (KMS) with automatic rotation policies.'
))

story.extend(h2('5.2 Compliance Frameworks'))
story.append(p(
    'MassaPro is engineered to meet the requirements of the following compliance frameworks. The platform is SOC 2 Type II certified, demonstrating that its security controls '
    'have been audited by an independent third party and operate effectively over time. The platform is also designed to be GDPR-ready (European Union General Data Protection Regulation) '
    'and HIPAA-ready (United States Health Insurance Portability and Accountability Act), making it suitable for deployment in high-compliance sectors such as legal and healthcare. '
    'ISO compliance is maintained through the platform\'s quality management system. Specific compliance scoping should be reviewed per deployment, as some frameworks require '
    'customer-side configuration (such as Business Associate Agreements for HIPAA-covered entities).'
))

story.extend(h3('Security & Compliance Standards Matrix'))
story.append(std_table([
    ['Security Category', 'Technical Standard / Certification'],
    ['Data in Transit', 'TLS 1.3 (all signaling, API, and web traffic)'],
    ['Data at Rest', 'AES-256 (call recordings, transcripts, knowledge base, configuration)'],
    ['Compliance Frameworks', 'SOC 2 Type II, GDPR, HIPAA-ready, ISO'],
    ['Access Control', 'VPN, Single Sign-On (SSO), Dedicated Private Tenants, Role-Based Access Control (RBAC)'],
    ['Network Protection', 'Web Application Firewall (WAF), Network & Application Load Balancers, DDoS Shield'],
    ['PII Protection', 'Automatic identification and redaction in transcripts and analytics reports'],
    ['Key Management', 'AWS KMS with automatic key rotation'],
    ['Audit Logging', 'Comprehensive audit trail of all administrative and user actions'],
], [0.32, 0.68]))
story.append(Spacer(1, 14))

story.extend(h2('5.3 Access Control'))
story.append(p(
    'Access to MassaPro administration and agent interfaces is governed by a layered access control model. <b>VPN</b> is required for direct administrative access to the platform\'s '
    'private subnets. <b>Single Sign-On (SSO)</b> integration supports SAML 2.0 and OAuth 2.0, allowing enterprises to federate authentication through their existing identity provider '
    '(Microsoft Entra ID, Okta, Google Workspace, etc.). Each customer deployment runs in a <b>Dedicated Private Tenant</b> on AWS, ensuring complete logical isolation from other tenants. '
    'Within each tenant, <b>Role-Based Access Control (RBAC)</b> governs what actions each user can perform, with predefined roles for administrators, supervisors, agents, and read-only auditors.'
))

story.extend(h2('5.4 Network Protection'))
story.append(p(
    'The platform\'s network perimeter is protected by a Web Application Firewall (WAF) that inspects all inbound HTTP/HTTPS traffic against OWASP Top 10 rules and custom signature sets. '
    'Network Load Balancers (L4) and Application Load Balancers (L7) distribute traffic across healthy backend instances, automatically isolating failed nodes. '
    'A DDoS Shield provides volumetric and protocol-layer attack mitigation, absorbing traffic spikes before they reach application servers. All administrative access to the AWS '
    'environment flows through bastion hosts with multi-factor authentication and session recording.'
))

story.extend(h2('5.5 PII Identification & Redaction'))
story.append(p(
    'The platform incorporates advanced data protection within the MassaPro AI Analytics engine. The system automatically identifies and masks Personally Identifiable Information (PII) '
    'from interaction data and transcripts. Categories of PII that are automatically detected include: full names, email addresses, phone numbers, Social Security numbers, credit card numbers, '
    'dates of birth, physical addresses, passport numbers, and medical record numbers. The redaction process allows businesses to collate, review, and interpret reporting and analytics '
    'without the risk of sensitive customer data being compromised or exposed to unauthorized users. Redacted data is replaced with tokenized placeholders in analytics views, '
    'while the original data remains accessible only to authorized personnel through a separate audited interface.'
))

story.extend(h2('5.6 Privacy Engineering'))
story.append(p(
    'Beyond redaction, MassaPro implements privacy engineering principles throughout the platform. Data minimization is enforced at the ingestion layer — only fields required for the '
    'configured workflow are captured. Configurable data retention policies allow administrators to specify how long each data type (call recordings, transcripts, analytics summaries) '
    'is retained before automatic deletion. Right-to-be-forgotten requests can be processed through a self-service administrative interface that purges all customer-specific data across '
    'every subsystem within 30 days, satisfying GDPR Article 17 requirements. All data processing activities are logged in an immutable audit trail available for compliance review.'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6: INTEGRATION GUIDE
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('6. Integration Guide'))

story.append(p(
    'MassaPro is designed for seamless architectural unity with existing enterprise technology stacks via high-throughput connectivity methods. '
    'This section documents the four primary integration surfaces — REST APIs, Webhooks, WebSockets, and SIP/RTP Trunking — and the marketplace of pre-configured connectors '
    'available for one-click deployment. Integrators should use this section as the authoritative reference when planning CRM, ERP, or BI integrations.'
))

story.extend(h2('6.1 API Gateway'))
story.append(p(
    'The API Gateway acts as the secure, centralized entry point for all external system requests, ensuring consistent policy enforcement. Every API request is authenticated, '
    'rate-limited, logged, and routed to the appropriate backend microservice. The gateway supports both API key authentication (for server-to-server integrations) and '
    'OAuth 2.0 bearer tokens (for user-context integrations). Rate limits are configurable per integration and per endpoint, with default thresholds of 1000 requests per minute '
    'for read endpoints and 100 requests per minute for write endpoints. All API responses are returned in JSON format with consistent envelope structure containing status, data, '
    'and metadata fields.'
))

story.extend(h2('6.2 RESTful APIs & Webhooks'))
story.append(p(
    'RESTful APIs are the primary framework for real-time data synchronization between MassaPro and external systems. Endpoints are versioned (currently v1) and documented using '
    'OpenAPI 3.0 specification, with interactive documentation available through the integrator portal. Webhooks provide event-driven triggers, pushing real-time notifications to '
    'external systems when specific events occur — such as a new lead being qualified, a call ending, a sentiment threshold being crossed, or a payment being processed. '
    'Webhook payloads are signed with HMAC-SHA256 using a per-integration secret, allowing receivers to verify authenticity. Failed webhook deliveries are retried with exponential '
    'backoff for up to 24 hours, after which the event is queued for manual review.'
))

story.extend(h2('6.3 WebSockets'))
story.append(p(
    'WebSockets enable full-duplex communication channels for low-latency digital interaction updates. This is the recommended integration method for real-time agent dashboards, '
    'live call monitoring interfaces, and any application that requires sub-second updates on interaction state changes. The WebSocket protocol carries JSON-encoded events '
    'including interaction started, message received, sentiment changed, agent assigned, and interaction ended. Connection authentication uses a short-lived JWT exchanged during '
    'the initial HTTP upgrade handshake. Heartbeat pings every 30 seconds keep connections alive through proxy firewalls.'
))

story.extend(h2('6.4 SIP/RTP Trunking'))
story.append(p(
    'For direct telephony integration, MassaPro supports SIP/RTP trunking with carrier-grade compatibility. Enterprise SIP trunks can be configured to route inbound calls directly '
    'to MassaPro\'s telephony ingress, with optional media anchoring on a Session Border Controller (SBC) for NAT traversal and security hardening. Outbound calls can be placed '
    'through MassaPro\'s AI Agent or human agent interfaces, with routing rules determining whether calls egress through MassaPro\'s Tier-1 carrier interconnects or through '
    'customer-provided SIP trunks. This flexibility allows hybrid deployments where existing carrier contracts are preserved while AI capabilities are layered on top.'
))

story.extend(h2('6.5 Marketplace Integrations'))
story.append(p(
    'MassaPro maintains a marketplace of pre-configured connectors for hundreds of standard CRM, ERP, and BI applications. These connectors handle authentication, data mapping, '
    'error handling, and retry logic out of the box, reducing integration effort from weeks to hours. Below is a representative sample of the most commonly deployed marketplace '
    'connectors. The full catalog is accessible through the integrator portal, and custom connectors can be developed for systems not yet covered.'
))

story.extend(h3('Sample Marketplace Connectors'))
story.append(std_table([
    ['Connector', 'Category', 'Sync Direction', 'Typical Use Case'],
    ['Salesforce', 'CRM', 'Bidirectional', 'Sync contacts, log calls, update opportunity stage'],
    ['HubSpot', 'CRM', 'Bidirectional', 'Sync contacts, trigger workflows, log engagements'],
    ['Zendesk', 'Support', 'Bidirectional', 'Create tickets, sync user profiles, attach call recordings'],
    ['Shopify', 'E-Commerce', 'Inbound', 'Trigger AI Agent on abandoned cart, sync order status'],
    ['Slack', 'Collaboration', 'Outbound', 'Notify channels of high-priority interactions'],
    ['Stripe', 'Payments', 'Bidirectional', 'Process payments via AI Agent, sync transaction status'],
    ['Mailchimp', 'Marketing', 'Outbound', 'Add qualified leads to email campaigns'],
    ['Calendly', 'Scheduling', 'Bidirectional', 'Book consultations directly from AI Agent conversations'],
    ['Google Calendar', 'Scheduling', 'Bidirectional', 'Block time for consultations, sync availability'],
    ['Microsoft Teams', 'Collaboration', 'Outbound', 'Notify channels, escalate interactions'],
], [0.20, 0.18, 0.18, 0.44]))
story.append(Spacer(1, 12))

story.extend(h2('6.6 Custom Integrations'))
story.append(p(
    'For systems not covered by the marketplace, MassaPro supports custom integrations via the REST API and Webhook framework. Custom integrations are typically built using '
    'a middleware layer (such as Zapier, Make, MuleSoft, or a custom Node.js/Python service) that translates between MassaPro\'s API contract and the target system\'s API. '
    'The integrator portal provides OpenAPI specifications, Postman collections, and code samples in JavaScript, Python, and Java to accelerate custom integration development. '
    'All custom integrations must register for an API key through the integrator portal and adhere to the rate limits defined in the API Gateway configuration. '
    'Enterprise-grade encryption and privacy are maintained across all integration types, meeting SOC 2, GDPR, HIPAA, and ISO requirements to ensure data is always secure.'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 7: MASSAPRO FLOW
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('7. MassaPro Flow — Workflow Automation'))

story.append(p(
    'MassaPro Flow serves as the central orchestration engine that binds the platform\'s individual AI modules into a unified, automated customer journey. '
    'Within its intuitive drag-and-drop interface, integrators can design and automate highly personalized workflows that integrate various technical features '
    'across the four core AI engines. Flow is where the platform\'s modular capabilities are composed into business outcomes — it is the layer where AI Agent, ASR, AI Guru, '
    'and AI Analytics stop being individual products and start functioning as a coordinated system.'
))

story.extend(h2('7.1 Core Capabilities'))
story.extend(h3('Conversational AI Integration'))
story.append(p(
    'Flow allows for the seamless embedding of AI Agents into workflows to handle routine queries and high-value tasks like payment processing without human intervention. '
    'AI Agent nodes within a Flow can be configured with specific knowledge base scopes, intent thresholds, and escalation rules. When an AI Agent node determines that a conversation '
    'exceeds its configured confidence threshold or requires human judgment, it can hand off to a human agent node with full context preserved.'
))

story.extend(h3('Intelligent Routing'))
story.append(p(
    'Flow utilizes data from other modules to route inbound interactions to the most appropriate human agent based on specific criteria. Routing rules can be configured around '
    'agent skill set (e.g., Spanish-speaking agents receive Spanish calls), language proficiency (e.g., advanced speakers handle complex queries), topic expertise '
    '(e.g., billing specialists receive payment disputes), or immediate availability (e.g., least-busy agent receives new chat). Multiple routing criteria can be combined '
    'with AND/OR logic to create sophisticated assignment policies.'
))

story.extend(h3('Voice and Text Processing'))
story.append(p(
    'Flow integrates directly with ASR (Automatic Speech Recognition) and AI Voice modules, enabling the use of Text-to-Speech and Speech-to-Text technologies within custom '
    'IVR menus and automated response paths. This allows integrators to build voice-based workflows that branch based on caller intent, play dynamic prompts synthesized from '
    'real-time data, and seamlessly transition between voice and text channels within a single interaction.'
))

story.extend(h2('7.2 Sales Funnel Automation'))
story.append(p(
    'MassaPro Flow acts as a drag-and-drop orchestration layer that automates routine tasks within a sales funnel to increase conversion rates and efficiency. '
    'The following numbered process describes a typical automated lead-qualification workflow, but the same patterns can be adapted to customer support, retention, '
    'onboarding, and other business processes.'
))

story.extend(h3('Sales Funnel Workflow Steps'))
story.append(std_table([
    ['Step', 'Action', 'Module Involved', 'Outcome'],
    ['1', 'New lead enters system (web form, inbound call, social DM)', 'Omni-Channel Ingestion', 'Lead record created with source attribution'],
    ['2', 'AI Agent triggers automatic outbound call to new lead within seconds', 'AI Agent + Flow', 'Instant engagement, sub-minute response time'],
    ['3', 'AI Agent asks predefined screening questions to qualify lead', 'AI Agent', 'Lead scored against qualification criteria'],
    ['4', 'Qualified leads auto-booked into consultant calendar', 'AI Agent + Calendly/Google Calendar', 'Appointment scheduled, confirmations sent'],
    ['5', 'Unqualified leads routed to nurture sequence via AI-driven SMS', 'AI Agent + SMS channel', 'Ongoing engagement without human workload'],
    ['6', 'Inbound sales inquiries intelligently routed to top performers', 'Flow + Intelligent Routing', 'Best agent receives the high-value inquiry'],
    ['7', 'AI-driven SMS and call follow-ups manage consistent engagement', 'AI Agent + Flow scheduler', 'No opportunities lost to manual follow-up gaps'],
    ['8', 'AI Analytics logs every interaction, scores sentiment, identifies drop-off points', 'AI Analytics', 'Continuous optimization of the funnel'],
], [0.07, 0.32, 0.22, 0.39]))
story.append(Spacer(1, 12))

story.append(info_box(
    'In a deployed UK law firm case study, this exact workflow produced a 22% increase in qualified lead-to-active-case conversion, '
    'reduced average response time from 2 hours to under 10 seconds, and handled over 120,000 engagements per month autonomously.',
    label='Proven Result'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 8: IMPLEMENTATION & ONBOARDING
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('8. Implementation & Onboarding'))

story.append(p(
    'The MassaPro implementation process follows a structured four-step methodology designed to take a customer from contract signing to go-live in a predictable, low-risk manner. '
    'Each step has defined inputs, outputs, and acceptance criteria. The process is fully managed by the MassaPro delivery team, with the customer providing subject-matter expertise, '
    'access to source systems, and acceptance testing resources. Typical end-to-end timelines range from 4 to 8 weeks depending on the scope of integrations and the complexity of '
    'the workflows being deployed.'
))

story.extend(h2('8.1 Implementation Process'))
story.append(std_table([
    ['Step', 'Phase', 'Key Activities', 'Typical Duration'],
    ['1', 'Scoping Meeting', 'Create bespoke rollout plan; define timescales; identify dependencies; agree on success metrics', '3-5 business days'],
    ['2', 'Data Gathering', 'Confirm scope; finalize service model; collect user lists, team structures, campaign data, account configuration', '5-10 business days'],
    ['3', 'System Setup, Site Survey & Testing', 'Platform build; IP configuration; server provisioning; security hardening; integration testing; UAT', '2-4 weeks'],
    ['4', 'Training & Go-Live', 'Group workshops at customer site; admin training; agent training; cutover; hypercare support', '1-2 weeks'],
], [0.07, 0.27, 0.46, 0.20]))
story.append(Spacer(1, 14))

story.extend(h3('Step 1 — Scoping Meeting'))
story.append(p(
    'Following the award of contract, the MassaPro delivery team works with the customer\'s project team to create a bespoke plan for rolling out the new solution. '
    'This plan includes detailed timescales based on the customer\'s needs, identifies any dependencies on third-party systems or carrier provisioning, and establishes '
    'the success metrics that will be used to evaluate the deployment. The output of this step is a signed-off Project Charter document that governs the remainder of the implementation.'
))

story.extend(h3('Step 2 — Data Gathering'))
story.append(p(
    'During this phase the delivery team confirms the scope of the customer\'s requirements and finalizes an agreed service model. Information collected for build includes: '
    'user status and role assignments, team structures and reporting hierarchies, preload campaigns and workflow definitions, telephony porting requirements, carrier interconnect '
    'details, integration credentials for CRM/ERP/BI systems, and any other vital account data. The output is a Build Specification document that the engineering team will use '
    'to configure the platform.'
))

story.extend(h3('Step 3 — System Setup, Site Survey & Testing'))
story.append(p(
    'The platform build is completed based on the information collected at the data gathering meeting. Activities include: configuring IPs, building servers, securing the platform '
    'with WAF rules and access controls, deploying AI Agent knowledge bases, configuring MassaPro Flow workflows, integrating with external systems via API connectors, '
    'and conducting end-to-end integration testing. A site survey may be conducted for on-premise components (SBCs, desk phones, network gear). User Acceptance Testing (UAT) '
    'is performed by the customer\'s project team against the acceptance criteria defined in the Project Charter.'
))

story.extend(h3('Step 4 — Training & Go-Live'))
story.append(p(
    'Group workshops are conducted at the customer\'s offices or another agreed location to introduce the team to the new technology and processes. Training is role-based: '
    'administrators learn platform configuration, supervisor tools, and analytics; agents learn the agent desktop, AI Guru co-pilot, and escalation procedures; '
    'executives learn the analytics dashboards and reporting tools. Once training is complete, the solution goes live. A hypercare period of 2-4 weeks follows go-live, '
    'during which the MassaPro delivery team provides priority support to resolve any issues and tune the configuration based on real production traffic.'
))

story.extend(h2('8.2 Knowledge Base Ingestion'))
story.append(p(
    'A critical success factor for any MassaPro deployment is the quality and completeness of the knowledge base that powers the AI Agent and AI Guru modules. '
    'The platform supports ingestion of multiple content types, and integrators should plan to dedicate time during Step 2 (Data Gathering) and Step 3 (System Setup) '
    'to populate the knowledge base with the customer\'s proprietary documentation.'
))

story.extend(h3('Supported Content Sources'))
story.append(std_table([
    ['Source Type', 'Format', 'Ingestion Method', 'Use Case'],
    ['Document Assets', 'PDF, DOCX, TXT', 'Direct upload via Article Editor', 'Product manuals, policy docs, FAQs'],
    ['Visual Data', 'PNG, JPG, SVG', 'Direct upload via Article Editor', 'Infographics, diagrams, branded visuals'],
    ['Web Content', 'HTML pages', 'Automated web scraper (URL list)', 'Public knowledge bases, partner docs'],
    ['Third-Party Apps', 'API-connected', 'Marketplace connector sync', 'Zendesk articles, Confluence pages, Notion docs'],
    ['Internal KB Articles', 'Markdown / Rich Text', 'Article Editor (in-platform)', 'Original content authored in MassaPro'],
], [0.22, 0.20, 0.28, 0.30]))
story.append(Spacer(1, 12))

story.append(p(
    'Once ingested, content is automatically indexed into the MassaPro LLM and made instantly available to AI Agent and AI Guru. Updates to articles circulate throughout the '
    'ecosystem in real time — no re-indexing or restart required. The system also identifies content gaps by analyzing real customer queries that AI Agent or AI Guru could not '
    'confidently answer, and generates draft articles for those gaps, which the customer\'s knowledge administrators can review and publish. This creates a self-improving knowledge '
    'base that evolves naturally with customer needs.'
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 9: GLOSSARY & REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════
story.extend(h1('9. Glossary & Reference'))

story.append(p(
    'This final section provides a consolidated glossary of acronyms and technical terms used throughout this manual, followed by a quick-reference table of all key technical '
    'specifications. Integrators should use this section as a quick lookup when configuring deployments or communicating with the MassaPro support team.'
))

story.extend(h2('9.1 Glossary'))
story.append(std_table([
    ['Term', 'Definition'],
    ['AES-256', 'Advanced Encryption Standard with 256-bit keys; used for data at rest in MassaPro.'],
    ['AI Agent', 'MassaPro\'s autonomous conversational LLM bot that handles customer interactions 24/7.'],
    ['AI Analytics', 'MassaPro module performing real-time stream processing of interaction data.'],
    ['AI Guru', 'MassaPro\'s RAG-powered co-pilot providing real-time coaching to human agents.'],
    ['API Gateway', 'Centralized entry point for all external API requests, enforcing auth and rate limits.'],
    ['ASR', 'Automatic Speech Recognition; converts spoken audio to text.'],
    ['CSAT', 'Customer Satisfaction score; a key metric tracked by AI Analytics.'],
    ['Flow', 'MassaPro Flow; the drag-and-drop workflow orchestration engine.'],
    ['GDPR', 'General Data Protection Regulation; EU data privacy framework.'],
    ['HIPAA', 'Health Insurance Portability and Accountability Act; US healthcare data law.'],
    ['IVR', 'Interactive Voice Response; phone menu system built using ASR and TTS.'],
    ['ISO', 'International Organization for Standardization; certifies quality management systems.'],
    ['LLM', 'Large Language Model; the AI underpinning MassaPro\'s conversational engines.'],
    ['MNO', 'Mobile Network Operator; cellular carrier providing voice/SMS connectivity.'],
    ['NLP', 'Natural Language Processing; branch of AI handling human language.'],
    ['PII', 'Personally Identifiable Information; automatically redacted by AI Analytics.'],
    ['RAG', 'Retrieval-Augmented Generation; AI Guru\'s architecture combining retrieval + LLM.'],
    ['RTP', 'Real-time Transport Protocol; carries voice media over UDP ports 10000-20000.'],
    ['SBC', 'Session Border Controller; telephony edge device for SIP security and NAT.'],
    ['SIP', 'Session Initiation Protocol; signaling protocol on TCP port 5060.'],
    ['SLA', 'Service Level Agreement; performance commitments to customers.'],
    ['SOC 2', 'Service Organization Control 2; security audit standard (Type II = operating effectiveness).'],
    ['SSO', 'Single Sign-On; federated authentication via SAML 2.0 or OAuth 2.0.'],
    ['SRTP', 'Secure RTP; encrypted media transport for regulated deployments.'],
    ['STT', 'Speech-to-Text; see ASR.'],
    ['TLS 1.3', 'Transport Layer Security version 1.3; encrypts all data in transit.'],
    ['TTS', 'Text-to-Speech; AI Voice synthesis.'],
    ['VPC', 'Virtual Private Cloud; isolated AWS network partition hosting MassaPro tenants.'],
    ['WAF', 'Web Application Firewall; L7 filter protecting against OWASP attacks.'],
    ['WebSocket', 'Full-duplex TCP protocol for real-time bidirectional communication.'],
], [0.14, 0.86]))
story.append(Spacer(1, 14))

story.extend(h2('9.2 Quick Reference — Technical Specifications'))
story.append(std_table([
    ['Category', 'Specification', 'Value'],
    ['Voice Latency', 'ASR roundtrip', '<300ms'],
    ['Voice Accuracy', 'ASR transcription', '99%'],
    ['Languages', 'AI Agent conversational', '100+'],
    ['Concurrency', 'AI Agent vs human queue', '50x throughput'],
    ['Handle Time', 'AI Agent reduction', '-70%'],
    ['SIP Signaling', 'Protocol', 'SIP over TCP'],
    ['SIP Port', 'Default', '5060'],
    ['RTP Media', 'Protocol', 'RTP over UDP'],
    ['RTP Ports', 'Range', '10000-20000'],
    ['Transit Encryption', 'Standard', 'TLS 1.3'],
    ['At-Rest Encryption', 'Standard', 'AES-256'],
    ['Compliance', 'Frameworks', 'SOC 2 Type II, GDPR, HIPAA, ISO'],
    ['Access Control', 'Methods', 'VPN, SSO (SAML 2.0 / OAuth 2.0), RBAC'],
    ['Integration', 'API types', 'REST, Webhooks, WebSockets, SIP/RTP trunking'],
    ['Marketplace', 'Pre-built connectors', '100+'],
    ['Hosting', 'Infrastructure', 'AWS Dedicated Private Tenant (VPC)'],
    ['Identity', 'Brand', 'MassaPro (formerly Athena Suite)'],
], [0.30, 0.32, 0.38]))
story.append(Spacer(1, 16))

story.extend(h2('9.3 Contact & Support'))
story.append(p(
    'For technical support, integration questions, or to request an updated version of this manual, contact the MassaPro team:'
))
story.append(Spacer(1, 6))
contact_style = ParagraphStyle('Contact', fontName=BODY_FONT, fontSize=11, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leftIndent=20)
story.append(Paragraph('<b>MassaPro</b>', contact_style))
story.append(Paragraph('Ezequiel Sznaider — CEO', contact_style))
story.append(Paragraph('Email: eze@massapro.com', contact_style))
story.append(Paragraph('Website: massapro.com', contact_style))
story.append(Spacer(1, 12))

story.append(info_box(
    'This manual is intended for authorized integrators and implementation partners. '
    'Distribution outside the authorized partner network requires written approval from MassaPro. '
    'For the latest version of this document, additional integration guides, or to request a custom integration scope review, contact the MassaPro integrator support team.',
    label='Document Control'
))


# ───────────────────── Build ─────────────────────
OUT_BODY = '/home/z/my-project/scripts/body.pdf'

doc = TocDocTemplate(
    OUT_BODY,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='MassaPro AI Omni-Channel Platform — Technical & Integration Manual',
    author='MassaPro',
    creator='MassaPro',
    subject='Technical and integration reference for MassaPro AI platform integrators',
)
doc.multiBuild(story, onFirstPage=header_footer, onLaterPages=header_footer)
print('Body PDF generated: %s' % OUT_BODY)
