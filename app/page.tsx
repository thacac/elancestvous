import Axes from "@/components/home/Axes";
import Hero from "@/components/home/Hero";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Coaching & Formations pour la santé des soignants à Toulouse",
  description:
    "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les établissements et soignants à Toulouse et en Occitanie. Prévention de l'épuisement, gestion des émotions.",
  alternates: {
    canonical: "https://www.elancestvous.fr",
  },
  openGraph: {
    title: "Coaching & Formations pour la santé des soignants à Toulouse",
    description:
      "Ancienne soignante, j'accompagne les établissements et professionnels de santé à Toulouse à prévenir l'épuisement, réguler la charge émotionnelle et soutenir des pratiques de travail durables.",
    url: "https://www.elancestvous.fr",
  },
  twitter: {
    title: "Coaching & Formations pour la santé des soignants à Toulouse",
    description:
      "Coaching, formations QVCT/RPS et accompagnement pour soignants à Toulouse et en Occitanie.",
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
