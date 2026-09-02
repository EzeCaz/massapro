/**
 * MassaPro IVR — Sales Deck Content Document
 *
 * A content-first sales enablement document that captures the full narrative,
 * slide-by-slide, for the MassaPro IVR product (the video capability of the
 * MassaPro omnichannel AI platform for real human video agents).
 *
 * Source material: Telepresencia_Hibrida_Interactive_Powers_V3_EN.pdf
 * Reframed: "Interactive Powers" → "MassaPro IVR", positioned inside the
 * MassaPro omnichannel AI ecosystem alongside AI Agent, AI Guru, AI Analytics,
 * and MassaPro Flow.
 *
 * Output: /home/z/my-project/download/Massapro-IVR-Sales-Deck-Content.docx
 */

const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageNumber, PageBreak,
  Table, TableRow, TableCell, TableLayoutType, WidthType,
  BorderStyle, ShadingType, SectionType, PageOrientation,
  TableOfContents, Tab, LevelFormat, NumberFormat,
} = require("docx");
const fs = require("fs");

// ───────────────────── MassaPro Purple Palette ─────────────────────
// Custom palette matching MassaPro brand (#7c3aed purple-600)
const P = {
  bg:           "1A0B2E",   // Deep purple-black for cover
  primary:      "FFFFFF",   // White text on dark cover
  accent:       "A78BFA",   // Lighter purple for cover accents (visible on dark)
  body:         "1F2937",   // Dark slate for body text
  bodySoft:     "374151",   // Slightly lighter for emphasis
  muted:        "6B7280",   // Grey for captions
  accentDark:   "6D28D9",   // Purple-700 for headings on white
  accentMain:   "7C3AED",   // Purple-600 main brand color
  accentLight:  "EDE9FE",   // Purple-100 for table surface
  accentUltra:  "F5F3FF",   // Purple-50 for callouts
  border:       "E5E7EB",   // Light grey for borders
};

const coverPalette = {
  bg:           P.bg,
  titleColor:   "FFFFFF",
  subtitleColor:"C4B5FD",   // Light purple for subtitle
  metaColor:    "A78BFA",
  footerColor:  "7C3AED",
  accent:       "A78BFA",
};

// ───────────────────── Border helpers ─────────────────────
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB,
                       insideHorizontal: NB, insideVertical: NB };

// ───────────────────── Title layout helpers ─────────────────────
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([...' -_—–·/\t,.;:!?']);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i; break;
      }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / (pt * 20));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = splitTitleLines(title, charsPerLine(minPt));
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false,
          hasEnglishLabel = false, metaLineCount = 0,
          fixedHeight = 800, pageHeight = 16838,
          marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight +
                        metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, bottomSpacing };
}

// ───────────────────── Cover (R1 recipe — MassaPro purple) ─────────────────────
function buildCover() {
  const config = {
    title: "MassaPro IVR — Sales Deck Content",
    subtitle: "Face-to-face service over video, without staff at the service point",
    englishLabel: "SALES ENABLEMENT",
    metaLines: [
      "Product: MassaPro IVR (Video Capability of the MassaPro Omni-Channel AI Platform)",
      "Audience: Sales, Pre-Sales, Customer Success, Executive Sponsors",
      "Version: 1.0 — Content Draft for PPT Design Phase",
      "Confidentiality: Internal — MassaPro Sales Enablement",
    ],
    footerLeft: "MassaPro",
    footerRight: "Sales Deck Content — v1.0",
  };

  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: config.metaLines.length, fixedHeight: 400,
  });

  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: coverPalette.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  // English label with accent bottom border
  children.push(new Paragraph({
    indent: { left: padL, right: padR }, spacing: { after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: coverPalette.accent, space: 8 } },
    children: [new TextRun({ text: config.englishLabel.split("").join("  "),
      size: 18, color: coverPalette.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
  }));

  // Title
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: coverPalette.titleColor, font: { ascii: "Arial" } })],
    }));
  }

  // Subtitle
  children.push(new Paragraph({
    indent: { left: padL }, spacing: { after: 800 },
    children: [new TextRun({ text: config.subtitle, size: 26, color: coverPalette.subtitleColor,
      font: { ascii: "Arial" }, italics: true })],
  }));

  // Meta lines
  for (const line of config.metaLines) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 100 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 22, color: coverPalette.metaColor,
        font: { ascii: "Arial" } })],
    }));
  }

  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  // Footer
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: coverPalette.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft, size: 18, bold: true, color: coverPalette.accent, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                                              " }),
      new TextRun({ text: config.footerRight, size: 16, color: coverPalette.footerColor, font: { ascii: "Arial" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
}

// ───────────────────── Body helpers ─────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, size: 36, color: P.accentDark, font: { ascii: "Arial" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 30, color: P.accentDark, font: { ascii: "Arial" } })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 26, color: P.accentMain, font: { ascii: "Arial" } })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120, line: 312 },
    children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri" }, ...opts })],
  });
}

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120, line: 312 },
    children: [new TextRun({ text, size: 22, bold: true, color: P.body, font: { ascii: "Calibri" } })],
  });
}

// Inline-bold paragraph: pass an array of {text, bold?} segments
function bodyRich(segments) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120, line: 312 },
    children: segments.map(s => new TextRun({
      text: s.text, size: 22, bold: !!s.bold, italics: !!s.italics,
      color: s.color || P.body, font: { ascii: "Calibri" },
    })),
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80, line: 312 },
    indent: { left: 360 + level * 360, hanging: 240 },
    children: [
      new TextRun({ text: level === 0 ? "•  " : "–  ", size: 22, bold: true, color: P.accentMain, font: { ascii: "Calibri" } }),
      new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri" } }),
    ],
  });
}

function bulletRich(segments, level = 0) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80, line: 312 },
    indent: { left: 360 + level * 360, hanging: 240 },
    children: [
      new TextRun({ text: level === 0 ? "•  " : "–  ", size: 22, bold: true, color: P.accentMain, font: { ascii: "Calibri" } }),
      ...segments.map(s => new TextRun({
        text: s.text, size: 22, bold: !!s.bold, italics: !!s.italics,
        color: s.color || P.body, font: { ascii: "Calibri" },
      })),
    ],
  });
}

function calloutBox(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: P.accentMain },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accentMain },
      left:   { style: BorderStyle.SINGLE, size: 16, color: P.accentMain },
      right:  { style: BorderStyle.SINGLE, size: 4, color: P.accentMain },
      insideHorizontal: NB, insideVertical: NB,
    },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.accentUltra },
        margins: { top: 200, bottom: 200, left: 240, right: 240 },
        children: [new Paragraph({
          spacing: { line: 312 },
          children: [new TextRun({ text, size: 22, italics: true, color: P.accentDark, font: { ascii: "Calibri" } })],
        })],
      })],
    })],
  });
}

function spacer(after = 120) {
  return new Paragraph({ spacing: { after }, children: [] });
}

// ───────────────────── Slide builder ─────────────────────
// Each slide becomes a structured section in the document.
function slide(num, title, keyMessage, bodyContent, speakerNotes, visualRecs) {
  const out = [];
  out.push(h2(`Slide ${num}: ${title}`));

  out.push(h3("Key Message (on-slide headline)"));
  out.push(calloutBox(keyMessage));
  out.push(spacer(120));

  out.push(h3("Body Content (on-slide bullets)"));
  for (const item of bodyContent) {
    if (typeof item === "string") {
      out.push(bullet(item));
    } else if (Array.isArray(item)) {
      if (item.length > 0 && typeof item[0] === "string") {
        // [main, [sub-bullets]] pattern
        out.push(bullet(item[0]));
        if (Array.isArray(item[1])) {
          for (const sub of item[1]) out.push(bullet(sub, 1));
        }
      } else {
        // Array of inline rich segments [{text, bold?}, {text, italics?}]
        out.push(bulletRich(item));
      }
    } else if (item.rich) {
      out.push(bulletRich(item.rich));
    }
  }
  out.push(spacer(120));

  out.push(h3("Speaker Notes"));
  for (const para of speakerNotes) {
    out.push(body(para));
  }
  out.push(spacer(120));

  out.push(h3("Visual Recommendations"));
  for (const item of visualRecs) {
    out.push(bullet(item));
  }
  out.push(spacer(240));

  return out;
}

// ───────────────────── Body content ─────────────────────
const bodyChildren = [];

