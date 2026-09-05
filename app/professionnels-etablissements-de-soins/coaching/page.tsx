import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import {
  IconBuilding,
  IconHand,
  IconManager,
  IconStairs,
} from "@/components/ui/icons-publics";

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
    canonical: "/professionnels-etablissements-de-soins/coaching",
  },
  openGraph: {
    title:
      "Coaching individuel et collectif en établissements de santé | Élan C'est Vous",
    description:
      "Un accompagnement sur-mesure pour soutenir les fonctionnements d'équipe et répondre à des objectifs précis.",
    url: "https://elancestvous.fr/professionnels-etablissements-de-soins/coaching",
    type: "website",
  },
};

export default function CoachingPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* --- 1. Titre */}
        <section id="coaching" className="py-20 container">
          <div className="text-center mb-8">
            <h1>
              Coaching{" "}
              <span className="text-accent">
                <strong>individuel</strong>
              </span>{" "}
              ou{" "}
              <span className="text-accent">
                <strong>collectif</strong>
              </span>
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
              , au service d'un objectif clairement défini.
            </h2>
            <h3>
              Issu de mon expérience du soin et de la pratique du coaching, cet
              accompagnement s'inscrit dans une approche respectueuse du travail
              réel et des contraintes organisationnelles.
            </h3>
          </div>
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
        <section id="modalites-coaching" className="py-20 bg-muted/40 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="w-full md:w-1/2 lg:w-2/3">
                <div className="relative w-full flex flex-col items-center mb-12">
                  <h2 className="text-4xl font-serif font-extrabold text-primary mb-6 relative z-20">
                    Mes accompagnements coaching.
                  </h2>
                  <span className="absolute -left-10 -bottom-15 md:-left-10 md:-bottom-35 lg:-left-20 lg:-bottom-20 z-0 opacity-10 pointer-events-none select-none">
                    <IconStairs className="w-56 h-56 md:w-85 md:h-85 text-primary -translate-x-8 md:-translate-x-20" />
                  </span>
                </div>
                <div className="space-y-6">
                  <h3 className="text-accent! text-xl!">Coaching Collectif</h3>
                  {[
                    "soutenir les dynamiques d'équipe",
                    "travailler les modes de coopération",
                    "clarifier les fonctionnements et les rôles",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="h-2 w-2 rounded-full bg-accent group-hover:w-8 transition-all"></div>
                      <p className="text-lg text-primary/80 font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                  <h3 className="text-accent! text-xl!">Coaching Individuel</h3>
                  {[
                    "réguler la charge émotionnelle liée à la fonction",
                    "prendre du recul sur la posture managériale",
                    "clarifier des situations complexes et travailler des objectifs identifiés",
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

              {/* Modalités pratiques */}
              <div className="w-full md:w-1/2 lg:w-1/3 bg-white/5 p-12 cursor-default border border-white/10">
                <h3 className="text-2xl font-bold mb-4">
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
                <p className="text-primary/70 text-base leading-relaxed mb-6">
                  Les séances se déroulent en{" "}
                  <strong>présentiel ou à distance</strong>. Le cadre est posé
                  en amont, de manière claire et partagée.
                </p>
                <div className="w-12 h-1 bg-primary"></div>
              </div>
            </div>
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
              icon: <IconStairs className="w-6 h-6 text-accent" />,
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
              href: "/professionnels-etablissements-de-soins/formations-rps-qvct",
              label: "Formations QVCT / RPS",
            },
            {
              href: "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
              label: "GAPP",
            },
          ]}
        />

        {/* --- 7. CTA FINAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
