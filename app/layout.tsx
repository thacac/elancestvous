import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/ui/back-to-top";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://elancestvous.fr"),
  title: {
    default: "Élan C’est Vous | Coaching & Formation en santé au travail",
    template: "%s | Élan C’est Vous",
  },
  description:
    "Coaching individuel et collectif, formations QVCT/RPS et groupes d’analyse des pratiques pour les professionnels et établissements de santé.",
  keywords: [
    "coaching professionnel",
    "formation santé au travail",
    "prévention RPS",
    "QVCT",
    "établissements de santé",
    "gestion du stress",
    "burnout soignants",
    "coaching soignants",
    "Coralie Mathorel",
  ],
  authors: [{ name: "Coralie Mathorel", url: "https://elancestvous.fr" }],
  creator: "Coralie Mathorel",
  publisher: "Élan C’est Vous",
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
    siteName: "Élan C’est Vous",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo_elancestvous.png",
        width: 800,
        height: 800,
        alt: "Logo Élan C’est Vous",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo_elancestvous.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#29b5ad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="elancestvous">
      <body className={inter.className + " bg-white text-brand-dark"}>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <BackToTop />
        <Toaster />
      </body>
    </html>
  );
}
