import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BOUTIQUE } from "@/lib/catalogue";
import "./globals.css";

const fredoka = localFont({
  src: [
    { path: "./fonts/fredoka-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/fredoka-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/fredoka-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = localFont({
  src: [
    { path: "./fonts/nunito-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/nunito-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-nunito",
  display: "swap",
});

function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

const TITRE = "Donuts pour anniversaires, événements et professionnels à Lyon Part-Dieu et Strasbourg";
const DESCRIPTION =
  "Donuts & Donuts Lyon Part-Dieu et Strasbourg : commandez vos donuts personnalisés pour un anniversaire (sur place à Lyon, ou à emporter), une soirée, un mariage, un baptême, un EVJF ou pour votre entreprise.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${TITRE} | Donuts & Donuts`,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Donuts & Donuts Lyon Part-Dieu et Strasbourg",
    title: TITRE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: TITRE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e6007e",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: BOUTIQUE.nom,
  url: siteUrl(),
  image: `${siteUrl()}/opengraph-image.jpg`,
  email: BOUTIQUE.email,
  servesCuisine: "Donuts",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${BOUTIQUE.rue}, ${BOUTIQUE.lieu}`,
    postalCode: BOUTIQUE.codePostal,
    addressLocality: BOUTIQUE.ville,
    addressCountry: "FR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
  sameAs: [`https://www.instagram.com/${BOUTIQUE.instagram}/`],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <a href="#contenu" className="sr-only-focusable absolute left-3 top-3 z-50 rounded-lg bg-white px-4 py-2 font-bold">
          Aller au contenu
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
