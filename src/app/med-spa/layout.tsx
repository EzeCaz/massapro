import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MassaPro for Med Spas | AI Receptionist & Secretary for Medical Spas",
  description:
    "Recover $15K+/month in missed med spa appointments. MassaPro answers every call while your providers treat clients, books Botox, fillers & laser appointments 24/7, and sends aftercare follow-up reminders automatically. AI-powered receptionists purpose-built for med spas and aesthetic medicine practices.",
  keywords: [
    "MassaPro Med Spa",
    "AI Receptionist Med Spa",
    "Med Spa AI Secretary",
    "Med Spa AI Automation",
    "Med Spa Booking AI",
    "Botox Filler Booking AI",
    "Aesthetic Medicine AI",
    "Med Spa Virtual Assistant",
    "PatientNow AI Integration",
    "Aesthetix CRM AI",
  ],
  openGraph: {
    title: "MassaPro for Med Spas | AI Receptionist & Secretary",
    description:
      "Recover $15K+/month in missed med spa appointments. AI-powered receptionists purpose-built for medical spas and aesthetic medicine practices.",
    type: "website",
  },
};

export default function MedSpaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
