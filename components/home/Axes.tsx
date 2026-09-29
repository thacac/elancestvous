import Link from "next/link";
import { FC } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  IconCoachingIllustration,
  IconFormationsIllustration,
  IconGappIllustration,
} from "@/components/ui/icons-pillars";

const Axes: FC = () => {
  return (
    <section
      id="axes-de-travail"
      className="pt-0 pb-15 bg-white container wide"
    >
      <div className="text-center">
        <h2>Mes 3 Axes d&apos;Intervention</h2>
        <h3>
          Une approche globale, avec des modalités d&apos;intervention adaptables aux
          besoins des équipes.
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-18">
        <Link
          href="/formations"
          aria-label="Découvrir les formations"
          className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconFormationsIllustration className="w-40 h-40" />
          </div>
          <div className="bg-pastel p-6 flex flex-col gap-2.5 flex-1">
            <h4 className="font-serif font-extrabold text-2xl text-primary">Formations</h4>
            <p className="text-sm leading-relaxed text-primary/90">
              Des formations sur-mesure pour prévenir l&apos;épuisement professionnel,
              mieux comprendre le stress et la charge émotionnelle, et renforcer
              les ressources individuelles et collectives.
            </p>
            <span className={`${buttonVariants({ variant: "tinted" })} mt-auto w-fit`}>
              Découvrir les formations <span className="text-accent">→</span>
            </span>
          </div>
        </Link>

        <Link
          href="/coaching"
          aria-label="Découvrir le coaching"
          className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconCoachingIllustration className="w-40 h-40" />
          </div>
          <div className="bg-primary p-6 flex flex-col gap-2.5 flex-1">
            <h4 className="font-serif font-extrabold text-2xl text-white">
              Coaching d&apos;équipe ou individuel
            </h4>
            <p className="text-sm leading-relaxed text-white/80">
              Des accompagnements de coaching, individuels ou collectifs,
              lorsqu&rsquo;un objectif précis est identifié : évolution des pratiques,
              ajustement des fonctionnements, réorganisation ou période de
              transition.
            </p>
            <span className={`${buttonVariants({ variant: "tintedOnDark" })} mt-auto w-fit`}>
              Découvrir le coaching <span className="text-accent">→</span>
            </span>
          </div>
        </Link>

        <Link
          href="/gapp-analyse-pratiques-professionnelles"
          aria-label="Découvrir les GAPP"
          className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconGappIllustration className="w-40 h-40" />
          </div>
          <div className="bg-logo p-6 flex flex-col gap-2.5 flex-1">
            <h4 className="font-serif font-extrabold text-2xl text-primary">
              GAPP (Groupe d&apos;analyse des pratiques professionnelles)
            </h4>
            <p className="text-sm leading-relaxed text-primary/90">
              Des espaces réguliers de réflexion collective pour prendre du recul
              sur les situations vécues, réguler la charge émotionnelle et
              soutenir les pratiques dans la durée.
            </p>
            <span className={`${buttonVariants({ variant: "tinted" })} mt-auto w-fit`}>
              Découvrir les GAPP <span className="text-accent">→</span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Axes;
