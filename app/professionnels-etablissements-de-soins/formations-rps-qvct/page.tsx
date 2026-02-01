export default function ContactPage() {
  return (
    <><main className="min-h-screen overflow-hidden">
      {/* --- 1. HERO SECTION : IMPACT VISUEL --- */}
      {/* Utilisation du Pastel (#d1faf9) en fond pour la douceur, avec du Bleu Nuit pour le texte */}
      <section className="relative pt-24 pb-32 bg-pastel">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-primary font-serif font-extrabold text-5xl lg:text-7xl leading-tight mb-6">
              Soutenir <span className="text-accent underline decoration-4 underline-offset-8 italic">durablement</span> vos équipes.
            </h1>

            <div className="flex flex-col md:flex-row gap-8 items-start mt-12">
              {/* Vos titres actuels intégrés en colonne latérale */}
              <div className="w-full md:w-1/2">
                <h2 className="text-primary text-2xl font-bold leading-snug">
                  Gestion du stress, des émotions et prévention de l'usure professionnelle.
                </h2>
                <p className="text-primary/70 mt-4 font-medium italic">
                  QVCT, RPS et charge émotionnelle en santé.
                </p>
              </div>

              <div className="w-full md:w-1/2 bg-white/60 backdrop-blur-md p-6 rounded-2xl border-l-8 border-accent shadow-xl">
                <p className="text-primary leading-relaxed">
                  Issues de mon expérience de <strong>soignante</strong> et de ma pratique du <strong>coaching</strong>, ces formations abordent les réalités concrètes du terrain.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <button className="bg-accent text-white px-10 py-5 rounded-full font-black text-lg shadow-[0_10px_0_0_#112e40] hover:shadow-none hover:translate-y-2 transition-all uppercase tracking-widest">
                Demander un devis
              </button>
            </div>
          </div>
        </div>
        {/* Décoration abstraite pour l'élan */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
      </section>

      {/* --- 2. ARGUMENTAIRE "PLANNING" : CARTES CONTRASTÉES --- */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-3xl lg:text-5xl font-serif font-bold max-w-xl">
              Une formation pensée pour la réalité des plannings
            </h2>
            <p className="text-pastel/60 max-w-xs italic text-sm">
              Adapté aux contraintes et aux exigences du soin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {/* Blocs à fort contraste */}
            <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
              <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">01</span>
              <h3 className="text-2xl font-bold mb-4">Continuité</h3>
              <p className="text-pastel/70 group-hover:text-white">Ateliers courts en cycle pour ne pas désorganiser les équipes.</p>
            </div>
            <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
              <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">02</span>
              <h3 className="text-2xl font-bold mb-4">Assimilation</h3>
              <p className="text-pastel/70 group-hover:text-white">Appropriation progressive des contenus au fil des séances.</p>
            </div>
            <div className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10">
              <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">03</span>
              <h3 className="text-2xl font-bold mb-4">Mouvement</h3>
              <p className="text-pastel/70 group-hover:text-white">Mise en pratique réelle entre chaque temps de rencontre.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. CONTENU DU CYCLE : LISTE ÉPURÉE & "KIT" --- */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-serif font-extrabold text-primary mb-12">Un cycle structuré & cohérent</h2>
              <div className="space-y-6">
                {[
                  "Mécanismes du stress et de la charge émotionnelle",
                  "Prévention des situations fragilisantes",
                  "Identification des facteurs de stress internes et externes",
                  "Régulation émotionnelle et leviers d'ajustement",
                  "Communication et relations professionnelles",
                  "Sens du travail et valeurs professionnelles"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="h-2 w-2 rounded-full bg-accent group-hover:w-8 transition-all"></div>
                    <p className="text-lg text-primary/80 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Le KIT DURABLE : Mis en boîte comme un produit de valeur */}
            <div className="lg:w-1/2">
              <div className="sticky top-32 bg-pastel p-10 rounded-3xl border-2 border-primary shadow-[15px_15px_0_0_#112e40]">
                <h4 className="text-accent font-black text-2xl mb-4 uppercase italic">Le Kit de Prévention Durable</h4>
                <p className="text-primary text-lg leading-relaxed mb-6">
                  À l'issue du cycle, les participants repartent avec des repères et des outils concrets, mobilisables <strong>individuellement</strong> et <strong>collectivement</strong>.
                </p>
                <div className="w-12 h-1 bg-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. PÉDAGOGIE : SECTION "RÉELLE" --- */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-primary font-serif font-bold text-3xl mb-16">Une pédagogie ancrée dans le réel</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {["Apports théoriques accessibles", "Échanges collectifs", "Mises en situation", "Outils de coaching"].map((badge, i) => (
              <div key={i} className="bg-white px-8 py-4 rounded-full border-2 border-primary text-primary font-bold shadow-sm hover:bg-primary hover:text-white transition cursor-default">
                {badge}
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-2xl mx-auto text-muted text-lg italic">
            "L'enjeu n'est pas de transmettre des recettes, mais de soutenir la compréhension, le recul et l'ajustement des pratiques."
          </p>
        </div>
      </section>

      {/* --- 5. CTA FINAL : IMPACT MAXIMAL --- */}
      <section className="py-32 bg-accent relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-white font-serif font-black text-5xl lg:text-7xl mb-12">
            Prêt à mettre <br />vos équipes en mouvement ?
          </h2>
          <button className="bg-primary text-white px-16 py-6 rounded-full font-black text-xl hover:scale-110 transition shadow-2xl uppercase tracking-tighter">
            Prendre contact
          </button>
          <p className="text-white/80 mt-8 font-medium">Premier échange pour comprendre votre contexte.</p>
        </div>
        {/* Motif en arrière-plan */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[20vw] font-black text-white select-none">
          ELAN
        </div>
      </section>
    </main><main className="min-h-screen overflow-hidden">
        {/* --- 1. HERO SECTION : IMPACT VISUEL --- */}
        {/* Utilisation du Pastel (#d1faf9) en fond pour la douceur, avec du Bleu Nuit pour le texte */}
        <section className="relative pt-24 pb-32 bg-pastel">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-primary font-serif font-extrabold text-5xl lg:text-7xl leading-tight mb-6">
                Soutenir <span className="text-accent underline decoration-4 underline-offset-8 italic">durablement</span> vos équipes.
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-start mt-12">
                {/* Vos titres actuels intégrés en colonne latérale */}
                <div className="w-full md:w-1/2">
                  <h2 className="text-primary text-2xl font-bold leading-snug">
                    Gestion du stress, des émotions et prévention de l'usure professionnelle.
                  </h2>
                  <p className="text-primary/70 mt-4 font-medium italic">
                    QVCT, RPS et charge émotionnelle en santé.
                  </p>
                </div>

                <div className="w-full md:w-1/2 bg-white/60 backdrop-blur-md p-6 rounded-2xl border-l-8 border-accent shadow-xl">
                  <p className="text-primary leading-relaxed">
                    Issues de mon expérience de <strong>soignante</strong> et de ma pratique du <strong>coaching</strong>, ces formations abordent les réalités concrètes du terrain.
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <button className="bg-accent text-white px-10 py-5 rounded-full font-black text-lg shadow-[0_10px_0_0_#112e40] hover:shadow-none hover:translate-y-2 transition-all uppercase tracking-widest">
                  Demander un devis
                </button>
              </div>
            </div>
          </div>
          {/* Décoration abstraite pour l'élan */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        </section>

ya
        {/* --- 4. PÉDAGOGIE : SECTION "RÉELLE" --- */}
        <section className="py-24 bg-stone-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-primary font-serif font-bold text-3xl mb-16">Une pédagogie ancrée dans le réel</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {["Apports théoriques accessibles", "Échanges collectifs", "Mises en situation", "Outils de coaching"].map((badge, i) => (
                <div key={i} className="bg-white px-8 py-4 rounded-full border-2 border-primary text-primary font-bold shadow-sm hover:bg-primary hover:text-white transition cursor-default">
                  {badge}
                </div>
              ))}
            </div>
            <p className="mt-12 max-w-2xl mx-auto text-muted text-lg italic">
              "L'enjeu n'est pas de transmettre des recettes, mais de soutenir la compréhension, le recul et l'ajustement des pratiques."
            </p>
          </div>
        </section>

        {/* --- 5. CTA FINAL : IMPACT MAXIMAL --- */}
        <section className="py-32 bg-accent relative overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-white font-serif font-black text-5xl lg:text-7xl mb-12">
              Prêt à mettre <br />vos équipes en mouvement ?
            </h2>
            <button className="bg-primary text-white px-16 py-6 rounded-full font-black text-xl hover:scale-110 transition shadow-2xl uppercase tracking-tighter">
              Prendre contact
            </button>
            <p className="text-white/80 mt-8 font-medium">Premier échange pour comprendre votre contexte.</p>
          </div>
          {/* Motif en arrière-plan */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[20vw] font-black text-white select-none">
            ELAN
          </div>
        </section>
      </main></> 
);
}
