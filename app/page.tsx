import Axes from "@/components/home/Axes";
import Hero from "@/components/home/Hero";
import type { Metadata } from "next";
import { OG_BANNER_IMAGES, TWITTER_BANNER_IMAGES } from "@/lib/openGraph";

export const metadata: Metadata = {
  title: "Coaching & Formations pour la santé des soignants à Toulouse",
  description:
    "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les établissements et soignants à Toulouse et en Occitanie. Prévention de l'épuisement, gestion des émotions.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Coaching & Formations pour la santé des soignants à Toulouse",
    description:
      "Ancienne soignante, j'accompagne les établissements et professionnels de santé à Toulouse à prévenir l'épuisement, réguler la charge émotionnelle et soutenir des pratiques de travail durables.",
    url: "https://elancestvous.fr",
    images: OG_BANNER_IMAGES,
  },
  twitter: {
    title: "Coaching & Formations pour la santé des soignants à Toulouse",
    description:
      "Coaching, formations QVCT/RPS et accompagnement pour soignants à Toulouse et en Occitanie.",
    images: TWITTER_BANNER_IMAGES,
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
