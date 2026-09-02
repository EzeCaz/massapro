"use client";

const FILES = [
  {
    name: "Massapro-IVR-Sales-Pitch-Deck.pptx",
    size: "41 MB",
    title: "MassaPro IVR Sales Pitch Deck — PPTX",
    description:
      "24 slides, 16:9 widescreen. The original MassaPro IVR sales pitch deck with full purple brand system, MassaPro logo on every slide, real human images of receptionists/concierges/video advisors on each slide, diversified layouts (cover → bento grids → split text/image → timeline → stats → comparison → closing), and full ~80-150 word speaker notes embedded as hidden notes on each slide.",
    kind: "PPTX" as const,
  },
  {
    name: "Massapro-Enterprise-Brochure-Rebranded.pdf",
    size: "7.1 MB",
    title: "MassaPro Enterprise Brochure — PDF",
    description:
      "30 slides, 16:9. Rebranded from the ConnexAI Enterprise Product Brochure (2026) with full MassaPro purple brand book. Best for previewing in browser.",
    kind: "PDF" as const,
  },
  {
    name: "Massapro-Enterprise-Brochure-Rebranded-Compact.pptx",
    size: "4.7 MB",
    title: "MassaPro Enterprise Brochure — Compact PPTX",
    description:
      "30 slides, 16:9. Optimized images. Best for editing in PowerPoint — opens reliably without size-cap errors.",
    kind: "PPTX" as const,
  },
  {
    name: "Massapro-Enterprise-Brochure-Rebranded.pptx",
    size: "31 MB",
    title: "MassaPro Enterprise Brochure — Full PPTX",
    description:
      "30 slides, 16:9. Full-resolution version of the rebranded Enterprise brochure.",
    kind: "PPTX" as const,
  },
  {
    name: "Massapro-IVR-Rebranded-Dec.pdf",
    size: "5.6 MB",
    title: "MassaPro IVR Rebranded — PDF",
    description:
      "30-page Telepresencia_Hibrida deck rebranded with MassaPro purple palette. Original images preserved verbatim.",
    kind: "PDF" as const,
  },
  {
    name: "Massapro-IVR-Rebranded-Dec-Compact.pptx",
    size: "2.0 MB",
    title: "MassaPro IVR Rebranded — Compact PPTX",
    description:
      "Editable PPTX of the IVR rebranded deck. Optimized to 2 MB for reliable download.",
    kind: "PPTX" as const,
  },
];

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MassaPro Downloads</h1>
              <p className="text-sm text-gray-500">receptionist.massapro.com</p>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Rebranded presentation decks. Click any file below to download directly from this domain.
          </p>
        </header>

        <div className="grid gap-4">
          {FILES.map((file) => {
            const isPDF = file.kind === "PDF";
            const href = `/downloads/${file.name}`;
            return (
              <a
                key={file.name}
                href={href}
                download={file.name}
                className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isPDF ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                        {file.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{file.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">{file.name}</span>
                        <span>{file.size}</span>
                        <span className="uppercase">{file.kind}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-purple-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 group-hover:translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Direct download links</h2>
          <p className="text-sm text-gray-600 mb-4">
            If the buttons above don&apos;t trigger a download in your browser, copy and paste these direct links:
          </p>
          <ul className="space-y-2 text-sm">
            {FILES.map((file) => (
              <li key={file.name} className="font-mono text-purple-700 break-all">
                <a href={`/downloads/${file.name}`} download={file.name} className="hover:underline">
                  https://receptionist.massapro.com/downloads/{file.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>If a download still fails, right-click any link and choose &quot;Save link as…&quot;</p>
        </footer>
      </div>
    </div>
  );
}
