import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export const metadata: Metadata = {
  title: {
    default: "Hardter TV Dorsten | Tennis in Dorsten - Tennisverein an der Gahlener Str.",
    template: "%s – Hardter TV",
  },
  description:
    "Der führende Tennisverein in Dorsten: Hardter TV bietet professionelles Training für alle Altersklassen, moderne Tennisplätze und eine aktive Tennis-Community. Besuchen Sie uns an der Gahlener Str. 204 in Dorsten.",
  keywords: [
    "tennis dorsten", "Hardter TV", "hardter tv", "tennis", "dorsten",
    "Tennisverein Dorsten", "Tennisplätze Dorsten", "Tennisclub Dorsten",
    "Tennis Training Dorsten", "Tenniskurse Dorsten", "Tennis für Kinder Dorsten",
    "Tennis für Erwachsene Dorsten", "Tennis für Senioren Dorsten",
    "Tennis Mannschaftssport Dorsten", "Tennis NRW", "Gahlener Str. 204",
  ],
  authors: [{ name: "Hardter Tennisverein Dorsten" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "0gx3hyEH12kdsRXAgq1wqLd6Ob4_9hyHqm95lMaqbkw",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://hardt-tennis.de/",
    siteName: "Hardter TV Dorsten",
    title: "Hardter TV Dorsten | Tennis in Dorsten - Tennisverein an der Gahlener Str.",
    description:
      "Der führende Tennisverein in Dorsten: Hardter TV bietet professionelles Training für alle Altersklassen, moderne Tennisplätze und eine aktive Tennis-Community.",
    images: [{ url: "https://hardt-tennis.de/images/logo1.png", alt: "Hardter TV Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hardter TV Dorsten | Tennis in Dorsten - Tennisverein an der Gahlener Str.",
    description:
      "Der führende Tennisverein in Dorsten: Hardter TV bietet professionelles Training für alle Altersklassen, moderne Tennisplätze und eine aktive Tennis-Community.",
    images: ["https://hardt-tennis.de/images/logo1.png"],
  },
  other: {
    "geo.region": "DE-NW",
    "geo.placename": "Dorsten",
    "geo.position": "51.657233;6.965104",
    ICBM: "51.657233, 6.965104",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
