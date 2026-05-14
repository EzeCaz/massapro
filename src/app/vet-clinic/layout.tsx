import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Receptionist & Secretary for Veterinary Clinics | MassaPro",
  description:
    "MassaPro's AI receptionist, secretary, and concierge handle emergency triage, appointment scheduling, vaccination reminders, and prescription refills for veterinary clinics 24/7. Recover $10K+/month in missed revenue.",
  keywords: [
    "AI receptionist vet clinic",
    "veterinary AI secretary",
    "vet clinic appointment scheduling",
    "AI emergency triage",
    "vaccination reminder AI",
    "veterinary clinic automation",
  ],
  openGraph: {
    title: "AI Receptionist & Secretary for Veterinary Clinics | MassaPro",
    description:
      "24/7 AI receptionist for veterinary clinics. Emergency triage, appointment scheduling, vaccination reminders, and prescription refills automated.",
    type: "website",
  },
};

export default function VetClinicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
