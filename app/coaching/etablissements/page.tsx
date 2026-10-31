import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconBuilding,
  IconHand,
  IconManager,
  IconEscalier,
} from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

export const metadata = {
  title: "Coaching individuel et collectif en établissements de santé",
  description:
    "Coaching individuel ou collectif pour les équipes et professionnels des établissements de santé. Un espace structuré de réflexion et de mise en mouvement, ancré dans la réalité du terrain.",
  keywords: [
    "coaching collectif",
    "coaching individuel",
    "établissements de santé",
    "dynamiques d'équipe",
    "coaching cadres de santé",
    "coaching managers",
    "coopération équipe",
    "accompagnement professionnel",
    "coaching à distance",
  ],
  alternates: {
    canonical: "/coaching/etablissements",
  },
  openGraph: {
    title:
      "Coaching individuel et collectif en établissements de santé | Élan C'est Vous",
    description:
      "Un accompagnement sur-mesure pour soutenir les fonctionnements d'équipe et répondre à des objectifs précis.",
    url: "https://elancestvous.fr/coaching/etablissements",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

// Slide « Le stress au travail chez les professionnels de santé : des
// repères chiffrés » (formation de Coralie). Ne pas modifier sans source.
const SOURCE_DREES = "Source : DREES, enquête TraCov2, données 2023, publication juin 2025.";
const REPERES_DREES = [
  {
    chiffre: "46\u00a0%",
    texte:
      "des professionnels de santé déclarent travailler souvent ou toujours sous pression, contre 29\u00a0% de l'ensemble des salariés.",
  },
  {
    chiffre: "50\u00a0%",
    texte:
      "estiment recevoir le respect et l'estime que mérite leur travail, contre 63\u00a0% de l'ensemble des salariés.",
  },
];

const ACCOMPAGNEMENTS = [
  {
    titre: "Coaching Collectif",
    items: [
      "soutenir les dynamiques d'équipe",
      "travailler les modes de coopération",
      "clarifier les fonctionnements et les rôles",
    ],
  },
  {
    titre: "Coaching Individuel",
    items: [
      "réguler la charge émotionnelle liée à la fonction",
      "prendre du recul sur la posture managériale",
      "clarifier des situations complexes et travailler des objectifs identifiés",
    ],
  },
];

// Icône au trait du bandeau des repères chiffrés (histogramme).
function IconChart() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 42h36" />
      <path d="M11 42V26h7v16M21 42V14h7v28M31 42V20h7v22" />
    </svg>
  );
}

