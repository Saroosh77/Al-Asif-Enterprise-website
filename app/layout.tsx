import type { Metadata } from "next";
import "./globals.css";
import siteConfig from "../site.config.json";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
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
    icon: "/images/al-asif-logo.png",
    shortcut: "/images/al-asif-logo.png",
  },
  openGraph: {
    title: "Al-Asif Enterprise | Solar Power Solutions",
    description:
      "Solar equipment and carefully planned residential and commercial projects from Karachi across Pakistan.",
    type: "website",
    locale: "en_PK",
    images: [{
      url: "/images/hero-solar-equipment.jpg",
      width: 1201,
      height: 1600,
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
