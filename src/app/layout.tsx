import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MassaPro — AI Agentic Receptionist & Secretary Services",
  description:
    "Intelligent, voice + text Agentic AI receptionists and secretaries tailored for businesses like hair salons, nail studios, beauty shops, veterinary clinics, and more.",
  keywords: [
    "MassaPro",
    "AI Receptionist",
    "AI Secretary",
    "Virtual Assistant",
    "Agentic AI",
    "Business Automation",
  ],
  authors: [{ name: "MassaPro" }],
  icons: {
    icon: "/massapro-logo.png",
  },
  openGraph: {
    title: "MassaPro — AI Agentic Receptionist & Secretary Services",
    description:
      "Intelligent AI receptionists and secretaries for your business",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
