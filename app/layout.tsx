import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elancestvous.fr"),
  title: {
    default: "Élan C'est Vous | Coaching & Formations – Toulouse",
    template: "%s | Élan C'est Vous",
  },
  description:
    "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour établissements et soignants à Toulouse et en Occitanie.",
  keywords: [
    "PSSM",
    "coaching professionnel",
    "formation santé au travail",
    "prévention RPS",
    "QVCT",
    "GAPP",
    "analyse des pratiques professionnelles",
    "établissements de santé",
    "gestion du stress",
    "burnout soignants",
    "coaching soignants",
    "Coralie Mathorel",
    "coaching Toulouse",
    "formation Toulouse",
    "GAPP Toulouse",
    "coach certifiée Toulouse",
    "Toulouse",
    "Haute-Garonne",
    "Occitanie",
  ],
  authors: [{ name: "Coralie Mathorel", url: "https://www.elancestvous.fr" }],
  creator: "Coralie Mathorel",
  publisher: "Élan C'est Vous",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    siteName: "Élan C'est Vous",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Élan C'est Vous – Coaching & Formations pour soignants à Toulouse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-banner.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#29b5ad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="elancestvous">
      <body className={inter.className + " bg-white text-brand-dark"}>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
