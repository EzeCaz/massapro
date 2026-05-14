import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MassaPro for Beauty Shops | AI Receptionist & Secretary for Beauty Salons",
  description:
    "Recover $15K+/month in missed beauty appointments. MassaPro answers every call while your estheticians work, books facials & waxing appointments 24/7, and sends skincare follow-up reminders automatically. AI-powered receptionists purpose-built for beauty shops.",
  keywords: [
    "MassaPro Beauty Shop",
    "AI Receptionist Beauty Salon",
    "Beauty Shop AI Secretary",
    "Beauty Salon AI Automation",
    "Beauty Shop Booking AI",
    "Facial Waxing Booking AI",
    "Beauty Shop Virtual Assistant",
  ],
  openGraph: {
    title: "MassaPro for Beauty Shops | AI Receptionist & Secretary",
    description:
      "Recover $15K+/month in missed beauty appointments. AI-powered receptionists purpose-built for beauty shops.",
    type: "website",
  },
};

export default function BeautyShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
