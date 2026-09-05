import type { Metadata } from "next";
import CtaElan from "@/components/CtaElan";
import Image from "next/image";
import Link from "next/link";

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
  },
};

export default function About() {
  return (
    <>
      <section id="apropos" className="pt-20 mb-40">
        <div className="container text-center mb-20">
          <h1>
            Coralie Mathorel –{" "}
            <span className="text-accent">
              <strong>Coach certifiée à Toulouse</strong>
            </span>
          </h1>
          <h2 className="h3-like">
            Ancienne soignante, j'accompagne aujourd'hui la santé de ceux qui
            soignent.
          </h2>
        </div>

        <div className="container flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-9/12 md:w-4/12 mb-20 md:mb-0 md:-mt-15">
            <Image
              src="/coralie.png"
              width={300}
              height={300}
              className="rounded-full w-full object-cover shadow-lg max-w-[250px] mx-auto"
              alt="Coralie Mathorel, coach professionnelle certifiée et ancienne soignante, à Toulouse"
            />
            <div className="absolute left-0 md:-bottom-15 right-0 p-6 text-center">
              <p className="text-primary font-serif text-lg md:text-xl italic">
                "Accompagnement humain."
              </p>
            </div>
          </div>
          <div className="w-full md:w-8/12">
            <div>
              <div className="prose text-stone-600 mb-8 space-y-4 text-justify">
                <p>
                  Mon parcours a débuté au cœur du soin. Cette réalité du
                  terrain, je la connais : l'urgence, la charge mentale, la
                  pression du quotidien.
                </p>
                <p>
                  <strong>
                    C'est ce qui fait aujourd'hui ma force :&nbsp;
                    <span className="text-accent font-serif font-extrabold text-2xl italic">
                      je ne parle pas de théorie, je parle de votre réalité.
                    </span>
                  </strong>
                </p>
                <p>
                  Formée au coaching et forte de mon expérience du soin, j'ai
                  construit à Toulouse une approche qui s'appuie sur l'écoute,
                  la mise en mouvement et des outils concrets —{" "}
                  <Link
                    href="/particuliers/coaching-individuel"
                    className="text-accent underline underline-offset-2 hover:text-primary"
                  >
                    coaching individuel
                  </Link>
                  ,{" "}
                  <Link
                    href="/professionnels-etablissements-de-soins/formations-rps-qvct"
                    className="text-accent underline underline-offset-2 hover:text-primary"
                  >
                    formations QVCT/RPS
                  </Link>
                  ,{" "}
                  <Link
                    href="/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles"
                    className="text-accent underline underline-offset-2 hover:text-primary"
                  >
                    groupes d'analyse des pratiques
                  </Link>{" "}
                  — pour agir en prévention et soutenir des changements
                  durables.
                </p>
                <p>
                  <strong>
                    Former, accompagner, soutenir dans la durée : c'est le fil
                    conducteur de mon engagement professionnel.
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-& md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 text-center">
                  <span className="block text-2xl font-bold text-primary mb-1">
                    10+
                  </span>
                  <span className="text-xs text-stone-500 uppercase tracking-wide">
                    Années d'expérience
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 text-center">
                  <span className="block text-2xl font-bold text-primary mb-1">
                    Coach
                  </span>
                  <span className="text-xs text-stone-500 uppercase tracking-wide">
                    Certifiée d'État
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaElan />
    </>
  );
}
