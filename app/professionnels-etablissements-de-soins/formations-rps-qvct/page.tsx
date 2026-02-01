import Citation from "@/components/Citation";
import CtaElan from "@/components/CtaElan";

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

export default function ContactPage() {
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
        <section id="formations-planning" className="py-20 bg-primary">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <h2 className="text-3xl lg:text-5xl !text-white font-serif font-bold max-w-xl">
                Une formation pensée pour la réalité du terrain
              </h2>
              <p className="text-pastel/60 max-w-xs italic text-sm">
                Adapté aux contraintes et aux exigences du soin.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {/* Blocs à fort contraste */}
              <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
                <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">
                  01
                </span>
                <h3 className="text-2xl font-bold mb-4">Continuité</h3>
                <p className="text-pastel/70 group-hover:text-white">
                  Ateliers courts en cycle pour ne pas désorganiser les équipes.
                </p>
              </div>
              <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
                <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">
                  02
                </span>
                <h3 className="text-2xl font-bold mb-4">Assimilation</h3>
                <p className="text-pastel/70 group-hover:text-white">
                  Appropriation progressive des contenus au fil des séances.
                </p>
              </div>
              <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
                <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">
                  03
                </span>
                <h3 className="text-2xl font-bold mb-4">Mouvement</h3>
                <p className="text-pastel/70 group-hover:text-white">
                  Mise en pratique réelle entre chaque temps de rencontre.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* --- 3. PÉDAGOGIE : SECTION "RÉELLE" --- */}
        <section id="formations-pedagogie" className="py-20 bg-stone-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-primary font-serif font-bold text-3xl mb-14!">
              Une pédagogie ancrée dans le réel
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Apports théoriques accessibles",
                "Échanges collectifs",
                "Mises en situation",
                "Outils issus du coaching",
              ].map((badge, i) => (
                <div
                  key={i}
                  className="bg-white px-8 py-4 rounded-full border-2 border-primary text-primary font-bold shadow-sm hover:bg-primary hover:text-white transition cursor-default"
                >
                  {badge}
                </div>
              ))}
            </div>
            <Citation
              text="L'enjeu n'est pas de transmettre des recettes, mais de soutenir la compréhension, le recul et l'ajustement des pratiques."
              imageSrc="/coralie.png"
              imageAlt="Coach Coralie"
            />
          </div>
        </section>

        {/* --- 4. CONTENU DU CYCLE : LISTE ÉPURÉE & "KIT" --- */}
        <section id="formations-contenu" className="py-20 bg-muted/40 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="w-full md:w-1/2 lg:w-2/3">
                <h2 className="text-4xl font-serif font-extrabold text-primary mb-12">
                  Un cycle structuré & cohérent
                </h2>
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
        <section className="container py-14">
          <div className="max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-lg border border-stone-200 p-8 md:p-12 flex flex-col items-center text-center">
            <h2 className="text-primary text-3xl md:text-4xl font-extrabold mb-4 flex items-center gap-3">
              <span className="inline-block w-2 h-8 bg-accent rounded-full"></span>
              À qui s’adressent ces formations&nbsp;?
            </h2>
            <p className="mb-8 text-lg text-stone-600 max-w-2xl mx-auto">
              Ces formations s’adressent notamment&nbsp;:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  {/* Stéthoscope icon */}
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 3v7a6 6 0 0 0 12 0V3" />
                    <circle cx="6" cy="3" r="2" />
                    <circle cx="18" cy="3" r="2" />
                    <path d="M12 17v2a3 3 0 0 0 6 0v-2" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-left">
                  Aux professionnels de santé
                </span>
              </div>
              <div className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  {/* Dialogue icon */}
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-left">
                  Aux équipes exposées à une forte charge émotionnelle
                </span>
              </div>
              <div className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  {/* Manager icon */}
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-left">
                  Aux cadres et managers de proximité
                </span>
              </div>
              <div className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  {/* Building icon */}
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-left">
                  Aux établissements souhaitant agir en prévention
                </span>
              </div>
              <div className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm col-span-1 sm:col-span-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  {/* Interim/healthcare icon */}
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3v1M8 3v1" />
                  </svg>
                </span>
                <span className="font-semibold text-primary text-left">
                  Aux agences d’intérim accompagnant leurs professionnels
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- 6- Bloc Lien avec les autres accompagnements --- */}
        <section id="lien-autres-accompagnements" className="container mb-14">
          <div className="max-w-3xl mx-auto text-justify">
            <p className="text-muted text-sm md:text-md leading-relaxed">
              <span className="text-primary font-bold mr-2">Lien avec les autres accompagnements :</span>
              Selon les situations et les objectifs, la formation peut être proposée seule, ou s’inscrire dans une démarche plus globale incluant du coaching ou des groupes d’analyse de la pratique.<br />
              <span className="text-stone-500 text-sm">Ces modalités sont envisagées uniquement lorsqu’elles sont pertinentes.</span>
            </p>
          </div>
        </section>

        {/* --- 5. CTA FINAL : IMPACT MAXIMAL --- */}
        <CtaElan />
      </main>
    </>
  );
}
