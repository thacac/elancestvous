import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import FormationsEtArticlesLiesBloc from "@/components/FormationsEtArticlesLiesBloc";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconBuilding,
  IconHand,
  IconHeart,
  IconManager,
} from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

export const metadata = {
  title: "Formations dynamique d'équipe et développement professionnel",
  description:
    "Formations pour renforcer la coopération, la cohésion et le développement professionnel des équipes en établissement de santé.",
  keywords: [
    "formations professionnelles",
    "dynamique d'équipe",
    "cohésion",
    "coopération",
    "développement professionnel",
    "établissements de santé",
  ],
  alternates: {
    canonical: "/formations/dynamique-equipe-etablissements-sante",
  },
  openGraph: {
    title:
      "Formations dynamique d'équipe et développement professionnel | Élan C'est Vous",
    description:
      "Renforcer la coopération, la cohésion et le développement professionnel des équipes en établissement de santé.",
    url: "https://elancestvous.fr/formations/dynamique-equipe-etablissements-sante",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

export default function DynamiqueEquipePage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "Formations", href: "/formations" },
            { label: "Dynamique d'équipe et développement professionnel" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="formations-dynamique-equipe" className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Dynamique d&apos;équipe et{" "}
              <span className="text-accent">
                <strong>développement professionnel</strong>
              </span>
              .
            </h1>
            <h2 className="py-5">
              Renforcer la{" "}
              <span className="text-accent">
                <strong>coopération</strong>
              </span>{" "}
              et la{" "}
              <span className="text-accent">
                <strong>cohésion</strong>
              </span>{" "}
              d&apos;une équipe, dans la durée.
            </h2>
            <h3>
              Des formations pour travailler collectivement les fonctionnements
              d&apos;équipe et soutenir le développement professionnel de
              chacun.
            </h3>
          </div>
        </section>

        {/* --- 1b. Formations disponibles (Story 2.3 : état vide honnête, UJ-1)
            + colonne latérale des articles liés (Story 3.2), quand un
            pilier ciblera cette page. Mise en page partagée par les 4 hubs
            Famille (FormationsEtArticlesLiesBloc) : ce hub n'a pas encore de
            pilier actif, donc pas de colonne pour l'instant, aucun code
            spécial requis. --- */}
        <FormationsEtArticlesLiesBloc
          famille="dynamique-equipe-etablissements-sante"
          targetPage="/formations/dynamique-equipe-etablissements-sante"
        />

        {/* --- 2. ARGUMENTAIRE : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Une équipe qui fonctionne se construit"
          sousTitre="Des dynamiques rarement figées, à retravailler dans le temps."
          cartes={[
            {
              numero: "01",
              titre: "Coopération",
              texte:
                "Clarifier les rôles et les modes de fonctionnement pour fluidifier le travail collectif.",
            },
            {
              numero: "02",
              titre: "Cohésion",
              texte:
                "Consolider un collectif de travail, notamment après une réorganisation ou un renouvellement d'équipe.",
            },
            {
              numero: "03",
              titre: "Développement",
              texte:
                "Accompagner la progression professionnelle individuelle au service de la dynamique collective.",
            },
          ]}
        />

        {/* --- 3. APPROCHE : BADGES --- */}
        <BadgesBloc
          titre="Une approche collective et concrète"
          badges={[
            "Travail à partir de situations vécues",
            "Participation active de l'équipe",
            "Outils de coopération réutilisables",
            "Cadre respectueux du fonctionnement existant",
          ]}
          citation={
            <Citation
              text="Une dynamique d'équipe se travaille collectivement, à partir de ce qui se vit réellement, jamais en plaquant un modèle théorique sur une réalité de terrain."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          }
        />

        {/* --- 4. PUBLIC CIBLE --- */}
        <PublicsCiblesBloc
          titre="À qui s'adressent ces formations ?"
          sousTitre="Ces formations s'adressent notamment :"
          cartes={[
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre: "Aux équipes souhaitant travailler leur coopération",
            },
            {
              icon: <IconHeart className="w-6 h-6 text-accent" />,
              titre: "Aux professionnels traversant une réorganisation",
            },
            {
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre: "Aux établissements souhaitant soutenir leurs équipes",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre: "Aux agences d'intérim accompagnant leurs professionnels",
            },
          ]}
        />

        {/* --- 5. Lien avec les autres accompagnements --- */}
        <ArticulationBloc
          textePrincipal="Selon les situations et les objectifs, la formation peut être proposée seule, ou s'inscrire dans une démarche plus globale incluant du coaching ou des groupes d'analyse de la pratique."
          liens={[
            {
              href: "/coaching/etablissements",
              label: "Coaching en établissement",
            },
            {
              href: "/gapp-analyse-pratiques-professionnelles",
              label: "GAPP",
            },
          ]}
        />

        {/* --- 6. CTA FINAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
