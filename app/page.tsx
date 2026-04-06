import Axes from "@/components/home/Axes";
import Hero from "@/components/home/Hero";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elancestvous.fr"),
  title: "ÉlanC’estVous | Coaching & Formation - Préserver la santé de ceux qui soignent | eLanceStVous",
  description:
    "Accompagnement des établissements et professionnels de santé : prévention de l'épuisement, gestion des émotions, formations, coaching et groupes d'analyse des pratiques professionnelles.",
  alternates: {
    canonical: "https://elancestvous.fr",
  },
  openGraph: {
    title: "Préserver la santé de ceux qui soignent | Élan C’est Vous",
    description:
      "Ancienne soignante, j'accompagne les établissements et professionnels de santé à prévenir l'épuisement, réguler la charge émotionnelle et soutenir des pratiques de travail durables.",
    url: "https://www.elancestvous.fr",
    siteName: "eLanceStVous",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Logo ÉlanC’estVous",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Préserver la santé de ceux qui soignent | Élan C’est Vous",
    description:
      "Coaching, formations et accompagnement pour la santé au travail et la performance humaine dans le secteur de la santé.",
    images: ["/og-banner.jpg"],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Axes />
    </>
  );
}
