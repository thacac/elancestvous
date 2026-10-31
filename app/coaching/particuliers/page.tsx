import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import BadgesBloc from "@/components/BadgesBloc";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconHand,
  IconHeart,
  IconManager,
  IconEscalier,
} from "@/components/ui/icons-publics";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Coaching individuel pour particuliers à Toulouse et à distance",
  description:
    "Coaching individuel pour particuliers : clarifier une situation, débloquer ce qui fait obstacle et avancer vers vos objectifs. Un espace d'écoute et de réflexion, dans un cadre sécurisant et confidentiel.",
  keywords: [
    "coaching individuel",
    "particuliers",
    "coaching personnel",
    "gestion du stress",
    "charge émotionnelle",
    "transition professionnelle",
    "objectifs personnels",
    "développement personnel",
    "coaching à distance",
  ],
  alternates: {
    canonical: "/coaching/particuliers",
  },
  openGraph: {
    title: "Coaching individuel pour particuliers | Élan C'est Vous",
    description:
      "Un espace pour faire le point, prendre du recul et avancer à partir de votre situation.",
    url: "https://elancestvous.fr/coaching/particuliers",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

const PROCESSUS = [
  "Évaluation de votre situation et définition de vos objectifs",
  "Exploration des freins et identification de vos ressources",
  "Clarification de vos enjeux et de votre direction",
  "Régulation émotionnelle et leviers d'ajustement",
  "Mise en mouvement progressive, pas à pas",
  "Consolidation et ancrage des changements",
];

// Pastilles numérotées comme Steps (orange foncé, pétrole, bleu nuit) :
// blanc dessus ≥ 5.7:1.
const BADGE_TONES = ["bg-accent", "bg-petrol", "bg-primary"];

export default function CoachingParticuliersPage() {
  return (
    <>
      <div className="min-h-screen overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "Coaching", href: "/coaching" },
            { label: "Particuliers" },
          ]}
        />
        {/* --- 1. Titre */}
        <section id="coaching-individuel" data-hero className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Coaching <BrushUnderline>individuel</BrushUnderline>.
            </h1>
            <h2 className="py-5">
              Un espace pour{" "}
              <span className="text-accent">
                <strong>faire le point</strong>
              </span>
              ,{" "}
              <span className="text-accent">
                <strong>prendre du recul</strong>
              </span>{" "}
              et{" "}
              <span className="text-accent">
                <strong>avancer</strong>
              </span>{" "}
              à partir de votre situation.
            </h2>
            <h3>
              Un accompagnement pour clarifier, débloquer et avancer vers vos
              objectifs, dans un cadre sécurisant et confidentiel.
            </h3>
          </div>
        </section>

        {/* --- 2. QUAND FAIRE APPEL : CARTES CONTRASTÉES --- */}
        <CartesContrastBloc
          titre="Quand faire appel au coaching individuel ?"
          sousTitre="Le coaching intervient quand quelque chose résiste."
          cartes={[
            {
              numero: "01",
              titre: "Faire le point",
              texte:
                "Le stress ou la charge émotionnelle prennent trop de place, ou une situation devient difficile à porter seul(e).",
            },
            {
              numero: "02",
              titre: "Clarifier",
              texte:
                "Un choix ou une transition questionne. Le besoin de recul, de clarté ou d'ajustement se fait sentir.",
            },
            {
              numero: "03",
              titre: "Avancer",
              texte:
                "L'envie d'avancer autrement émerge, ou un objectif précis demande à être travaillé.",
            },
          ]}
        />

        {/* --- 3. POSTURE D'ÉCOUTE : BADGES --- */}
        <BadgesBloc
          titre="Une posture d'écoute et de co-construction"
          badges={[
            "Écoute attentive",
            "Respect de votre rythme",
            "Clarification de vos enjeux",
            "Mobilisation de vos ressources",
          ]}
          citation={
            <Citation
              text="Je n'apporte pas de solutions toutes faites. Le travail se construit ensemble, pas à pas, dans une logique d'autonomie et de responsabilisation."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          }
        />

        {/* --- 4. MODALITÉS D'ACCOMPAGNEMENT (Story 4.3 : démarche ordonnée,
            numéros décoratifs, l'ordre est porté par <ol>) --- */}
        <section id="modalites" className="scroll-mt-20 bg-white pb-15">
          <SectionBanner
            title="Un processus structuré & progressif"
            icon={<IconEscalier />}
          />
          <div className="container wide mt-8 grid gap-8 lg:grid-cols-3">
            <ol role="list" className="grid list-none gap-3 p-0 lg:col-span-2">
              {PROCESSUS.map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    "flex items-center gap-4 rounded-3xl px-5 py-4",
                    i % 2 === 0 ? "bg-sky" : "bg-peach",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-black text-white",
                      BADGE_TONES[i % BADGE_TONES.length],
                    )}
                  >
                    {i + 1}
                  </span>
                  <p className="text-lg font-semibold text-primary">{item}</p>
                </li>
              ))}
            </ol>

            {/* Cadre de l'accompagnement */}
            <PastelCard as="div" tone="peach" className="h-fit p-8">
              <h3 className="font-display! text-2xl! font-black! text-primary! m-0! mb-4! max-w-none!">
                Cadre de l&apos;accompagnement
              </h3>
              <h4 className="text-accent font-black text-2xl mb-4 uppercase italic">
                Modalités pratiques
              </h4>
              <p className="text-primary text-lg leading-relaxed mb-6">
                L&apos;accompagnement se déroule généralement sur{" "}
                <strong>environ huit séances</strong>, permettant un travail
                progressif, en profondeur, et respectueux de votre rythme.
              </p>
              <p className="text-primary/80 text-base leading-relaxed mb-6">
                Les séances se déroulent <strong>à distance</strong>, dans un
                cadre <strong>sécurisé et confidentiel</strong>.
              </p>
              <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-orange" />
            </PastelCard>
          </div>
        </section>

        {/* --- 5. PUBLIC CIBLE --- */}
        <PublicsCiblesBloc
          titre="À qui s'adresse le coaching individuel ?"
          sousTitre="Cet accompagnement s'adresse notamment :"
          cartes={[
            {
              icon: <IconHeart className="w-6 h-6 text-accent" />,
              titre:
                "À toute personne ressentant un stress ou une charge émotionnelle trop lourde",
            },
            {
              icon: <IconEscalier className="w-6 h-6 text-accent" />,
              titre:
                "À ceux qui traversent une transition ou font face à un choix difficile",
            },
            {
              icon: <IconManager className="w-6 h-6 text-accent" />,
              titre:
                "À ceux qui souhaitent prendre du recul et retrouver de la clarté",
            },
            {
              icon: <IconHand className="w-6 h-6 text-accent" />,
              titre:
                "À ceux qui veulent avancer autrement et travailler un objectif précis",
            },
          ]}
        />

        {/* --- 6. Lien avec les autres accompagnements --- */}
        <p className="container text-center text-primary/80 text-sm mb-20">
          Un premier échange permet de vérifier ensemble si le coaching individuel est adapté à votre situation.
        </p>

        {/* --- 6b. Articles du blog en lien (issue #72 : maillage retour) --- */}
        <ArticlesBlogLiesBloc targetPage="/coaching/particuliers" />

        {/* --- 7. CTA FINAL --- */}
        <CtaElan contactType="particulier" contactSujet="Coaching individuel" />
      </div>
    </>
  );
}
