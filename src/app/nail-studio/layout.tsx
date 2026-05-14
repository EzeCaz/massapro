import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MassaPro for Nail Studios | AI Receptionist & Secretary for Nail Salons",
  description:
    "Recover $8K+/month in missed nail appointments. MassaPro answers every call while your nail techs work, books manicures, pedicures & gel nails 24/7, and sends aftercare follow-up reminders automatically. AI-powered receptionists purpose-built for nail studios.",
  keywords: [
    "MassaPro Nail Studio",
    "AI Receptionist Nail Salon",
    "Nail Studio AI Secretary",
    "Nail Salon AI Automation",
    "Nail Studio Booking AI",
    "Manicure Pedicure Booking AI",
    "Nail Studio Virtual Assistant",
  ],
  openGraph: {
    title: "MassaPro for Nail Studios | AI Receptionist & Secretary",
    description:
      "Recover $8K+/month in missed nail appointments. AI-powered receptionists purpose-built for nail studios.",
    type: "website",
  },
};

export default function NailStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
