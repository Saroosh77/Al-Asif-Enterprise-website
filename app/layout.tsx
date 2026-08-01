import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Al-Asif Enterprise | Solar Equipment & Projects Pakistan",
    template: "%s | Al-Asif Enterprise",
  },
  description:
    "Solar equipment, residential and commercial solar installations, hybrid backup systems and maintenance from Karachi across Pakistan.",
  keywords: [
    "solar installation Karachi",
    "solar equipment Pakistan",
    "solar panels Karachi",
    "hybrid inverter Pakistan",
    "commercial solar projects",
    "Al-Asif Enterprise",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: "/images/al-asif-letterhead.jpg",
    shortcut: "/images/al-asif-letterhead.jpg",
  },
  openGraph: {
    title: "Al-Asif Enterprise | Solar Power Solutions",
    description:
      "Solar equipment and carefully planned residential and commercial projects from Karachi across Pakistan.",
    type: "website",
    locale: "en_PK",
    images: [{
      url: "/images/hero-solar-equipment.png",
      width: 1080,
      height: 1350,
      alt: "Al-Asif Enterprise solar equipment and installation services",
    }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
