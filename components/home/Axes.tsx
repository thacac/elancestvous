import Link from "next/link";
import { FC } from "react";

interface AxesProps {}

const Axes: FC<AxesProps> = () => {
  return (
    <section id="axes-de-travail" className="py-10 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2>
            Mes 3 Axes d'Intervention
          </h2>
          <h3>
            Une approche globale, avec des modaliés d'intervention adaptables
            aux besoins des équipes.
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="group bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Formations</h3>
            <p className="text-stone-600 mb-4 text-sm leading-relaxed">
              Analyse des facteurs de risques (Gollac) et mise en place de plans
              de prévention. Sécurisez votre organisation.
            </p>
            <ul className="text-sm text-stone-500 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Audit de service
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Document Unique
              </li>
            </ul>
          </div>

          <div className="group bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
              Populaire
            </div>
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">
              Coaching d'équipe ou individuel
            </h3>
            <p className="text-stone-600 mb-4 text-sm leading-relaxed">
              Des outils de coaching (type 2) et l'analyse des "Drivers" pour
              sortir de l'épuisement et retrouver l'action.
            </p>
            <ul className="text-sm text-stone-500 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Ateliers 2h30
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Gestion des émotions
              </li>
            </ul>
          </div>

          <div className="group bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">
              GAPP (Groupe d'analyse des pratiques professionnelles)
            </h3>
            <p className="text-stone-600 mb-4 text-sm leading-relaxed">
              Communication non-violente et assertive pour apaiser les relations
              d'équipe et le dialogue avec les familles.
            </p>
            <ul className="text-sm text-stone-500 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Cohésion d'équipe
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                Gestion de conflit
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Axes;
