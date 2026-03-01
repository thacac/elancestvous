
import ArticulationBloc from "@/components/ArticulationBloc";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import { IconBuilding, IconHand, IconManager, IconStethoscope, IconWatch } from "@/components/ui/icons-publics";

import BadgesBloc from "@/components/BadgesBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";

export const metadata = {
  title:
    "Groupe d'analyse des pratiques professionnelles (GAPP) | Élan C'est Vous",
  description:
    "Groupe d'analyse des pratiques professionnelles (GAPP) : un espace sécurisé pour partager, analyser et améliorer les pratiques professionnelles en équipe, animé par une coach certifiée.",
  keywords: [
    "GAPP",
    "groupe d'analyse des pratiques professionnelles",
    "analyse de pratiques",
    "équipe",
    "santé",
    "coaching",
    "amélioration continue",
    "qualité des soins",
    "accompagnement",
  ],
  alternates: {
    canonical: "https://elancestvous.fr/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
  },
  openGraph: {
    title:
      "Groupe d'analyse des pratiques professionnelles (GAPP) | Élan C'est Vous",
    description:
      "Groupe d'analyse des pratiques professionnelles (GAPP) : un espace sécurisé pour partager, analyser et améliorer les pratiques professionnelles en équipe, animé par une coach certifiée.",
    url: "https://elancestvous.fr/gapp-groupe-analyse-pratiques-professionnelles",
    type: "website",
  },
};

export default function GappPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* --- 1. Titre --- */}
        <section id="gapp-titre" className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Groupe d'analyse des{" "}
              <span className="text-accent">
                <strong>pratiques professionnelles</strong>
              </span>
              .
            </h1>
            <h2 className="py-5 ">
              Un espace sécurisé pour{" "}
              <span className="text-accent">
                <strong>partager</strong>
              </span>
              ,{" "}
              <span className="text-accent">
                <strong>analyser</strong>
              </span>{" "}
              et{" "}
              <span className="text-accent">
                <strong>améliorer</strong>
              </span>{" "}
              les pratiques professionnelles en équipe.
            </h2>
            <h3>
              Animé par une coach certifiée, pour une{" "}
              <strong>qualité des soins</strong> renforcée et un{" "}
              <strong>accompagnement</strong> sur-mesure.
            </h3>
          </div>
        </section>

        <section>
          <div className="container mx-auto text-center -mt-20 mb-20">
            <p className="text-md italic text-stone-500 mb-2">
              (En cours de certification, animation de groupe d’analyse des pratiques professionnelles.)
            </p>
          </div>
        </section>

        {/* --- 2. Objectifs du GAPP --- */}
        <CartesContrastBloc
          titre="Les objectifs du GAPP"
          sousTitre="Favoriser la réflexion collective et l'amélioration continue."
          cartes={[
            {
              numero: "01",
              titre: "Prendre du recul",
              texte: "Analyser collectivement des situations vécues pour mieux comprendre les enjeux et les pratiques.",
            },
            {
              numero: "02",
              titre: "Développer les compétences",
              texte: "Renforcer les savoir-faire relationnels, l'écoute, la coopération et la gestion des situations complexes.",
            },
            {
              numero: "03",
              titre: "Soutenir l'équipe",
              texte: "Créer un espace d'expression, de soutien et de valorisation des pratiques professionnelles.",
            },
          ]}
        />

        {/* --- 3. Fonctionnement du GAPP --- */}
        <BadgesBloc
          titre="Un cadre méthodologique sécurisé"
          badges={[
            "Confidentialité et bienveillance",
            "Analyse structurée des situations",
            "Participation active de chacun",
            "Animation par une coach certifiée",
          ]}
          citation={
            <Citation
              text="Le GAPP permet de prendre du recul, de renforcer la cohésion d'équipe et d'améliorer la qualité des pratiques professionnelles."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          }
        />

        {/* --- 3b. Démarche dans la durée --- */}
        <section
          id="gapp-duree"
          className="py-16 bg-muted/40 relative overflow-hidden"
        >
          <div className="container mx-auto px-6 text-center max-w-3xl flex flex-col items-center relative z-10">
            <div className="relative w-full flex flex-col items-center mb-4">
              <h2 className="text-primary font-serif font-bold text-2xl mb-6 relative z-20">
                Une démarche inscrite dans la durée
              </h2>
              {/* Icône montre moderne en arrière-plan */}
              <span className="absolute left-0 -bottom-5 md:-left-20 md:-bottom-10 z-0 opacity-10 pointer-events-none select-none">
                <IconWatch className="w-45 h-45 md:w-65 md:h-65 text-primary" />
              </span>
            </div>
            <p className="text-lg text-primary/80 mb-2 relative z-20 text-justify">
              Les groupes d’analyse de la pratique s’inscrivent dans une logique
              de durée, avec une régularité définie en fonction des besoins et
              du contexte des équipes.
            </p>
            <p className="text-lg text-primary/80 mb-2 relative z-20 text-justify">
              Ils constituent un espace de respiration professionnelle,
              complémentaire aux actions de formation ou de coaching, sans
              objectif de performance ni injonction au changement.
            </p>
          </div>
        </section>
        {/* --- 4. Pour qui ? --- */}
        <PublicsCiblesBloc
          titre="À qui s’adresse le GAPP ?"
          sousTitre="Le GAPP s’adresse à toutes les équipes souhaitant améliorer leurs pratiques professionnelles, renforcer la cohésion et la qualité du service rendu."
          cartes={[
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre: "Aux équipes pluridisciplinaires",
            },
            {
              icon: <IconStethoscope className="w-6 h-6 text-accent" />,
              titre: "Aux professionnels de santé",
            },
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre: "Aux cadres et managers",
            },
            {
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre: "Aux établissements souhaitant soutenir leurs équipes",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre: "Aux agences d’intérim accompagnant leurs professionnels",
            },
          ]}
        />

        {/* --- 5. Bloc articulation avec les autres accompagnements --- */}
        <ArticulationBloc textePrincipal="Les groupes d’analyse de la pratique peuvent être proposés de manière autonome ou en articulation avec des actions de formation ou de coaching, selon les besoins identifiés." />
        {/* --- 6. CTA FINAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
