import ArticulationBloc from "@/components/ArticulationBloc";
import BadgesBloc from "@/components/BadgesBloc";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";
import PublicsCiblesBloc from "@/components/PublicsCiblesBloc";
import { IconBuilding, IconHand, IconHeart, IconManager, IconStairs, IconStethoscope } from "@/components/ui/icons-publics";

export const metadata = {
  title:
    "Formations professionnelles QVCT, RPS, stress et émotions | Élan C'est Vous",
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
  openGraph: {
    title:
      "Formations professionnelles QVCT, RPS, stress et émotions | Élan C'est Vous",
    description:
      "Formations pour la gestion du stress, des émotions et la prévention de l'usure professionnelle en établissements de santé.",
    url: "https://elancestvous.fr/formations-rps-qvct",
    type: "website",
  },
};

export default function FormationsProPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* --- 1. Titre */}
        <section id="formations-professionnelles" className="py-20 container">
          <div className="text-center mb-8">
            <h1>Formations professionnelles.</h1>
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
              de l'usure professionnelle.
            </h2>
            <h3>
              QVCT, prévention des risques psycho-sociaux (RPS), stress et
              charge émotionnelle en établissements de santé.
            </h3>
          </div>
        </section>

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

        {/* --- 4. CONTENU DU CYCLE : LISTE ÉPURÉE & "KIT" --- */}
        <section id="formations-contenu" className="py-20 bg-muted/40 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="w-full md:w-1/2 lg:w-2/3">
                <div className="relative w-full flex flex-col items-center mb-12">
                  <h2 className="text-4xl font-serif font-extrabold text-primary mb-6 relative z-20">
                    Un cycle structuré & cohérent
                  </h2>
                  {/* Icône escalier stylisé en arrière-plan */}
                  <span className="absolute -left-10 -bottom-15 md:-left-10 md:-bottom-35 lg:-left-20 lg:-bottom-20 z-0 opacity-10 pointer-events-none select-none">
                    <IconStairs className="w-56 h-56 md:w-85 md:h-85 text-primary -translate-x-8 md:-translate-x-20" />
                  </span>
                </div>
                <div className="space-y-6">
                  {[
                    "Mécanismes du stress et de la charge émotionnelle",
                    "Prévention des situations fragilisantes",
                    "Identification des facteurs de stress internes et externes",
                    "Régulation émotionnelle et leviers d'ajustement",
                    "Communication et relations professionnelles",
                    "Sens du travail et valeurs professionnelles",
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

              {/* Le KIT DURABLE : Mis en boîte comme un produit de valeur */}
              <div className="w-full md:w-1/2 lg:w-1/3 bg-white/5 p-12 cursor-default border border-white/10">
                <h3 className="text-2xl font-bold mb-4">
                  Assimilation durable
                </h3>
                <h4 className="text-accent font-black text-2xl mb-4 uppercase italic">
                  Le Kit de Prévention
                </h4>
                <p className="text-primary text-lg leading-relaxed mb-6">
                  À l'issue du cycle, les participants repartent avec des
                  repères et des outils concrets, mobilisables{" "}
                  <strong>individuellement</strong> et{" "}
                  <strong>collectivement</strong>.
                </p>
                <div className="w-12 h-1 bg-primary"></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 5 -Bloc public cible (design moderne & lisible) --- */}
        <PublicsCiblesBloc
          titre="À qui s’adressent ces formations ?"
          sousTitre="Ces formations s’adressent notamment :"
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
        <ArticulationBloc textePrincipal="Selon les situations et les objectifs, la formation peut être proposée seule, ou s’inscrire dans une démarche plus globale incluant du coaching ou des groupes d’analyse de la pratique." />

        {/* --- 5. CTA FINAL : IMPACT MAXIMAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