// === HOW TO USE THIS DOCUMENT ===
bodyChildren.push(h1("How to Use This Document"));
bodyChildren.push(body(
  "This document is the content draft for the MassaPro IVR sales deck. It captures the full narrative, slide by slide, so the sales and marketing teams can review and refine the messaging before we move to the PPT design phase. Each slide is presented as a structured section with four parts: the Key Message (the headline that appears on the slide itself), the Body Content (the bullet points visible to the audience), the Speaker Notes (what the presenter says while the slide is displayed), and the Visual Recommendations (guidance for the designer on layout, imagery, and data visualisation)."
));
bodyChildren.push(body(
  "The deck is structured as a 24-slide narrative arc that moves from market problem to product introduction, technical differentiation, customer experience, operational impact, sector applications, business case, and finally a clear call to action. The arc is designed to be delivered in a 30-40 minute executive presentation, with the option to expand or compress based on audience interest. Slides 1-5 set up the problem and introduce the solution; slides 6-12 explain how it works and why it is different; slides 13-19 cover integration, operations, and security; slides 20-22 provide sector proof points; and slides 23-24 close with the business case and next steps."
));
bodyChildren.push(body(
  "A critical reframing has been applied throughout: the source material described a standalone product called \"Interactive Powers\" (a phygital telepresence solution). In this deck, that capability is repositioned as MassaPro IVR — the video channel of the MassaPro omnichannel AI platform, designed for real human video agents. This positioning is deliberate: MassaPro IVR is not a standalone product, it is the visual layer that completes MassaPro's existing voice, chat, email, and social channels. When combined with MassaPro AI Agent (for autonomous interactions), AI Guru (for real-time agent coaching), AI Analytics (for sentiment and quality), and MassaPro Flow (for orchestration), the result is the only platform on the market that unifies AI automation and human video service within a single, orchestrated, compliant ecosystem."
));
bodyChildren.push(spacer(200));

