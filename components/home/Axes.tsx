import { Button } from "@headlessui/react";
import Link from "next/link";
import { FC } from "react";

interface AxesProps {}

const Axes: FC<AxesProps> = () => {
  return (
    <section id="axes-de-travail" className="pt-0 pb-15 bg-white container wide">
      <div className="text-center">
        <h2>Mes 3 Axes d'Intervention</h2>
        <h3>
          Une approche globale, avec des modaliés d'intervention adaptables aux
          besoins des équipes.
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-18">
        <div className="group bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
            Populaire
          </div>{" "}
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
            Des formations sur-mesure pour prévenir l'épuisement professionnel,
            mieux comprendre le stress et la charge émotionnelle, et renforcer
            les ressources individuelles et collectives.
          </p>
        </div>

        <div className="group bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300 relative overflow-hidden">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="8" cy="10" r="3" strokeWidth="2" />
              <circle cx="16" cy="10" r="3" strokeWidth="2" />
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2 20c0-2.5 3-4.5 6-4.5s6 2 6 4.5M10 20c0-2.5 3-4.5 6-4.5s6 2 6 4.5"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-dark mb-3">
            Coaching d'équipe ou individuel
          </h3>
          <p className="text-stone-600 mb-4 text-sm leading-relaxed">
            Des accompagnements de coaching, individuels ou collectifs,
            lorsqu’un objectif précis est identifié : évolution des pratiques,
            ajustement des fonctionnements, réorganisation ou période de
            transition.
          </p>
          <Button
            href="/contact"
            className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition"
          >
            Me contacter
          </Button>
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
            Des espaces réguliers de réflexion collective pour prendre du recul
            sur les situations vécues, réguler la charge émotionnelle et
            soutenir les pratiques dans la durée.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Axes;
