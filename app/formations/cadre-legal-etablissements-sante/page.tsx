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
import { getRelatedArticleLinks } from "@/lib/relatedArticles";

const TARGET_PAGE = "/formations/cadre-legal-etablissements-sante";

export const metadata = {
  title: "Formations cadre légal, droits et éthique en établissements de santé",
  description:
    "Formations pour sécuriser les obligations légales des établissements de santé : DUERP, obligation de sécurité, responsabilités de l'encadrement et éthique professionnelle.",
  keywords: [
    "formations professionnelles",
    "cadre légal",
    "obligation de sécurité",
    "DUERP",
    "responsabilité",
    "éthique professionnelle",
    "établissements de santé",
    "droits",
  ],
  alternates: {
    canonical: "/formations/cadre-legal-etablissements-sante",
  },
  openGraph: {
    title:
      "Formations cadre légal, droits et éthique en établissements de santé | Élan C'est Vous",
    description:
      "Sécuriser les obligations légales des établissements de santé et outiller l'encadrement sur ses responsabilités.",
    url: "https://elancestvous.fr/formations/cadre-legal-etablissements-sante",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

export default function CadreLegalPage() {
  const articlesLies = getRelatedArticleLinks(TARGET_PAGE);
  const hasRelatedArticles = articlesLies.length > 0;

  return (
    <>
      <main className="min-h-screen overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "Formations", href: "/formations" },
            { label: "Cadre légal, droits et éthique" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="formations-cadre-legal" className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Cadre légal,{" "}
              <span className="text-accent">
                <strong>droits</strong>
              </span>{" "}
              et{" "}
              <span className="text-accent">
                <strong>éthique</strong>
              </span>
              .
            </h1>
            <h2 className="py-5">
              Sécuriser les{" "}
              <span className="text-accent">
                <strong>obligations légales</strong>
              </span>{" "}
              de l&apos;établissement et outiller l&apos;encadrement sur ses{" "}
              <span className="text-accent">
                <strong>responsabilités</strong>
              </span>
              .
            </h2>
            <h3>
              Un cadre juridique clarifié, pour agir avant que le risque ne
              devienne un contentieux.
            </h3>
          </div>
        </section>

        {/* --- 1b. Formations disponibles (Story 2.2 : avant tout contenu de
            réassurance) + colonne latérale sticky des articles liés (Story
            3.2), quand au moins un article cible le pilier F. --- */}
        <div
          className={
            hasRelatedArticles
              ? "container py-14 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start"
              : "container py-14"
          }
        >
          <div>
            <FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" bare />
          </div>
          <ArticlesBlogLiesBloc targetPage={TARGET_PAGE} variant="sidebar" liens={articlesLies} />
        </div>

        {/* --- 2. ARGUMENTAIRE : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Un cadre légal exigeant, rarement outillé au quotidien"
          sousTitre="Des obligations connues sur le papier, plus difficiles à tenir sur le terrain."
          cartes={[
            {
              numero: "01",
              titre: "Obligation de sécurité",
              texte:
                "L'employeur doit protéger la santé physique et mentale de ses salariés — une obligation de résultat, pas seulement de moyens.",
            },
            {
              numero: "02",
              titre: "DUERP à jour",
              texte:
                "Un document unique d'évaluation des risques trop souvent formel, difficile à transformer en plan d'action réel.",
            },
            {
              numero: "03",
              titre: "Responsabilités engagées",
              texte:
                "Direction, encadrement et CSE : des rôles et des responsabilités à distinguer clairement en cas de signalement.",
            },
          ]}
        />

        {/* --- 3. APPROCHE : BADGES --- */}
        <BadgesBloc
          titre="Une approche juridique rendue opérationnelle"
          badges={[
            "Cadre légal expliqué simplement",
            "Méthode DUERP applicable",
            "Repères pour l'encadrement",
            "Signaux d'alerte à tracer",
          ]}
          citation={
            <Citation
              text="Connaître le cadre légal ne suffit pas : encore faut-il savoir le traduire en pratiques quotidiennes, compréhensibles par toute la ligne managériale."
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
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre: "À la direction, responsable de l'obligation de sécurité",
            },
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre: "À l'encadrement, en première ligne face aux signaux d'alerte",
            },
            {
              icon: <IconStethoscope className="w-6 h-6 text-accent" />,
              titre: "Aux référents qualité et juridique de l'établissement",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre: "Aux membres du CSE, associés à la démarche de prévention",
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
