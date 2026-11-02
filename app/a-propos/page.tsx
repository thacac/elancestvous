import Image from "next/image";
import Link from "next/link";

import { KeyMessage, PastelCard, SectionBanner } from "@/components/charte";
import CtaElan from "@/components/CtaElan";
import { IconStethoscope } from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos – Coach certifiée à Toulouse",
  description:
    "Découvrez le parcours de Coralie Mathorel, ancienne soignante devenue coach certifiée à Toulouse, et sa méthode d'accompagnement pour soutenir durablement les soignants en Occitanie.",
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    title: "À propos – Coach certifiée à Toulouse | Élan C'est Vous",
    description:
      "Ancienne soignante et coach certifiée à Toulouse, j'accompagne la santé de ceux qui soignent. Découvrez mon approche humaine et concrète.",
    url: "https://elancestvous.fr/a-propos",
    images: OG_BANNER_IMAGES,
  },
};

export default function About() {
  return (
    <>
      <section id="apropos" className="pt-6 sm:pt-20 mb-12">
        <div className="container text-center mb-12">
          <h1 className="text-3xl! sm:text-5xl! lg:text-6xl! break-words">
            Coralie Mathorel –{" "}
            <span className="text-accent">
              <strong>Coach certifiée à Toulouse</strong>
            </span>
          </h1>
          <h2 className="h3-like">
            Ancienne soignante, j&apos;accompagne aujourd&apos;hui la santé de ceux qui
            soignent.
          </h2>
        </div>

        {/* Story 4.9 : bandeau ajouté (titre validé par Cédric). */}
        <SectionBanner title="Mon parcours" icon={<IconStethoscope />} className="mb-8" />

        <div className="container flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Vraie photo de Coralie : exception autorisée à la règle « tout
              en dessin » (confiance, E-E-A-T), en médaillon rond. */}
          <div className="flex flex-col items-center md:w-4/12 md:pt-4">
            <Image
              src="/coralie.png"
              width={300}
              height={300}
              className="rounded-full object-cover size-48 md:size-64"
              alt="Coralie Mathorel, coach professionnelle certifiée et ancienne soignante, à Toulouse"
            />
            <p className="mt-4 text-center font-hand text-xl text-primary">
              &quot;Accompagnement humain.&quot;
            </p>
          </div>
          <div className="w-full md:w-8/12">
            <div className="prose text-stone-600 mb-8 space-y-4">
              <p>
                Mon parcours a débuté au cœur du soin. Cette réalité du
                terrain, je la connais : l&apos;urgence, la charge mentale, la
                pression du quotidien.
              </p>
              <p>
                <strong>
                  C&apos;est ce qui fait aujourd&apos;hui ma force :&nbsp;
                  <span className="text-accent font-display font-extrabold text-2xl italic">
                    je ne parle pas de théorie, je parle de votre réalité.
                  </span>
                </strong>
              </p>
              <p>
                Formée au coaching et forte de mon expérience du soin, j&apos;ai
                construit à Toulouse une approche qui s&apos;appuie sur l&apos;écoute,
                la mise en mouvement et des outils concrets —{" "}
                <Link
                  href="/coaching/particuliers"
                  className="text-accent underline underline-offset-2 hover:text-primary"
                >
                  coaching individuel
                </Link>
                ,{" "}
                <Link
                  href="/formations/prevention-rps-qvct-etablissements-sante"
                  className="text-accent underline underline-offset-2 hover:text-primary"
                >
                  formations QVCT/RPS
                </Link>
                ,{" "}
                <Link
                  href="/gapp-analyse-pratiques-professionnelles"
                  className="text-accent underline underline-offset-2 hover:text-primary"
                >
                  groupes d&apos;analyse des pratiques
                </Link>{" "}
                — pour agir en prévention et soutenir des changements
                durables.
              </p>
            </div>

            <KeyMessage className="mb-8">
              <strong>
                Former, accompagner, soutenir dans la durée : c&apos;est le fil
                conducteur de mon engagement professionnel.
              </strong>
            </KeyMessage>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PastelCard tone="sky" as="div" className="p-4 text-center">
                <span className="block font-display text-2xl font-black text-primary mb-1">
                  10+
                </span>
                <span className="text-xs text-stone-600 uppercase tracking-wide">
                  Années d&apos;expérience
                </span>
              </PastelCard>
              <PastelCard tone="peach" as="div" className="p-4 text-center">
                <span className="block font-display text-2xl font-black text-primary mb-1">
                  Coach
                </span>
                <span className="text-xs text-stone-600 uppercase tracking-wide">
                  Certifiée d&apos;État
                </span>
              </PastelCard>
            </div>
          </div>
        </div>
      </section>
      <CtaElan />
    </>
  );
}