export default function CoachingEtablissementsPage() {
  return (
    <>
      <div className="min-h-screen overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "Coaching", href: "/coaching" },
            { label: "Établissements" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="coaching" data-hero className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Coaching{" "}
              <span className="text-accent">
                <strong>individuel</strong>
              </span>{" "}
              ou{" "}
              <BrushUnderline className="text-accent">
                <strong>collectif</strong>
              </BrushUnderline>
              .
            </h1>
            <h2 className="py-5">
              Un espace structuré de{" "}
              <span className="text-accent">
                <strong>réflexion</strong>
              </span>{" "}
              et de{" "}
              <span className="text-accent">
                <strong>mise en mouvement</strong>
              </span>
              , au service d&apos;un objectif clairement défini.
            </h2>
            <h3>
              Issu de mon expérience du soin et de la pratique du coaching, cet
              accompagnement s&apos;inscrit dans une approche respectueuse du travail
              réel et des contraintes organisationnelles.
            </h3>
          </div>
        </section>

        {/* --- 1b. REPÈRES CHIFFRÉS DREES (Story 4.3, validé par Cédric le
            2026-10-31) : chiffres de la slide de formation, chacun avec sa
            source (NFR3 : rien d'inventé). --- */}
        <section id="reperes-chiffres" className="scroll-mt-20 bg-white pb-15">
          <SectionBanner
            title="Le stress au travail chez les professionnels de santé : des repères chiffrés"
            icon={<IconChart />}
          />
          <ul role="list" className="container wide mt-8 grid list-none gap-6 md:grid-cols-2">
            {REPERES_DREES.map((repere, i) => (
              <PastelCard
                key={repere.chiffre}
                as="li"
                tone={i % 2 === 0 ? "sky" : "peach"}
                className="flex flex-col gap-3 p-8"
              >
                <p className="font-display text-5xl font-black leading-none text-accent">
                  {repere.chiffre}
                </p>
                <p className="text-lg text-primary">{repere.texte}</p>
                <p className="mt-auto text-sm text-primary/80">{SOURCE_DREES}</p>
              </PastelCard>
            ))}
          </ul>
        </section>

        {/* --- 2. CONTEXTES : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Dans quels contextes proposer un coaching ?"
          sousTitre="Construit à partir des constats et des objectifs, sans solution préconçue."
          cartes={[
            {
              numero: "01",
              titre: "Dynamiques d'équipe",
              texte:
                "Réorganisation, ajustement des plannings, tensions relationnelles ou difficultés de coopération.",
            },
            {
              numero: "02",
              titre: "Évolution des pratiques",
              texte:
                "Changement de fonctionnement ou de cadre, évolution des pratiques professionnelles.",
            },
            {
              numero: "03",
              titre: "Transitions",
              texte:
                "Périodes de transition ou de réajustement collectif nécessitant un temps dédié de recul.",
            },
          ]}
        />

        {/* --- 3. APPROCHE : BADGES --- */}
        <BadgesBloc
          titre="Une approche respectueuse et non prescriptive"
          badges={[
            "Écoute des situations vécues",
            "Prise en compte des contraintes du soin",
            "Participation active des personnes",
            "Cadre sécurisé et confidentiel",
          ]}
          citation={
            <Citation
              text="Il ne s'agit pas d'imposer des solutions, mais de soutenir la réflexion, l'ajustement et l'autonomie, dans un cadre sécurisé et respectueux."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          }
        />

        {/* --- 4. FORMES D'ACCOMPAGNEMENT --- */}
        <section id="modalites-coaching" className="scroll-mt-20 bg-white pb-15">
          <SectionBanner title="Mes accompagnements coaching." icon={<IconEscalier />} />
          <div className="container wide mt-8 grid gap-6 lg:grid-cols-3">
            {ACCOMPAGNEMENTS.map((accompagnement, i) => (
              <PastelCard
                key={accompagnement.titre}
                as="div"
                tone={i % 2 === 0 ? "sky" : "peach"}
                className="p-8"
              >
                <h3 className="font-display! text-xl! font-black! text-accent! m-0! mb-4! max-w-none!">
                  {accompagnement.titre}
                </h3>
                <ul role="list" className="list-none space-y-3 p-0">
                  {accompagnement.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-accent" />
                      <p className="text-lg text-primary font-medium">{item}</p>
                    </li>
                  ))}
                </ul>
              </PastelCard>
            ))}

            {/* Modalités pratiques */}
            <PastelCard as="div" tone="sky" className="p-8">
              <h3 className="font-display! text-2xl! font-black! text-primary! m-0! mb-4! max-w-none!">
                Modalités pratiques
              </h3>
              <h4 className="text-accent font-black text-2xl mb-4 uppercase italic">
                Cadre sur-mesure
              </h4>
              <p className="text-primary text-lg leading-relaxed mb-6">
                Les modalités sont définies en fonction des besoins et du
                contexte : accompagnement{" "}
                <strong>individuel ou collectif</strong>, interventions{" "}
                <strong>ponctuelles ou inscrites dans la durée</strong>.
              </p>
              <p className="text-primary/80 text-base leading-relaxed mb-6">
                Les séances se déroulent en{" "}
                <strong>présentiel ou à distance</strong>. Le cadre est posé
                en amont, de manière claire et partagée.
              </p>
              <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-orange" />
            </PastelCard>
          </div>
        </section>

        {/* --- 5. PUBLIC CIBLE --- */}
        <PublicsCiblesBloc
          titre="À qui s'adresse le coaching en établissement ?"
          sousTitre="Ces accompagnements s'adressent notamment :"
          cartes={[
            {
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre:
                "Aux équipes et groupes identifiés souhaitant travailler leur coopération",
            },
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre:
                "Aux cadres de santé et managers cherchant du recul sur leur posture",
            },
            {
              icon: <IconEscalier className="w-6 h-6 text-accent" />,
              titre:
                "Aux professionnels en responsabilité traversant une transition",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre:
                "Aux établissements souhaitant soutenir leurs équipes dans leurs évolutions",
            },
          ]}
        />

        {/* --- 6. Articulation avec les autres accompagnements --- */}
        <ArticulationBloc
          textePrincipal="Selon les situations, le coaching peut être proposé de manière indépendante, en complément d'une action de formation, ou en articulation avec des groupes d'analyse de la pratique."
          texteSecondaire="Ces modalités sont envisagées au cas par cas, uniquement lorsqu'elles sont pertinentes."
          liens={[
            {
              href: "/formations/prevention-rps-qvct-etablissements-sante",
              label: "Formations QVCT / RPS",
            },
            {
              href: "/gapp-analyse-pratiques-professionnelles",
              label: "GAPP",
            },
          ]}
        />

        {/* --- 6b. Articles du blog en lien (issue #72 : maillage retour) --- */}
        <ArticlesBlogLiesBloc targetPage="/coaching/etablissements" />

        {/* --- 7. CTA FINAL --- */}
        <CtaElan contactType="institution" contactSujet="Coaching en établissement" />
      </div>
    </>
  );
}
