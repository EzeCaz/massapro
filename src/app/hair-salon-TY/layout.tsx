import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | MassaPro for Hair Salons",
  description:
    "Check your inbox! Your guide is on the way. Now, want to skip the manual work entirely? Here's how salon owners are doing it automatically.",
  robots: "noindex, nofollow",
};

export default function HairSalonTYLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