// === DECK NARRATIVE ARC ===
bodyChildren.push(h1("Deck Narrative Arc"));
bodyChildren.push(body(
  "The deck follows a classic problem-solution-proof-action structure, tuned for an executive audience that needs to make a buying decision in 30-40 minutes. The opening slides establish that the status quo at the physical point of service is structurally broken — not because of execution failures, but because tying service capacity to a place and a schedule no longer matches how demand actually behaves. The middle slides introduce MassaPro IVR as the answer and explain the technical innovations (the SPLIT architecture, the four-channel model, the ACD integration) that make it work in enterprise environments. The later slides provide proof through sector applications and a banking case study, quantify the business case, and close with a concrete next step."
));
bodyChildren.push(body(
  "The single most important differentiator we lean into throughout the deck is that MassaPro IVR is not just a video calling product — it is a video channel that is natively integrated with MassaPro's AI layer. This means a customer can start on a video kiosk, be coached in real time by AI Guru, have their transcript analysed by AI Analytics, and be escalated to a supervisor with full context — all without ever leaving the MassaPro platform. No standalone telepresence vendor can match this. This is the message that should come through in every slide, and it is the reason MassaPro wins deals that would otherwise go to point-solution competitors."
));
bodyChildren.push(spacer(240));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  1,
  "Cover — MassaPro IVR: Face-to-Face Service Over Video",
  "MassaPro IVR — the video capability of the MassaPro omni-channel AI platform. Real human video agents, anywhere in the world, serving every service point in your network.",
  [
    "Product name: MassaPro IVR",
    "Tagline: Face-to-face service over video, without staff at the service point",
    "Sub-tagline: One expert team serves the entire physical and digital network",
    "MassaPro logo + branding",
  ],
  [
    "Open with a clear positioning statement. MassaPro IVR is not a new product category — it is the video layer of the MassaPro omni-channel platform, designed for real human video agents. The audience should understand in the first 30 seconds that we are talking about a fundamentally different way to deliver in-person service: the customer experiences a face-to-face interaction, but the advisor can be anywhere in the world.",
    "Hold the cover for 10-15 seconds while you introduce the team and the purpose of the meeting. Do not advance until the room is settled — this slide sets the tone for the entire conversation. If the audience is engaged with the cover, they will be engaged with the deck.",
  ],
  [
    "Full-bleed MassaPro purple background (#1A0B2E to #6D28D9 gradient)",
    "Large product name centered, with the MassaPro logo above",
    "Tagline in lighter purple (#A78BFA), italic, below the product name",
    "Optional hero image: a customer at a kiosk speaking with an advisor on a large screen, with the advisor visible life-size",
    "Footer: MassaPro branding + confidentiality notice",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  2,
  "The Problem — Multi-Sector Pain Points at the Point of Contact",
  "Today, most high-value interactions end up in one of four failure modes — and none of them show up in your KPIs.",
  [
    [{ text: "Waiting and abandonment", bold: true }, { text: " — the customer sizes up the queue on arrival and decides within seconds. The loss happens before any interaction takes place and leaves no trace in any system." }],
    [{ text: "Deferred advice", bold: true }, { text: " — the customer comes in hoping for guidance, gets a referral to the call centre or an appointment for another day. The need is unresolved and the revenue is delayed." }],
    [{ text: "Self-service with no way out", bold: true }, { text: " — digital handles the simple cases, but abandons the customer the moment a doubt or exception appears. That is exactly the moment the decision is made." }],
    [{ text: "Incomplete remote channel", bold: true }, { text: " — phone and chat connect, but cannot share a document, verify identity, or complete a complex transaction. The customer gives up or comes back in person." }],
    "In all four cases, the company pays for the capacity without generating revenue, and the customer walks away quietly with an unresolved need.",
  ],
  [
    "This is the most important slide in the opening section. Do not rush it. The audience needs to recognise their own operation in at least one of the four scenarios before they will be open to a new solution. Walk through each quadrant and pause. Ask the room: which of these is happening in your network right now? You will get nods.",
    "The key insight to land is the last line: these failures are silent. They do not show up in CSAT surveys because the customer never formally interacted. They do not show up in call-centre metrics because the customer never called. They show up only in lost revenue and churn — and even then, attribution is impossible. This is why AI alone cannot solve them: AI optimises interactions that already happen. MassaPro IVR creates interactions that would not have happened at all.",
  ],
  [
    "2x2 grid layout, each quadrant a card with an icon + title + 2-line description",
    "Use MassaPro purple accent for the quadrant titles",
    "Bottom strip: the summary line in bold, in a contrasting callout colour",
    "Suggested icons: clock (waiting), calendar (deferred), dead-end sign (self-service), broken phone (incomplete remote)",
    "Optional: subtle background image of an empty service point to reinforce the silence of the problem",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 3 — WHY IN-PERSON DOESN'T SCALE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  3,
  "Why In-Person Service Doesn't Scale with the Business",
  "Three structural limits that no amount of process improvement or AI can overcome — they are baked into the model of tying service to a place.",
  [
    [{ text: "Fixed cost per location", bold: true }, { text: " — every service point requires its own staff, space, and hours. Costs grow linearly with the network. Open 100 new branches, hire 100 new teams." }],
    [{ text: "Uneven coverage", bold: true }, { text: " — lower-traffic locations cannot justify a dedicated specialist, so customers at those locations get a lesser service. The network's average quality is dragged down by its long tail." }],
    [{ text: "Rigid capacity", bold: true }, { text: " — demand spikes cannot be absorbed. On-site staff cannot be redistributed in real time. Monday morning queues grow while Friday afternoons sit idle." }],
    "These are not execution failures — they are the predictable result of tying service capacity to a place and a schedule while demand isn't.",
  ],
  [
    "This slide is the bridge between the problem (slide 2) and the opportunity (slide 4). It explains why the four failure modes exist: they are not bugs, they are features of an outdated operating model. Make this point explicitly. The audience needs to hear that throwing AI at the problem will not help, because AI does not move staff between locations in real time.",
    "If the audience is from a multi-site operator (bank, retail chain, hotel group), use a concrete number from their own network: how many branches do they have, how many are sub-scale, how much does the fixed cost per location add up to per year. This makes the problem tangible and sets up the ROI slide later in the deck.",
  ],
  [
    "Three-column layout, each column a card with a number (1, 2, 3), a title, and a description",
    "Use a visual hierarchy: large purple numbers, bold titles, body text in muted grey",
    "Bottom strip: the summary line in italic, in a callout box",
    "Optional: a small line chart showing linear cost growth vs. non-linear demand, to make the rigidity point visual",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 4 — THE OPPORTUNITY
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  4,
  "The Opportunity — Video is the Superior Channel for Remote Human Service",
  "Video calls deliver CSAT 4.5-5 and the highest first-contact resolution of any digital channel — when they are designed for service, not for meetings.",
  [
    [{ text: "CSAT 4.5 – 5.0", bold: true }, { text: " — typical customer satisfaction scores for video-assisted service, especially when customers compare it with other remote channels." }],
    [{ text: "Highest FCR", bold: true }, { text: " — first-contact resolution rates with video calls outperform any other digital channel or phone. The customer's problem is solved in a single session." }],
    [{ text: "Why it works", bold: true }, { text: " — video combines the trust and clarity of in-person service with the efficiency of digital. The advisor can see the customer, share documents, verify identity, and walk through complex forms in real time." }],
    "Source: consolidated industry averages and trends for 2025-2026, drawn from multiple client reports and cross-checked against independent studies.",
  ],
  [
    "This slide establishes that video is not just another channel — it is the best channel for high-value interactions. The numbers matter. CSAT 4.5-5 is exceptional. Most call centres operate at 3.8-4.2. Most digital chat operates even lower. Video is in a different category entirely.",
    "Be prepared for the objection: \"We already have video — we use Teams / Zoom / Meet.\" The response is on slide 5. Consumer video conferencing tools are designed for meetings between colleagues. MassaPro IVR is designed for service between an advisor and a customer who has never met the advisor before. The difference shows up in the SPLIT architecture, the metadata capture, the ACD integration, and the security model — all of which we will cover.",
  ],
  [
    "Two large stat callouts side by side: CSAT 4.5-5 and FCR leadership",
    "Use big numbers (60pt+) in MassaPro purple, with a short label below",
    "Below the stats: a horizontal bar chart comparing CSAT across channels (phone, chat, email, video) with video clearly leading",
    "Footer: source attribution in small grey text",
    "Optional: a small icon row showing the four reasons video wins (trust, clarity, identity, complexity)",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 5 — INTRODUCING MASSAPRO IVR
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  5,
  "Introducing MassaPro IVR — The Video Capability of the MassaPro Platform",
  "Physical presence, remote operation. A single expert team serves every point in your network — kiosks, tablets, QR stickers, mobile, and digital channels — through real human video agents.",
  [
    [{ text: "What it is", bold: true }, { text: " — MassaPro IVR is the video channel of the MassaPro omni-channel AI platform. It connects a customer at a physical service point (or on their own device) to a human advisor over high-definition video, in under 30 seconds." }],
    [{ text: "Who it serves", bold: true }, { text: " — real human video agents, based at any contact centre in the world. The advisor appears life-size on the service point's screen and looks straight at the camera. The customer experiences a face-to-face interaction." }],
    [{ text: "What makes it different", bold: true }, { text: " — MassaPro IVR is natively integrated with MassaPro AI Agent (autonomous chat and voice), AI Guru (real-time coaching for the human advisor), AI Analytics (sentiment and quality), and MassaPro Flow (orchestration). One platform, every channel, AI and human together." }],
    "No app to install. No appointment needed. No on-site staff required.",
  ],
  [
    "This is the slide where you introduce the product by name. Say it clearly: MassaPro IVR. Spell out what IVR stands for in this context — Interactive Video Response — and emphasise that this is not your father's IVR. Traditional IVR is a voice menu that frustrates callers. MassaPro IVR is a video service that resolves customer needs face-to-face, instantly, anywhere.",
    "The most important sentence on the slide is the third bullet: the integration with the rest of the MassaPro platform. This is the moat. Standalone telepresence vendors can replicate the kiosk and the SPLIT architecture. They cannot replicate the AI layer. When the audience asks \"why MassaPro and not vendor X,\" the answer is always: because MassaPro IVR is part of a complete AI-powered omni-channel platform, not a point solution.",
  ],
  [
    "Hero image: a customer at a kiosk speaking with an advisor on a large screen, with the MassaPro logo prominent",
    "Three large icon-and-text blocks below the hero, one for each \"what it is / who it serves / what makes it different\"",
    "Bottom strip: the three \"no\" statements (no app, no appointment, no on-site staff) in bold purple",
    "Optional: a small MassaPro platform diagram in the corner, showing IVR as one of the channels alongside voice, chat, email, and social",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 6 — THE CONCEPT
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  6,
  "The Concept — Physical Presence, Remote Operation",
  "A physical service point connects the customer, in seconds, to a human advisor over HD video. The advisor can be based anywhere. The customer experiences high-value, face-to-face service that gets things resolved.",
  [
    [{ text: "The physical point", bold: true }, { text: " — kiosk, tablet, or simply a QR sticker on a wall. The customer uses their own phone to start the session. The point itself requires no on-site staff and no specialised hardware beyond a screen." }],
    [{ text: "The remote advisor", bold: true }, { text: " — a human video agent, working from a laptop or PC with a web browser and internet access. No heavy client, no proprietary headsets, no dedicated workstation. The advisor can be in a contact centre, at home, or anywhere on the corporate network." }],
    [{ text: "The interaction", bold: true }, { text: " — the advisor appears life-size on the service point's screen, looking straight at the camera. The customer experiences a face-to-face conversation that matches the perceived service and trust of a staffed counter." }],
    "Three things the customer never has to do: install an app, book an appointment, or wait for on-site staff.",
  ],
  [
    "The simplicity of this concept is the point. MassaPro IVR works because the customer does not have to do anything they would not naturally do. They scan a QR code with the phone they are already holding. They speak to a human. They see the human on a screen. The complexity is all on the platform side — and that complexity is invisible to the customer.",
    "If the audience pushes back on \"customers will not adopt this,\" point to the CSAT numbers from slide 4. Customers adopt what works. They adopt video service when it resolves their need in one session. They do not adopt video conferencing tools (Teams, Zoom) for service because those tools are not designed for service. The product design matters more than the channel.",
  ],
  [
    "Three-panel illustration: (1) customer scanning QR with phone, (2) advisor at a laptop with headset, (3) the two of them connected on a large screen at the service point",
    "Use MassaPro purple for the connection arrows between the panels",
    "Bottom strip: the three \"never\" statements in bold, with strike-through icons (no app icon, no calendar icon, no staff icon)",
    "Keep this slide visual — the concept is best understood as a story, not a list",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 7 — HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  7,
  "How It Works — Four Steps, Under 30 Seconds",
  "From scan to talk, the customer is speaking with a human advisor in under half a minute. No friction, no forms, no waiting on hold.",
  [
    [{ text: "1. Scan", bold: true }, { text: " — the customer scans the QR code on the video kiosk, tablet, or sticker with their own mobile phone. Standard camera app. No download." }],
    [{ text: "2. Identify", bold: true }, { text: " — they enter the minimum service details on their phone: name, contact info, reason for the visit, ID number, or promo code. This metadata is sent to the advisor before the session begins." }],
    [{ text: "3. Connect", bold: true }, { text: " — they enter a sync PIN. The system routes the session to the first available qualified advisor through your existing ACD. The advisor opens the session with the case already identified." }],
    [{ text: "4. Talk", bold: true }, { text: " — audio runs through the customer's phone for total privacy; HD video runs on the service point's screen. The advisor can share documents, verify identity, and complete transactions in real time." }],
  ],
  [
    "Walk the audience through the four steps as if they were the customer. Make it visceral. The point is that the entire flow takes less time than standing in a queue, and the customer is in control the whole time — they are using their own phone, they are entering their own data, they can end the session whenever they want.",
    "The metadata capture in step 2 is more important than it looks. Because the customer enters their details before connecting, the advisor opens the session with the case already in context. This is what enables \"customers never repeat themselves\" on slide 13. It is also what enables the MassaPro Flow orchestration — the metadata can be used to route the session by skill, language, or service type before the advisor even picks up.",
  ],
  [
    "Four-step horizontal flow diagram with numbered circles and arrows",
    "Each step has an icon (QR code, form, sync symbol, video camera) and a short caption",
    "Use MassaPro purple for the numbered circles and arrows",
    "Top-right corner: a stopwatch graphic showing \"<30s\" to reinforce the speed",
    "Bottom: a small line showing the metadata flow into the advisor's console",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 8 — THE SPLIT ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  8,
  "The SPLIT Architecture — One Session, Two Devices",
  "This is the technical piece that sets MassaPro IVR apart from any video call: the streams of a single session are split between the service point's screen and the customer's phone.",
  [
    [{ text: "Physical point (kiosk / screen / tablet)", bold: true }, { text: " — receives life-size HD video of the advisor, shared document screen, and the RTP media stream." }],
    [{ text: "Customer's device (their own smartphone)", bold: true }, { text: " — handles private two-way audio, signalling and session control (RTC), and data capture / service selection." }],
    [{ text: "One logical session", bold: true }, { text: " — the contact centre, ACD, and browser-based advisors receive both streams as a single interaction. Passes through corporate firewalls and NAT. Works over WiFi, 5G, or LTE. PWA mode allows reconnection. No VPN, no app, no installation." }],
  ],
  [
    "This is the technical heart of the product. Slow down here. The SPLIT architecture is what makes MassaPro IVR deployable in enterprise environments that would reject a standard video conferencing tool. It solves three problems at once: privacy (audio never goes through shared hardware), intelligibility (the customer's phone mic is closer to their mouth than any kiosk mic could be), and firewall traversal (the session passes through corporate NAT and firewalls without IT involvement).",
    "If there are CTOs or enterprise architects in the room, they will lean in here. Be ready for detailed questions about RTC protocols, NAT traversal (STUN/TURN), codec selection, and bandwidth requirements. The short answer is: it works on standard corporate networks with standard browser technology, and we have deployed it in banks, hospitals, and government agencies with strict network policies. The longer answer is in the technical manual.",
  ],
  [
    "Center-stage diagram: two device icons (kiosk on left, smartphone on right) with a SPLIT symbol between them, both feeding into a single \"session\" icon that flows to the contact centre",
    "Use colour to distinguish the two streams: purple for video (left), teal for audio (right)",
    "Below the diagram: three feature pills — \"passes firewalls/NAT\", \"WiFi/5G/LTE\", \"PWA reconnect\"",
    "Bottom strip: \"No VPN · No App · No Installation\" in bold, with strike-through icons",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 9 — PRIVACY AND INCLUSION
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  9,
  "Privacy and Inclusion — Audio Never Passes Through Shared Hardware",
  "Thanks to the SPLIT architecture, audio goes in and out through the customer's own phone — never through a kiosk speaker or microphone. One mechanism solves privacy, intelligibility, and accessibility at once.",
  [
    [{ text: "Acoustic isolation", bold: true }, { text: " — no ambient noise in the session, and no disturbance to those nearby. The customer's phone mic is centimetres from their mouth, not metres." }],
    [{ text: "Data confidentiality", bold: true }, { text: " — banking, medical, or personal data is inaudible to bystanders. Critical for HIPAA, GDPR, and PCI-DSS compliance at the service point." }],
    [{ text: "Multilingual service", bold: true }, { text: " — automatic routing to the customer's chosen language. The advisor does not need to be bilingual; the ACD routes to the right queue." }],
    [{ text: "Sign language", bold: true }, { text: " — real-time interpreter for deaf customers, available on the same kiosk without any additional hardware or software." }],
  ],
  [
    "This slide does double duty. It answers the privacy objection (\"I do not want my customers' data going through a kiosk speaker\") and it opens up an inclusion story that competitors cannot match. The sign-language interpreter capability alone has won deals in healthcare and government, where accessibility is a legal requirement, not a nice-to-have.",
    "If the audience is from a regulated industry (banking, healthcare, government), spend extra time on the confidentiality bullet. The point is not that we encrypt the audio — everyone does. The point is that the audio never touches shared hardware in the first place. That is a structural privacy guarantee that no kiosk-mounted microphone can match, no matter how many layers of encryption you put on top.",
  ],
  [
    "Four-quadrant grid with icons: headphones (acoustic isolation), padlock (confidentiality), globe (multilingual), sign-language hand (accessibility)",
    "Each quadrant has a short title and 2-line description",
    "Centre of the grid: a phone icon with a small \"SPLIT\" badge, to reinforce that the architecture enables all four benefits",
    "Use MassaPro purple for the quadrant titles and icons",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 10 — THE MASSAPRO ECOSYSTEM ADVANTAGE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  10,
  "The MassaPro Ecosystem Advantage — IVR + AI Agent + AI Guru + AI Analytics + Flow",
  "MassaPro IVR is not a standalone video product. It is the video layer of a complete AI-powered omni-channel platform — and that integration is the moat.",
  [
    [{ text: "MassaPro AI Agent", bold: true }, { text: " — handles autonomous chat and voice interactions. When the customer's need is simple, the AI Agent resolves it without a human. When the need is complex, the AI Agent escalates to a video advisor with full context." }],
    [{ text: "MassaPro AI Guru", bold: true }, { text: " — RAG-powered co-pilot for the human video advisor. During the video session, AI Guru analyses the live transcript, detects customer sentiment, and pushes real-time coaching prompts and CSAT recommendations to the advisor's screen." }],
    [{ text: "MassaPro AI Analytics", bold: true }, { text: " — every video session is transcribed, analysed for sentiment (Politeness, Anger, Empathy), keyphrases, entities, and topic. PII is automatically redacted. Supervisors see live dashboards; executives see trends." }],
    [{ text: "MassaPro Flow", bold: true }, { text: " — drag-and-drop orchestration that lets you design customer journeys across channels. A single workflow can route a customer from a kiosk to an AI Agent, to a video advisor, to a supervisor — all without losing context." }],
    "One platform. Every channel. AI and human, orchestrated together. No standalone telepresence vendor can match this.",
  ],
  [
    "This is the most important slide in the deck for differentiation. Slow down. The audience has just spent eight slides understanding what MassaPro IVR does. Now they need to understand why MassaPro IVR is different from every other video service product on the market. The answer is this slide.",
    "Walk through each of the four integrations with a concrete scenario. Example: a customer walks up to a kiosk at a bank after hours. MassaPro Flow routes them to the AI Agent first (\"I can help with account balance, recent transactions, or branch hours\"). If the customer says \"I want to open an account,\" the AI Agent escalates to a video advisor. The advisor picks up the session in their browser, sees the customer's metadata, and starts the conversation. AI Guru is running in the advisor's console — when the customer mentions they are worried about fees, AI Guru pushes a coaching prompt with the current fee schedule and a retention script. AI Analytics is transcribing the whole session, detecting sentiment, and flagging it for supervisor review if the customer gets upset. After the session, the transcript is summarised and posted to the CRM. One platform, end to end.",
    "Close with the line on the slide: no standalone telepresence vendor can match this. That is the line the audience should remember when they are comparing MassaPro IVR to a point solution.",
  ],
  [
    "Center-stage diagram: MassaPro IVR in the middle, with four surrounding modules (AI Agent, AI Guru, AI Analytics, MassaPro Flow) connected by bidirectional arrows",
    "Use MassaPro purple for the IVR centre node, lighter purple for the surrounding modules",
    "Each module has a one-line caption explaining its role in the video session",
    "Bottom strip: the closing line in bold, in a callout box",
    "Optional: small icons for each module (robot for AI Agent, lightbulb for AI Guru, chart for Analytics, workflow for Flow)",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 11 — CUSTOMER EXPERIENCE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  11,
  "Customer Experience — Why It Feels Like In-Person Service",
  "The advisor appears life-size, looking straight at the camera. The customer reviews documents on screen, controls the session from their phone, and never gives up control to a shared touchscreen.",
  [
    [{ text: "Human scale", bold: true }, { text: " — the advisor appears life-size on the service point's screen, looking straight at the camera. The perceived service and trust match that of a staffed counter. This is not a video call on a laptop; this is a person standing in front of you." }],
    [{ text: "Shared viewing", bold: true }, { text: " — the advisor shares contracts, forms, or catalogues on screen in real time. Customers visually review their orders, applications, or documents before confirming. No more \"I will email it to you later.\"" }],
    [{ text: "Control from their phone", bold: true }, { text: " — the customer runs the session from their own phone. No shared touchscreens. No giving up control to a kiosk. They can end the session, mute, or switch channels at any time." }],
  ],
  [
    "This slide is about the felt experience of the customer. The three pillars — human scale, shared viewing, control — are what make MassaPro IVR feel like in-person service rather than a video call. The technology disappears and the interaction is what the customer remembers.",
    "If you have a demo video, this is the slide to play it on. A 30-second clip of a real customer using a kiosk to speak with an advisor — seeing the advisor life-size, reviewing a document on screen, confirming with a tap on their phone — is worth a thousand bullet points. If no video is available, the visual recommendation below should be designed to convey the same feeling.",
  ],
  [
    "Three-column layout, each column with an icon, a title, and a 3-line description",
    "Suggested icons: person silhouette (human scale), document (shared viewing), smartphone (control)",
    "Top of slide: a wide hero image of a customer at a kiosk, with an advisor life-size on the screen",
    "Use MassaPro purple for the column titles",
    "Optional: a small inset showing the customer's phone screen with the session controls",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 12 — ONE POINT, FOUR CHANNELS
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  12,
  "One Point, Four Channels — Customers Choose How They Want to Be Served",
  "The same service point supports four channels: video kiosk, mobile video call, digital voice call, and WhatsApp. The customer picks what works for them; the advisor sees the same console regardless.",
  [
    [{ text: "1. Video Kiosk", bold: true }, { text: " — service on the large screen at the service point, with audio through the customer's phone. The full face-to-face experience." }],
    [{ text: "2. Mobile video call", bold: true }, { text: " — the entire session on the customer's phone, on-site or off. Same advisor, same console, same context." }],
    [{ text: "3. Digital call", bold: true }, { text: " — voice over data only. No minutes used, no phone number needed. For customers who want audio only or are in a low-bandwidth environment." }],
    [{ text: "4. WhatsApp", bold: true }, { text: " — conversation continuity on the channel customers already use every day. Especially powerful in markets where WhatsApp is the default messaging app." }],
    [{ text: "Metadata capture before connecting", bold: true }, { text: " — name, email, phone, ID document, promo code, room or file number. The advisor opens the session with the case already identified." }],
    [{ text: "PIN sync between devices", bold: true }, { text: " — when choosing kiosk mode, the customer enters a four-digit PIN that pairs their phone with that specific screen, preventing session mix-ups at sites with several adjacent points." }],
  ],
  [
    "The four-channel model is a customer-experience feature, not just a technical feature. Customers do not all want the same channel. Some want the full kiosk experience. Some want to use their own phone. Some want WhatsApp. MassaPro IVR meets the customer where they are, on the channel they prefer, with the same advisor and the same context.",
    "The PIN sync is a small detail that matters in multi-point deployments. If you have a bank lobby with three kiosks side by side, you do not want customer A's session showing up on customer B's screen. The four-digit PIN prevents that. Mention this when the audience is from a multi-kiosk environment.",
  ],
  [
    "Four-quadrant grid, each quadrant a channel with an icon and 2-line description",
    "Suggested icons: kiosk monitor (video kiosk), smartphone (mobile video), waveform (digital call), WhatsApp logo (WhatsApp)",
    "Bottom strip: two feature pills — \"metadata capture\" and \"PIN sync\" — with short captions",
    "Use MassaPro purple for the quadrant titles and the feature pills",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 13 — ROUTING AND CONTINUITY
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  13,
  "Routing and Continuity — Customers Never Repeat Themselves Across Any Transfer",
  "Full context is carried through the entire chain: identity, reason, conversation, documents, and data. Zero repetition. Native ACD routing through Genesys, Cisco, Five9, GoContact, and more.",
  [
    [{ text: "Step 1 — Customer", bold: true }, { text: " — data captured before connecting: identity, reason, and context from the service point." }],
    [{ text: "Step 2 — Advisor A", bold: true }, { text: " — receives the session already in context. Handles it, documents it, and decides whether to escalate." }],
    [{ text: "Step 3 — Supervisor B", bold: true }, { text: " — inherits the full session: conversation, documents, and data — without dropping the video." }],
    "Full context carried through the entire chain. Zero repetition. Native ACD routing (Genesys, Cisco, Five9, GoContact, Avaya, and more).",
  ],
  [
    "This slide answers the question every contact-centre leader asks: what happens when the first advisor cannot resolve the issue? The answer is: the session transfers with full context, the customer does not have to repeat themselves, and the video does not drop. This is a fundamental difference from a standard video call, where a transfer means starting over.",
    "The native ACD integration is the technical enabler. MassaPro IVR does not replace your existing contact-centre routing — it plugs into it. If you have Genesys, MassaPro IVR routes through Genesys. If you have Cisco, it routes through Cisco. The advisor console is browser-based and works alongside your existing agent desktop, or as a standalone. No migration required.",
  ],
  [
    "Three-step horizontal flow diagram: Customer → Advisor A → Supervisor B, with arrows showing context flowing through",
    "Above each step, show the data that travels with the session (identity, conversation, documents)",
    "Bottom strip: logos of supported ACD providers (Genesys, Cisco, Avaya, Five9, GoContact) in a single row",
    "Use MassaPro purple for the flow arrows and the context indicators",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 14 — INTEGRATION WITH YOUR CONTACT CENTRE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  14,
  "Integration with the Contact Centre You Already Have",
  "MassaPro IVR integrates with the ACD your organisation already has in production, or runs standalone with its own Web ACD. No migration required. No need to replace your existing operations.",
  [
    [{ text: "Distributed agents", bold: true }, { text: " — makes use of advisors already available at offices, dealerships, or branches, between in-person appointments. Idle time at branch locations becomes billable service time." }],
    [{ text: "Centralised agents", bold: true }, { text: " — maximises operations with more shifts, queue-based specialisation, and contact-centre outsourcing. One team serves the entire network." }],
    [{ text: "Hybrid model", bold: true }, { text: " — most customers run a hybrid: branch staff handle sessions during slow hours, centralised staff handle peak hours and after-hours. MassaPro Flow handles the routing rules." }],
  ],
  [
    "This slide is for the operations and IT leaders in the room. The key message is: MassaPro IVR is not a rip-and-replace. It plugs into what you have. If you have invested millions in Genesys or Cisco, that investment is preserved. If you have branch staff who are under-utilised between in-person appointments, they can now take video sessions from their existing desk.",
    "The hybrid model is the most common deployment pattern in practice. Pure distributed (only branch staff) does not scale for after-hours. Pure centralised (only contact centre) wastes the branch staff. Hybrid gives you both: branch staff during the day, centralised staff at night, and MassaPro Flow deciding who gets what based on skill, language, and availability.",
  ],
  [
    "Two-column layout: Distributed Agents (left) vs Centralised Agents (right), each with an icon and description",
    "Centre: a hybrid badge or icon showing the two columns combining",
    "Below: a small MassaPro Flow diagram showing the routing rules (skill, language, availability, hours)",
    "Bottom strip: \"No migration required\" in bold, with a checkmark icon",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 15 — PLATFORM AND OPERATIONS
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  15,
  "Platform and Operations — A Managed Service, No Deployment on Your Network",
  "VCCaaS (Video Contact Center as a Service). Advisors, supervisors, and sales staff work from a laptop, PC, Mac, or tablet — with just a web browser and internet access. No heavy client. No proprietary headsets. No dedicated workstation.",
  [
    [{ text: "Browser-based advisor console", bold: true }, { text: " — runs in Chrome, Edge, or Safari. The advisor logs in, picks up sessions, shares documents, and ends calls — all in the browser. Zero install." }],
    [{ text: "Kiosk Manager — centralised management", bold: true }, { text: " — oversight of the entire network of points. Add and remove locations, configure content, logos and advertising per kiosk, manage supervisor roles and permissions, and apply remote configuration settings." }],
    [{ text: "MassaPro Flow — orchestration", bold: true }, { text: " — drag-and-drop workflow builder for customer journeys across channels. Routes by skill, language, topic, or availability." }],
    [{ text: "AWS-hosted, fully managed", bold: true }, { text: " — the platform runs on AWS with full data isolation, encryption, and per-client segregation. MassaPro never accesses end-user data. You get the service; we run the infrastructure." }],
  ],
  [
    "This slide answers the IT operations question: who runs this thing? The answer is: MassaPro runs it. The customer's IT team does not need to deploy servers, manage upgrades, or maintain kiosks. The advisor console is a browser. The kiosk manager is a web portal. The infrastructure is AWS. This is a managed service, not a software product the customer has to install and operate.",
    "For CIOs and CTOs, this is a significant point. The total cost of ownership of MassaPro IVR is the subscription fee plus the cost of the kiosk hardware (if any). There is no hidden infrastructure cost, no dedicated headcount to run the platform, no annual maintenance fee. Compare this to a premise-based video conferencing solution, which requires SBCs, gateways, MCUs, and a team to keep them running.",
  ],
  [
    "Top half: a browser window mockup showing the advisor console (sessions queue, customer metadata, document share pane)",
    "Bottom half: a Kiosk Manager portal mockup showing a map of locations with status indicators",
    "Use MassaPro purple for the browser chrome and portal headers",
    "Side strip: AWS logo + compliance badges (SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS) to reinforce the managed-service positioning",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 16 — OPERATIONAL IMPACT
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  16,
  "Operational Impact — More Coverage on Less Infrastructure",
  "24/7 availability. 1:N ratio (one team serves the entire network). +0 staff at the point. The platform scales to hundreds of thousands of interactions per month on the same infrastructure.",
  [
    [{ text: "24/7 — Continuous availability", bold: true }, { text: " — shifts and outsourcing cover time slots no physical branch could sustain on its own. The service point is open even when the building is closed." }],
    [{ text: "1:N — One team, the entire network", bold: true }, { text: " — the same group of advisors serves every contact point at once, cutting operating costs. A specialist at headquarters can serve a customer at any branch, kiosk, or QR sticker in the country." }],
    [{ text: "+0 — Staff at the point", bold: true }, { text: " — the service point works even with no assigned staff. Just a screen and connectivity. The fixed cost of the point drops to hardware and bandwidth." }],
    "The platform scales to hundreds of thousands of interactions per month on the same infrastructure, with no need to physically replicate service points.",
  ],
  [
    "This slide is the operational punchline. Three numbers: 24/7, 1:N, +0. Memorise them. They are the headline metrics that will be quoted back to the room. 24/7 availability without extending branch hours. One team serving N locations. Zero staff at the point of service.",
    "If the audience is from a multi-site operator, ask them how many of their locations are currently sub-scale — open fewer hours than they would like because they cannot justify a full-time staff member. Every one of those locations is a candidate for MassaPro IVR. The kiosk costs less than one FTE per year, and it never takes a sick day.",
  ],
  [
    "Three large stat callouts in a row: 24/7, 1:N, +0",
    "Use very large numbers (80pt+) in MassaPro purple, with a short label below each",
    "Below the stats: a small illustration showing one team serving many locations (one icon on the left, many icons on the right, connected by lines)",
    "Bottom strip: the scalability line in italic, in a callout box",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 17 — TRADITIONAL VS PHYGITAL MODEL
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  17,
  "Traditional Model vs Phygital Model — Every Remote Point Reduces Operating Cost",
  "A fixed specialist at a low-traffic point spends much of the day serving no one, yet their payroll and workstation stay active regardless. Centralising the resource frees up that time and that geography.",
  [
    [{ text: "Traditional model", bold: true }, { text: " — active payroll with no interaction; infrastructure running regardless; transit time that produces no service; absences covered point by point; talent tied to geography." }],
    [{ text: "Phygital model", bold: true }, { text: " — capacity based on real occupancy; the point carries no staff (just a screen and connectivity); zero transit time; absences absorbed by the team; talent with no geographic ties." }],
    "The real savings are the payroll, infrastructure, and geography that no longer limit the service.",
  ],
  [
    "This slide is a side-by-side comparison. Walk through each row. The pattern is the same in every row: the traditional model pays for capacity that is not used; the phygital model pays only for capacity that is used. That is the structural cost advantage.",
    "The talent row is often the most resonant with HR leaders. In the traditional model, you can only hire where the point is. If your best mortgage advisor lives in a different city than your branch, you cannot hire them. In the phygital model, you can hire anywhere. You can concentrate your team in one site, move it to another country, or distribute it across home offices. The talent pool is no longer constrained by the location of the service point.",
  ],
  [
    "Two-column comparison table with 5 rows (payroll, infrastructure, transit, absences, talent)",
    "Left column: Traditional Model (in muted grey, with a small X icon next to each row)",
    "Right column: Phygital Model (in MassaPro purple, with a small checkmark icon next to each row)",
    "Bottom strip: the closing line in bold, in a callout box",
    "Optional: a small sustainability badge — \"Positive environmental impact: fewer commutes, smaller real-estate footprint\"",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 18 — SECURITY AND COMPLIANCE
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  18,
  "Security and Compliance — Enterprise-Grade, from the Infrastructure Up",
  "Infrastructure deployed on AWS with full data isolation, encryption, and per-client segregation. MassaPro never accesses end-user data. SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS — all certified.",
  [
    [{ text: "Compliance certifications", bold: true }, { text: " — SOC 2 Type II, ISO 27001, GDPR, HIPAA, PCI-DSS. The platform is engineered for high-compliance sectors including legal, healthcare, finance, and government." }],
    [{ text: "Live identity verification", bold: true }, { text: " — the advisor visually confirms the customer and their ID document during the video session. A direct barrier against impersonation. Deepfakes cannot operate through a kiosk because the customer is physically present and their ID is visually inspected." }],
    [{ text: "Session traceability", bold: true }, { text: " — interaction recording and auditing in line with each organisation's policy. Reports, logs, and metadata generated for all activity. Full audit trail for regulators." }],
    [{ text: "Encryption standards", bold: true }, { text: " — TLS 1.3 for data in transit, AES-256 for data at rest. The same standards that protect MassaPro's voice, chat, and AI channels protect MassaPro IVR." }],
    [{ text: "PII redaction", bold: true }, { text: " — automatic identification and redaction of personally identifiable information from transcripts and analytics reports, powered by MassaPro AI Analytics." }],
  ],
  [
    "For regulated industries, this slide is the gate. If the audience is from a bank, hospital, insurer, or government agency, they will not move forward until they are satisfied on security. Walk through each certification, each control, and be prepared for detailed questions about data residency, encryption key management, and audit log access.",
    "The live identity verification point is worth emphasising. It is a structural advantage of video service over phone or chat. On a phone call, identity verification relies on knowledge-based authentication (date of birth, mother's maiden name) which is compromised by every data breach. On a video call, the advisor can visually compare the customer's face to their ID document. That is the same standard as an in-person branch visit. Deepfakes cannot defeat this because the customer is physically present at the kiosk — the advisor can ask them to turn their head, hold up the ID, or perform a liveness check.",
  ],
  [
    "Top: a row of certification badges (SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS) in clean white circles with purple borders",
    "Middle: three feature cards — Live Identity Verification, Session Traceability, Encryption Standards — each with an icon and 2-line description",
    "Bottom strip: the PII redaction line, highlighting that it is powered by MassaPro AI Analytics (cross-reference to the ecosystem slide)",
    "Use MassaPro purple for the certification badges and card titles",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 19 — SERVICE CONTINUITY
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  19,
  "Service Continuity — If Local Hardware Fails, the Service Never Goes Down",
  "The contact point is decoupled from the session. If the screen, local network, or power fails, the interaction continues on the customer's smartphone via the static QR code — no on-site technical intervention needed.",
  [
    [{ text: "Resilient by design", bold: true }, { text: " — the system is 100% multimodal and keeps running even without fixed screens. The session lives in the cloud, not on the kiosk." }],
    [{ text: "Static QR code backup", bold: true }, { text: " — the printed sticker works even if the kiosk is completely down. The customer scans the sticker and continues the session on their phone." }],
    [{ text: "Full mobile session", bold: true }, { text: " — customers keep video, audio, and shared screen from their own device. They do not lose any capability, just the large screen." }],
    [{ text: "Active session from mobile", bold: true }, { text: " — no technician dispatch, no support ticket, no service interruption. The session that started on the kiosk continues on the phone as if nothing happened." }],
  ],
  [
    "This slide answers the operations continuity question: what happens when the kiosk breaks? The answer is: the service continues on the customer's phone. The kiosk is a convenience, not a dependency. The session is in the cloud, the customer has their phone, and the QR sticker is printed on the wall. As long as two of those three things are working, the service is working.",
    "This is a meaningful operational advantage. In a traditional kiosk deployment, a hardware failure means a service outage until a technician is dispatched. With MassaPro IVR, a hardware failure means the customer uses a slightly smaller screen. The Mean Time To Repair drops from hours (technician dispatch) to zero (the customer never notices). For multi-site operators with remote locations, this is the difference between a service that is up 99% of the time and one that is up 99.99% of the time.",
  ],
  [
    "Three-step illustration: (1) kiosk working normally, (2) kiosk screen goes dark (with a small \"fail\" icon), (3) customer scans the QR sticker on the wall and continues the session on their phone",
    "Use MassaPro purple for the session flow, muted grey for the failed kiosk",
    "Bottom strip: \"No technician dispatch · No support ticket\" in bold, with checkmark icons",
    "Optional: a small uptime badge — \"99.99% service availability, even during hardware failure\"",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 20 — SECTOR APPLICATIONS
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  20,
  "Sector Applications — The Same Model, Four Different Operations",
  "Finance, Retail, Travel & Hospitality, Healthcare. The platform is the same; the use cases are different. MassaPro Flow configures the routing, the branding, and the service options per location.",
  [
    [{ text: "Finance", bold: true }, { text: " — assisted claims assessment, account opening, policy issuance, and claim filing, with visual verification of the policyholder and their document. After-hours service without after-hours staffing." }],
    [{ text: "Retail", bold: true }, { text: " — personal shopper and in-store product advisory. One brand specialist covers the entire retail network. Customers at any store can speak with the specialist, see the product on screen, and place the order." }],
    [{ text: "Travel & Hospitality", bold: true }, { text: " — multilingual 24/7 concierge in the hotel, resort, or tour lobby. No need for a staffed desk overnight. Guests check in, get recommendations, and book excursions from a kiosk." }],
    [{ text: "Healthcare", bold: true }, { text: " — admissions, initial triage, and patient guidance at clinics and centres without permanent front-desk staff. Patients check in, verify identity, and are routed to the right clinician — all on video." }],
  ],
  [
    "This slide is a menu, not a list. The audience should be able to find their sector on the slide and picture their own operation running on MassaPro IVR. If they are in finance, the banking use case is for them. If they are in retail, the personal shopper use case is for them. Walk through each sector briefly, but spend the most time on the sector that matches the audience.",
    "Be ready to discuss sectors not on the slide. The platform is sector-agnostic — the same software that runs a bank kiosk can run a government services kiosk, a university admissions kiosk, or a car dealership kiosk. The configuration is in MassaPro Flow, not in the code. If the audience asks about a sector not listed, the answer is: if you have a service point and a customer who needs to speak with a human, MassaPro IVR applies.",
  ],
  [
    "Four-quadrant grid, each quadrant a sector with an icon, a title, and a 3-line description",
    "Suggested icons: bank building (finance), shopping bag (retail), airplane (travel), medical cross (healthcare)",
    "Use MassaPro purple for the quadrant titles and icons",
    "Bottom strip: a small MassaPro Flow diagram showing how the same platform configures differently per sector",
    "Optional: a small image in each quadrant showing the sector in action (bank lobby, retail store, hotel desk, clinic reception)",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 21 — FEATURED CASE: BANKING
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  21,
  "Featured Case — Banking: Specialised Service Outside Branch Hours",
  "A self-service lobby connects customers to specialised bankers over video — whether or not the branch is open. Account opening, identity verification, credit origination, issue resolution, investment advisory.",
  [
    [{ text: "Step 1 — Arrival", bold: true }, { text: " — the customer enters the self-service lobby, whether or not the branch is open. The lobby is accessible 24/7 with a card or QR code at the door." }],
    [{ text: "Step 2 — Connection", bold: true }, { text: " — scans the kiosk QR code and selects the service: onboarding, an issue, or advisory. The metadata is captured and routed to the right queue." }],
    [{ text: "Step 3 — Video service", bold: true }, { text: " — a specialised banker assists over video and shares documentation on screen. The customer reviews the documents, asks questions, and confirms with a tap on their phone." }],
    [{ text: "Step 4 — Verification", bold: true }, { text: " — identity is confirmed visually (customer face + ID document) and the transaction is validated on the customer's phone. The session is recorded for audit, the transcript is summarised to the CRM, and the customer leaves with their need resolved." }],
    "Applicable processes: account opening, identity verification, credit origination, issue resolution, investment advisory.",
  ],
  [
    "This is the proof-point slide. If the audience is from a bank, this is the slide they will remember. Walk through the four steps as a story. The customer arrives after the branch has closed. They scan the QR code. They pick \"open an account.\" A specialised banker picks up the session — possibly from a contact centre in another city, possibly from their home office. The banker walks the customer through the application, shares the disclosures on screen, verifies their identity by asking them to hold up their driver's licence, and the customer signs on their phone. Total time: under 15 minutes. Total staffing cost: zero on-site.",
    "Be prepared to share quantified results if available — CSAT scores, transaction completion rates, cost-per-interaction comparisons with in-branch. If you do not have hard numbers for this specific case, use the industry benchmarks from slide 4 (CSAT 4.5-5) and note that the actual results from deployed customers are tracked in the customer success programme.",
  ],
  [
    "Four-step horizontal flow diagram: Arrival → Connection → Video Service → Verification",
    "Each step has an icon (door, QR code, video camera, ID badge) and a short caption",
    "Use MassaPro purple for the numbered circles and arrows",
    "Top of slide: a hero image of a self-service bank lobby with a kiosk",
    "Bottom strip: the applicable processes list, in pill-shaped tags",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 22 — BUSINESS CASE / ROI
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  22,
  "Business Case — The Asset Pays for Itself",
  "At rest, the kiosk plays scheduled content and advertising. In service, it replaces fixed staffing costs with on-demand capacity. The point stops being a fixed cost and becomes optimised, flexible capacity.",
  [
    [{ text: "Cost savings", bold: true }, { text: " — eliminate fixed payroll at low-traffic points, reduce infrastructure (climate control, lighting, workstations) at unstaffed locations, and absorb absences centrally instead of covering them point by point." }],
    [{ text: "Revenue uplift", bold: true }, { text: " — capture interactions that previously ended in abandonment or deferral. Every customer who would have walked out now has a path to resolution. CSAT 4.5-5 drives retention and word-of-mouth." }],
    [{ text: "Content and advertising monetisation", bold: true }, { text: " — at rest, the kiosk plays scheduled content and advertising carousels per location (JPG, GIF, MP4). Owned or third-party campaigns. The asset becomes a communication medium, not just a service channel." }],
    [{ text: "Talent arbitrage", bold: true }, { text: " — concentrate your team in one lower-cost site, or move it to another country. The talent pool is no longer constrained by the location of the service point." }],
    "The seventh decision: the service point stops being a fixed cost and becomes optimised, flexible capacity.",
  ],
  [
    "This is the slide the CFO cares about. Walk through the four quadrants of value: cost savings, revenue uplift, monetisation, and talent arbitrage. Each one is a separate line on the business case. Together, they typically pay back the deployment within 6-12 months for a multi-site operator.",
    "If you have a concrete ROI calculator or a worked example for the customer's sector, this is the slide to show it. A simple table comparing traditional cost per interaction (fully-loaded branch staff cost / interactions per month) vs. MassaPro IVR cost per interaction (subscription + amortised kiosk / interactions per month) is often the most persuasive element of the entire deck. The number for MassaPro IVR is usually 40-70% lower, depending on volume.",
    "The advertising monetisation point is often underestimated. A kiosk in a high-traffic location that runs ads 12 hours a day (when not in service) can generate meaningful advertising revenue. In some deployments, the advertising revenue alone covers the subscription cost of the kiosk, making the service effectively free.",
  ],
  [
    "Four-quadrant grid: Cost Savings (top-left), Revenue Uplift (top-right), Monetisation (bottom-left), Talent Arbitrage (bottom-right)",
    "Each quadrant has an icon, a title, and a 3-line description",
    "Suggested icons: scissors (cost savings), upward arrow (revenue), play button (monetisation), globe (talent arbitrage)",
    "Bottom strip: the closing line in bold, in a callout box",
    "Optional: a small bar chart showing cost-per-interaction comparison (traditional vs MassaPro IVR)",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 23 — IMPLEMENTATION ROADMAP
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  23,
  "Implementation Roadmap — From Kick-Off to Go-Live in 8-12 Weeks",
  "A phased deployment managed end-to-end by MassaPro. Discovery, technical integration, AI configuration, testing, training, go-live, and hypercare — each phase has defined entry criteria, deliverables, and exit gates.",
  [
    [{ text: "Phase 1 — Project Kick-Off (Week 1)", bold: true }, { text: " — confirm objectives, scope, milestones, governance. Assign dedicated Project Manager. Produce implementation plan." }],
    [{ text: "Phase 2 — Discovery & Solution Design (Weeks 2-3)", bold: true }, { text: " — map existing customer journeys, telephony, CRM integrations, security requirements, branding. Define AI intents and conversation scenarios. Produce Solution Design Document." }],
    [{ text: "Phase 3 — Technical Integration (Weeks 4-6)", bold: true }, { text: " — configure ACD integration, API gateway, webhooks, CRM connectors, SSO, kiosk hardware. MassaPro engineering team executes; customer IT provides access and credentials." }],
    [{ text: "Phase 4 — AI Configuration (Weeks 5-7, parallel)", bold: true }, { text: " — MassaPro AI Specialists configure AI Agent prompts, AI Guru coaching prompts, MassaPro Flow workflows, branding, and service routing rules with customer subject-matter experts." }],
    [{ text: "Phase 5 — Testing (Weeks 7-9)", bold: true }, { text: " — functional, integration, telephony, AI conversation, security, performance, and UAT. Iterative prompt and workflow refinement until objectives are met." }],
    [{ text: "Phase 6 — Training (Weeks 9-10)", bold: true }, { text: " — role-based training for administrators, supervisors, video advisors, reporting users, and technical administrators. Instructor-led workshops plus hands-on labs." }],
    [{ text: "Phase 7 — Go-Live (Week 10-11)", bold: true }, { text: " — production deployment with hypercare support. Daily check-ins, priority engineering access, rapid configuration changes." }],
    [{ text: "Phase 8 — Hypercare & Continuous Optimisation (Week 12+)", bold: true }, { text: " — Account Manager and Customer Success team work alongside customer to maximise value. Regular reviews of AI performance, conversation optimisation, capacity planning, new use cases." }],
  ],
  [
    "This slide answers the \"how long does it take\" question. The answer is: 8-12 weeks for a standard deployment, depending on the scope of integrations and the complexity of the workflows. The eight-phase methodology is the same one documented in the MassaPro Technical Manual — point the audience there if they want the full detail.",
    "Emphasise that the deployment is managed end-to-end by MassaPro. The customer's team provides subject-matter expertise, access to source systems, and acceptance testing resources. MassaPro provides the project manager, the engineering team, the AI specialists, and the training. This is not a software-licence sale; it is a managed-service deployment with a defined outcome.",
    "Be ready to discuss what accelerates or delays the timeline. Accelerators: existing ACD that we have integrated with before (Genesys, Cisco), standard CRM (Salesforce, HubSpot), clear success criteria, available subject-matter experts. Decelerators: custom CRM with poor API documentation, multi-country regulatory approval, complex multi-brand deployment, customer IT team capacity constraints.",
  ],
  [
    "Horizontal Gantt-style timeline with 8 phases as coloured bars",
    "Use MassaPro purple for the bars, with darker shade for active phases",
    "Each phase has a label, a duration estimate, and a short deliverable description",
    "Bottom strip: \"Managed end-to-end by MassaPro. Customer provides SMEs, access, and UAT resources.\" in italic",
    "Optional: a small badge showing \"8-12 weeks typical end-to-end\"",
  ]
));

// ═══════════════════════════════════════════════════════════════════
// SLIDE 24 — NEXT STEPS / CTA
// ═══════════════════════════════════════════════════════════════════
bodyChildren.push(...slide(
  24,
  "Next Steps — Let's Talk About Your Case",
  "We analyse a specific process from your operation and estimate the deployment model, contact centre integration, and the impact on your network of service points. No commitment, no cost, no obligation.",
  [
    [{ text: "Workshop session (60-90 minutes)", bold: true }, { text: " — bring one specific process from your operation (account opening, claims intake, technical support, concierge, etc.). We map it to MassaPro IVR end-to-end and identify the integration points." }],
    [{ text: "Custom ROI estimate", bold: true }, { text: " — we model the cost-per-interaction comparison between your current model and MassaPro IVR for the specific process, using your volumes and your fully-loaded staffing costs." }],
    [{ text: "Reference architecture", bold: true }, { text: " — we produce a one-page reference architecture for your IT team, showing the ACD integration, the API gateway, the CRM connectors, and the security boundary." }],
    [{ text: "Pilot proposal", bold: true }, { text: " — if the ROI case holds, we propose a pilot deployment at 1-3 locations, 60-90 days, with success criteria agreed up front. The pilot includes the kiosk hardware, the platform subscription, and the MassaPro implementation team." }],
    [{ text: "Decision points", bold: true }, { text: " — at the end of the pilot, you have the data to decide: scale to the full network, iterate on the configuration, or stop. No long-term lock-in." }],
  ],
  [
    "This is the close. Be specific about what you are asking for. The ask is a 60-90 minute workshop with one specific process from the customer's operation. Not a generic demo, not a capabilities presentation — a working session on their process. This is the lowest-friction next step that produces the highest-quality outcome, because it forces the customer to engage with the product on their own terms rather than yours.",
    "End with the line on the slide: no commitment, no cost, no obligation. The workshop is free. The ROI estimate is free. The reference architecture is free. The only thing the customer has to provide is the process and the people who know it. MassaPro provides everything else. If the customer is not ready to commit to a pilot, the workshop still produces value — both sides learn whether there is a fit, and the customer has a concrete artefact (the ROI estimate and the reference architecture) to take to their internal decision-makers.",
    "Close the deck by thanking the audience and asking for the workshop date directly. \"I have Tuesday next week or Thursday the week after open — which works better for your team?\" This is the classic sales close: assume the next step, offer a binary choice. Do not leave the room without a calendar invitation.",
  ],
  [
    "Clean, simple slide with a single hero image: a calendar or a handshake, in MassaPro purple",
    "Five-step list of what the workshop includes, with checkmark icons in purple",
    "Bottom strip: \"No commitment · No cost · No obligation\" in bold, with strike-through dollar and lock icons",
    "Contact block: MassaPro branding, sales contact email, phone, website",
    "Optional: a small QR code in the corner that links to the MassaPro IVR landing page",
  ]
));

// === CLOSING NOTE ===
bodyChildren.push(h1("Closing Note — From Content to PPT"));
bodyChildren.push(body(
  "This document captures the complete narrative content for the MassaPro IVR sales deck. The next step is to translate this content into a designed PPT presentation. Each slide section above maps directly to one PPT slide. The Key Message becomes the slide headline, the Body Content becomes the on-slide bullets, the Speaker Notes become the presenter's notes (and the verbal script for recorded demos), and the Visual Recommendations become the brief for the designer."
));
bodyChildren.push(body(
  "When we move to the PPT design phase, we recommend the following: (1) use the MassaPro purple palette consistently (#7C3AED primary, #6D28D9 dark, #EDE9FE light, #F5F3FF ultralight, #1A0B2E cover background); (2) keep each slide to a single key message with no more than 5 bullet points; (3) use full-bleed imagery for the cover, the concept slide, and the case study slide; (4) use clean iconography for the quadrant slides (problem, sector applications, business case); (5) keep the speaker notes substantive — they are what makes the deck usable by a sales team that did not write it."
));
bodyChildren.push(body(
  "If the audience or the use case changes (executive briefing vs. technical deep-dive vs. trade-show booth), the deck can be compressed or expanded. The minimum viable deck is slides 1, 2, 5, 7, 10, 16, 22, 24 — eight slides, 15 minutes. The full deck is all 24 slides, 35-40 minutes. The technical add-on is to insert the MassaPro Architecture Diagram (from the Technical Manual) after slide 10 for audiences that want to see the platform integration in detail."
));

// ───────────────────── Document assembly ─────────────────────
const doc = new Document({
  creator: "MassaPro Sales Enablement",
  title: "MassaPro IVR — Sales Deck Content",
  description: "Content draft for the MassaPro IVR sales deck, reframed from the Interactive Powers Telepresencia Híbrida source material.",
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri" }, size: 22, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Arial" }, size: 36, bold: true, color: P.accentDark },
        paragraph: { spacing: { before: 480, after: 200, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Arial" }, size: 30, bold: true, color: P.accentDark },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Arial" }, size: 26, bold: true, color: P.accentMain },
        paragraph: { spacing: { before: 240, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    // ─── Cover section ───
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(),
    },
    // ─── Body section ───
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accentMain, space: 4 } },
            children: [new TextRun({
              text: "MassaPro IVR — Sales Deck Content",
              size: 18, color: P.muted, italics: true, font: { ascii: "Calibri" },
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "— ", size: 18, color: P.muted, font: { ascii: "Calibri" } }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.accentMain, bold: true, font: { ascii: "Calibri" } }),
              new TextRun({ text: " —", size: 18, color: P.muted, font: { ascii: "Calibri" } }),
            ],
          })],
        }),
      },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  const out = "/home/z/my-project/download/Massapro-IVR-Sales-Deck-Content.docx";
  fs.writeFileSync(out, buf);
  const sizeKB = (buf.length / 1024).toFixed(1);
  console.log(`✓ Sales deck content document generated: ${out}`);
  console.log(`  File size: ${sizeKB} KB`);
});
