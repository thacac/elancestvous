import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import FormationsDisponiblesBloc from "@/components/FormationsDisponiblesBloc";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconBuilding,
  IconHand,
  IconManager,
  IconStethoscope,
} from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

export const metadata = {
  title: "Formations accompagnement et pratiques professionnelles",
  description:
    "Formations pour outiller l'accompagnement des professionnels en établissement de santé : intégration, tutorat, montée en compétences et amélioration des pratiques.",
  keywords: [
    "formations professionnelles",
    "accompagnement",
    "pratiques professionnelles",
    "tutorat",
    "montée en compétences",
    "établissements de santé",
  ],
  alternates: {
    canonical: "/formations/accompagnement-professionnel-etablissements-sante",
  },
  openGraph: {
    title:
      "Formations accompagnement et pratiques professionnelles | Élan C'est Vous",
    description:
      "Outiller l'accompagnement des professionnels et l'évolution des pratiques en établissement de santé.",
    url: "https://elancestvous.fr/formations/accompagnement-professionnel-etablissements-sante",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

export default function AccompagnementProfessionnelPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "Formations", href: "/formations" },
            { label: "Accompagnement et pratiques professionnelles" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="formations-accompagnement" className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Accompagnement et{" "}
              <span className="text-accent">
                <strong>pratiques professionnelles</strong>
              </span>
              .
            </h1>
            <h2 className="py-5">
              Outiller l&apos;encadrement pour{" "}
              <span className="text-accent">
                <strong>accompagner</strong>
              </span>{" "}
              les professionnels et faire{" "}
              <span className="text-accent">
                <strong>évoluer</strong>
              </span>{" "}
              durablement les pratiques.
            </h2>
            <h3>
              Intégration, tutorat, montée en compétences : des repères
              concrets pour l&apos;encadrement de proximité.
            </h3>
          </div>
        </section>

        {/* --- 1b. Formations disponibles (Story 2.3 : état vide honnête, UJ-1) --- */}
        <FormationsDisponiblesBloc famille="accompagnement-professionnel-etablissements-sante" />

        {/* --- 2. ARGUMENTAIRE : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Accompagner sans improviser"
          sousTitre="Des situations fréquentes, rarement outillées formellement."
          cartes={[
            {
              numero: "01",
              titre: "Intégration",
              texte:
                "Accueillir et accompagner un nouveau professionnel, au-delà du seul parcours administratif.",
            },
            {
              numero: "02",
              titre: "Tutorat",
              texte:
                "Transmettre les pratiques du service sans que cela repose uniquement sur la bonne volonté individuelle.",
            },
            {
              numero: "03",
              titre: "Évolution des pratiques",
              texte:
                "Faire évoluer une pratique professionnelle installée, dans un cadre progressif et partagé.",
            },
          ]}
        />

        {/* --- 3. APPROCHE : BADGES --- */}
        <BadgesBloc
          titre="Une approche centrée sur les situations réelles"
          badges={[
            "Repères méthodologiques concrets",
            "Mises en situation issues du terrain",
            "Posture d'accompagnement plutôt que de contrôle",
            "Outils réutilisables au quotidien",
          ]}
          citation={
            <Citation
              text="Accompagner ne s'improvise pas : c'est une posture qui se construit, avec des repères clairs et un cadre qui protège autant celui qui accompagne que celui qui est accompagné."
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
              titre: "Aux cadres de santé et tuteurs de stage",
            },
            {
              icon: <IconStethoscope className="w-6 h-6 text-accent" />,
              titre: "Aux professionnels référents d'un nouvel arrivant",
            },
            {
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre: "Aux établissements structurant leur parcours d'intégration",
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

        {/* --- 5b. Articles du blog en lien (issue #72 : maillage retour) ---
            Famille sans pilier (Story 2.3/3.2) : ce bloc ne rend rien ici,
            aucun code spécial requis, le mécanisme reste générique. */}
        <ArticlesBlogLiesBloc targetPage="/formations/accompagnement-professionnel-etablissements-sante" />

        {/* --- 6. CTA FINAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
