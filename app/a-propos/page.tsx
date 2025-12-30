import CTA from "@/components/home/CTA";
import Image from "next/image";

export default function About() {
  return (
    <section id="apropos" className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2>Mon parcours & Ma méthode</h2>
          <h3>
            Ancienne soignante, j’accompagne aujourd’hui la santé de ceux qui
            soignent.
          </h3>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative w-9/12 md:w-4/12 mb-20 md:mb-0 md:-mt-15">
            <Image
              src="/coralie.png"
              width={300}
              height={300}
              className="rounded-full w-full object-cover shadow-lg max-w-[250px] mx-auto"
              alt="Logo ÉlanC’estVous"
            />

            <div className="absolute left-0 md:-bottom-15 right-0 p-6 text-center">
              <p className="text-primary font-serif text-lg md:text-xl italic">
                "Accompagnement humain."
              </p>
            </div>
          </div>
          <div className="w-2/3">
            <div>
              <div className="prose text-stone-600 mb-8 space-y-4 text-justify">
                <p>
                  Mon parcours a débuté au cœur du soin. Cette réalité du
                  terrain, je la connais : l’urgence, la charge mentale, la
                  pression du quotidien.
                </p>
                <p>
                  <strong>
                    C’est ce qui fait aujourd’hui ma force :&nbsp;
                    <span className="text-accent font-serif font-extrabold text-2xl italic">
                      je ne parle pas de théorie, je parle de votre réalité.
                    </span>
                  </strong>
                </p>
                <p>
                  Formée au coaching et forte de mon expérience du soin, j’ai
                  construit une approche qui s’appuie sur l’écoute, la mise en
                  mouvement et des outils concrets, pour agir en prévention et
                  soutenir des changements durables.
                </p>
                <p>
                  <strong>
                    Former, accompagner, soutenir dans la durée : c’est le fil
                    conducteur de mon engagement professionnel.
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-& md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 text-center">
                  <span className="block text-2xl font-bold text-primary mb-1">
                    10+
                  </span>
                  <span className="text-xs text-stone-500 uppercase tracking-wide">
                    Années d'expérience
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 text-center">
                  <span className="block text-2xl font-bold text-primary mb-1">
                    Coach
                  </span>
                  <span className="text-xs text-stone-500 uppercase tracking-wide">
                    Certifiée d'État
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CTA />
    </section>
  );
}
