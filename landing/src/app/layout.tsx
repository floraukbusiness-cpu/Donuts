import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site";
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

const TITRE = "Donuts & Donuts : Lyon Part-Dieu et Strasbourg";
const DESCRIPTION =
  "Commandez vos donuts personnalisés pour un anniversaire, une soirée, un mariage, un baptême, un EVJF ou pour votre entreprise. Choisissez votre boutique : Lyon Part-Dieu ou Strasbourg.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: TITRE,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <a href="#contenu" className="sr-only-focusable absolute left-3 top-3 z-50 rounded-lg bg-white px-4 py-2 font-bold">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
