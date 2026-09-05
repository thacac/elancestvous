import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconHand,
  IconHeart,
  IconManager,
  IconStairs,
} from "@/components/ui/icons-publics";

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
    canonical: "/particuliers/coaching-individuel",
  },
  openGraph: {
    title: "Coaching individuel pour particuliers | Élan C'est Vous",
    description:
      "Un espace pour faire le point, prendre du recul et avancer à partir de votre situation.",
    url: "https://elancestvous.fr/particuliers/coaching-individuel",
    type: "website",
  },
};

export default function ParticuliersPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* --- 1. Titre */}
        <section id="coaching-individuel" className="py-20 container">
          <div className="text-center mb-8">
            <h1>Coaching individuel.</h1>
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

        {/* --- 4. MODALITÉS D'ACCOMPAGNEMENT --- */}
        <section id="modalites" className="py-20 bg-muted/40 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="w-full md:w-1/2 lg:w-2/3">
                <div className="relative w-full flex flex-col items-center mb-12">
                  <h2 className="text-4xl font-serif font-extrabold text-primary mb-6 relative z-20">
                    Un processus structuré & progressif
                  </h2>
                  <span className="absolute -left-10 -bottom-15 md:-left-10 md:-bottom-35 lg:-left-20 lg:-bottom-20 z-0 opacity-10 pointer-events-none select-none">
                    <IconStairs className="w-56 h-56 md:w-85 md:h-85 text-primary -translate-x-8 md:-translate-x-20" />
                  </span>
                </div>
                <div className="space-y-6">
                  {[
                    "Évaluation de votre situation et définition de vos objectifs",
                    "Exploration des freins et identification de vos ressources",
                    "Clarification de vos enjeux et de votre direction",
                    "Régulation émotionnelle et leviers d'ajustement",
                    "Mise en mouvement progressive, pas à pas",
                    "Consolidation et ancrage des changements",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="h-2 w-2 rounded-full bg-accent group-hover:w-8 transition-all"></div>
                      <p className="text-lg text-primary/80 font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cadre de l'accompagnement */}
              <div className="w-full md:w-1/2 lg:w-1/3 bg-white/5 p-12 cursor-default border border-white/10">
                <h3 className="text-2xl font-bold mb-4">
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
                <p className="text-primary/70 text-base leading-relaxed mb-6">
                  Les séances se déroulent <strong>à distance</strong>, dans un
                  cadre <strong>sécurisé et confidentiel</strong>.
                </p>
                <div className="w-12 h-1 bg-primary"></div>
              </div>
            </div>
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
              icon: <IconStairs className="w-6 h-6 text-accent" />,
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
        <p className="text-center text-stone-500 text-sm mb-20">
          Un premier échange permet de vérifier ensemble si le coaching individuel est adapté à votre situation.
        </p>

        {/* --- 7. CTA FINAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
