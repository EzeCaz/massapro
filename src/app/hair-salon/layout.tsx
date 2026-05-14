import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MassaPro for Hair Salons | AI Receptionist & Secretary for Hair Studios",
  description:
    "Recover $12K+/month in missed hair salon appointments. MassaPro answers every call while your stylists work, books haircuts & color appointments 24/7, and sends rebooking reminders automatically. AI-powered receptionists purpose-built for hair salons.",
  keywords: [
    "MassaPro Hair Salon",
    "AI Receptionist Hair Salon",
    "Hair Salon AI Secretary",
    "Hair Studio AI Automation",
    "Hair Salon Booking AI",
    "Haircut Color Booking AI",
    "Hair Salon Virtual Assistant",
  ],
  openGraph: {
    title: "MassaPro for Hair Salons | AI Receptionist & Secretary",
    description:
      "Recover $12K+/month in missed hair salon appointments. AI-powered receptionists purpose-built for hair salons.",
    type: "website",
  },
};

export default function HairSalonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
