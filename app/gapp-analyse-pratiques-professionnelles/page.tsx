import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import { IconBuilding, IconHand, IconManager, IconStethoscope, IconWatch } from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";


export const metadata = {
  title:
    "GAPP – Groupe d'analyse des pratiques professionnelles en santé",
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
    canonical: "/gapp-analyse-pratiques-professionnelles",
  },
  openGraph: {
    title:
      "Groupe d'analyse des pratiques professionnelles (GAPP) | Élan C'est Vous",
    description:
      "Groupe d'analyse des pratiques professionnelles (GAPP) : un espace sécurisé pour partager, analyser et améliorer les pratiques professionnelles en équipe, animé par une coach certifiée.",
    url: "https://elancestvous.fr/gapp-analyse-pratiques-professionnelles",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

export default function GappPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        <Breadcrumbs items={[{ label: "GAPP" }]} />
        {/* --- 1. Titre --- */}
        <section id="gapp-titre" data-hero className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Groupe d&apos;analyse des{" "}
              <BrushUnderline className="text-accent">
                <strong>pratiques professionnelles</strong>
              </BrushUnderline>
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
            <p className="text-md italic text-primary/80 mb-2">
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
        <section id="gapp-duree" className="scroll-mt-20 bg-white pb-15">
          <SectionBanner title="Une démarche inscrite dans la durée" icon={<IconWatch />} />
          <PastelCard as="div" tone="sky" className="container mt-8 max-w-3xl p-8 md:p-10">
            <p className="text-lg text-primary mb-4">
              Les groupes d’analyse de la pratique s’inscrivent dans une logique
              de durée, avec une régularité définie en fonction des besoins et
              du contexte des équipes.
            </p>
            <p className="text-lg text-primary">
              Ils constituent un espace de respiration professionnelle,
              complémentaire aux actions de formation ou de coaching, sans
              objectif de performance ni injonction au changement.
            </p>
          </PastelCard>
        </section>
        {/* --- 4. Pour qui ? --- */}
        <PublicsCiblesBloc
          titre="À qui s’adresse le GAPP ?"
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
        <ArticulationBloc
          textePrincipal="Les groupes d’analyse de la pratique peuvent être proposés de manière autonome ou en articulation avec des actions de formation ou de coaching, selon les besoins identifiés."
          liens={[
            {
              href: "/coaching/etablissements",
              label: "Coaching en établissement",
            },
            {
              href: "/formations/prevention-rps-qvct-etablissements-sante",
              label: "Formations QVCT / RPS",
            },
          ]}
        />

        {/* --- 5b. Articles du blog en lien (issue #72 : maillage retour) --- */}
        <ArticlesBlogLiesBloc targetPage="/gapp-analyse-pratiques-professionnelles" />
        {/* --- 6. CTA FINAL --- */}
        <CtaElan
          contactType="institution"
          contactSujet="GAPP – Analyse des pratiques professionnelles"
        />
      </main>
    </>
  );
}
