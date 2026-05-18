import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | MassaPro for Hair Salons",
  description:
    "Your guide is on the way. Discover how salon owners are automating with MassaPro.",
  robots: "noindex, nofollow",
};

export default function HairSalonTYLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
