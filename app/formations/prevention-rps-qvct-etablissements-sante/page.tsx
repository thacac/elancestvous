import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import { PastelCard, SectionBanner } from "@/components/charte";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import FormationsEtArticlesLiesBloc from "@/components/FormationsEtArticlesLiesBloc";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import { IconBuilding, IconEscalier, IconHand, IconHeart, IconManager, IconStethoscope } from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

// Thèmes du cycle (texte inchangé, Story 4.4 : simple déplacement en
// constante pour la carte ciel).
const THEMES_DU_CYCLE = [
  "Mécanismes du stress et de la charge émotionnelle",
  "Prévention des situations fragilisantes",
  "Identification des facteurs de stress internes et externes",
  "Régulation émotionnelle et leviers d'ajustement",
  "Communication et relations professionnelles",
  "Sens du travail et valeurs professionnelles",
];

const TARGET_PAGE = "/formations/prevention-rps-qvct-etablissements-sante";

export const metadata = {
  title: "Formations QVCT, RPS, gestion du stress et des émotions",
  description:
    "Formations professionnelles pour la gestion du stress, des émotions et la prévention de l'usure professionnelle en établissements de santé. QVCT, prévention des risques psycho-sociaux (RPS), ateliers pratiques et pédagogie adaptée au terrain.",
  keywords: [
    "formations professionnelles",
    "QVCT",
    "RPS",
    "gestion du stress",
    "gestion des émotions",
    "prévention usure professionnelle",
    "établissements de santé",
    "coaching",
    "pédagogie",
    "kit de prévention",
  ],
  alternates: {
    canonical: "/formations/prevention-rps-qvct-etablissements-sante",
  },
  openGraph: {
    title:
      "Formations professionnelles QVCT, RPS, stress et émotions | Élan C'est Vous",
    description:
      "Formations pour la gestion du stress, des émotions et la prévention de l'usure professionnelle en établissements de santé.",
    url: "https://elancestvous.fr/formations/prevention-rps-qvct-etablissements-sante",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

export default function PreventionRpsQvctPage() {
  return (
    <>
      {/* Story 4.4 : le layout fournit déjà <main> (un seul repère principal).
          overflow-x-clip plutôt qu'overflow-hidden, qui neutralisait le
          sticky de la colonne « Pour aller plus loin ». */}
      <div className="min-h-screen overflow-x-clip">
        <Breadcrumbs
          items={[
            { label: "Formations", href: "/formations" },
            { label: "Prévention des RPS et QVCT" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="formations-professionnelles" data-hero className="py-20 container">
          <div className="text-center mb-8">
            <h1 className="break-words hyphens-auto">Formations professionnelles.</h1>
            <h2 className="py-5 ">
              Gestion du{" "}
              <span className="text-accent">
                <strong>stress</strong>
              </span>
              , des{" "}
              <span className="text-accent">
                <strong>émotions</strong>
              </span>{" "}
              et{" "}
              <span className="text-accent">
                <strong>prévention</strong>
              </span>{" "}
              de l&apos;usure professionnelle.
            </h2>
            <h3>
              QVCT, prévention des risques psycho-sociaux (RPS), stress et
              charge émotionnelle en établissements de santé.
            </h3>
          </div>
        </section>

        {/* --- 1b. Formations disponibles (Story 2.2 : avant tout contenu de
            réassurance) + colonne latérale sticky des articles liés (Story
            3.2), quand au moins un article cible le pilier C retargeté. Mise
            en page partagée par les 4 hubs Famille
            (FormationsEtArticlesLiesBloc). --- */}
        <FormationsEtArticlesLiesBloc
          famille="prevention-rps-qvct-etablissements-sante"
          targetPage={TARGET_PAGE}
        />

        {/* --- 2. ARGUMENTAIRE "PLANNING" : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Une formation pensée pour la réalité du terrain"
          sousTitre="Adapté aux contraintes et aux exigences du soin."
          cartes={[
            {
              numero: "01",
              titre: "Continuité",
              texte:
                "Ateliers courts en cycle pour ne pas désorganiser les équipes.",
            },
            {
              numero: "02",
              titre: "Assimilation",
              texte:
                "Appropriation progressive des contenus au fil des séances.",
            },
            {
              numero: "03",
              titre: "Mouvement",
              texte: "Mise en pratique réelle entre chaque temps de rencontre.",
            },
          ]}
        />
        {/* --- 3. PÉDAGOGIE : SECTION "RÉELLE" --- */}
        <BadgesBloc
          titre="Une pédagogie ancrée dans le réel"
          badges={[
            "Apports théoriques accessibles",
            "Échanges collectifs",
            "Mises en situation",
            "Outils issus du coaching",
          ]}
          citation={
            <Citation
              text="L'enjeu n'est pas de transmettre des recettes, mais de soutenir la compréhension, le recul et l'ajustement des pratiques."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          }
        />

        {/* --- 4. CONTENU DU CYCLE (Story 4.4) : bandeau pétrole, thèmes dans
            une carte ciel, kit dans une carte pêche (modèle de la section
            « Mes accompagnements coaching » de /coaching/etablissements). --- */}
        <section id="formations-contenu" className="scroll-mt-20 bg-white pb-15">
          <SectionBanner title="Un cycle structuré & cohérent" icon={<IconEscalier />} />
          <div className="container wide mt-8 grid gap-6 lg:grid-cols-3">
            <PastelCard as="div" tone="sky" className="p-8 lg:col-span-2">
              <ul role="list" className="list-none space-y-4 p-0">
                {THEMES_DU_CYCLE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-accent" />
                    <p className="text-lg text-primary font-medium">{item}</p>
                  </li>
                ))}
              </ul>
            </PastelCard>

            {/* Le kit durable */}
            <PastelCard as="div" tone="peach" className="p-8">
              <h3 className="font-display! text-2xl! font-black! text-primary! m-0! mb-4! max-w-none!">
                Assimilation durable
              </h3>
              <h4 className="text-accent font-black text-2xl mb-4 uppercase italic">
                Le Kit de Prévention
              </h4>
              <p className="text-primary text-lg leading-relaxed mb-6">
                À l&apos;issue du cycle, les participants repartent avec des
                repères et des outils concrets, mobilisables{" "}
                <strong>individuellement</strong> et{" "}
                <strong>collectivement</strong>.
              </p>
              <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-orange" />
            </PastelCard>
          </div>
        </section>

        {/* --- 5 -Bloc public cible (design moderne & lisible) --- */}
        <PublicsCiblesBloc
          titre="À qui s’adressent ces formations ?"
          sousTitre="Ces formations s’adressent notamment :"
          cartes={[
            {
              icon: <IconStethoscope className="w-6 h-6 text-accent" />,
              titre: "Aux professionnels de santé",
            },
            {
              icon: <IconHeart className="w-6 h-6 text-accent" />,
              titre: "Aux équipes exposées à une forte charge émotionnelle",
            },
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre: "Aux cadres et managers de proximité",
            },
            {
              icon: <IconBuilding className="w-6 h-6 text-accent" />,
              titre: "Aux établissements souhaitant agir en prévention",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre: "Aux agences d’intérim accompagnant leurs professionnels",
            },
          ]}
        />

        {/* --- 6- Bloc Lien avec les autres accompagnements --- */}
        <ArticulationBloc
          textePrincipal="Selon les situations et les objectifs, la formation peut être proposée seule, ou s’inscrire dans une démarche plus globale incluant du coaching ou des groupes d’analyse de la pratique."
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

        {/* --- 5. CTA FINAL : IMPACT MAXIMAL --- */}
        <CtaElan
          contactType="institution"
          contactSujet="Formations « Prévention des RPS et QVCT »"
        />
      </div>
    </>
  );
}
