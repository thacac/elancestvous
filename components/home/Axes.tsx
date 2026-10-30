import Link from "next/link";
import { FC } from "react";

import { SectionBanner } from "@/components/charte";
import { buttonVariants } from "@/components/ui/button";
import {
  IconCoachingIllustration,
  IconFormationsIllustration,
  IconGappIllustration,
} from "@/components/ui/icons-pillars";

// Icône au trait du bandeau (cible), comme sur les slides de formation.
function IconTarget() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22" cy="26" r="16" />
      <circle cx="22" cy="26" r="9" />
      <circle cx="22" cy="26" r="2.5" />
      <path d="M22 26 40 8M34 8h6v6" />
    </svg>
  );
}

const Axes: FC = () => {
  return (
    <section id="axes-de-travail" className="scroll-mt-20 pb-15 bg-white">
      <SectionBanner
        title="Mes 3 Axes d'Intervention"
        subtitle="Une approche globale, avec des modalités d'intervention adaptables aux besoins des équipes."
        icon={<IconTarget />}
      />
      <div className="container wide grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-8">
        <Link
          href="/formations"
          aria-label="Découvrir les formations"
          className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconFormationsIllustration className="w-40 h-40" />
          </div>
          <div className="bg-sky p-6 flex flex-col gap-2.5 flex-1">
            <h3 className="font-display! font-extrabold! text-2xl! text-primary! m-0! max-w-none!">Formations</h3>
            <p className="text-sm leading-relaxed text-primary/90">
              Des formations sur-mesure pour prévenir l&apos;épuisement professionnel,
              mieux comprendre le stress et la charge émotionnelle, et renforcer
              les ressources individuelles et collectives.
            </p>
            <span className={`${buttonVariants({ variant: "tinted" })} mt-auto w-fit`}>
              Découvrir les formations <span aria-hidden="true" className="text-accent">→</span>
            </span>
          </div>
        </Link>

        <Link
          href="/coaching"
          aria-label="Découvrir le coaching"
          className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconCoachingIllustration className="w-40 h-40" />
          </div>
          <div className="bg-peach p-6 flex flex-col gap-2.5 flex-1">
            <h3 className="font-display! font-extrabold! text-2xl! text-primary! m-0! max-w-none!">
              Coaching d&apos;équipe ou individuel
            </h3>
            <p className="text-sm leading-relaxed text-primary/90">
              Des accompagnements de coaching, individuels ou collectifs,
              lorsqu&rsquo;un objectif précis est identifié : évolution des pratiques,
              ajustement des fonctionnements, réorganisation ou période de
              transition.
            </p>
            <span className={`${buttonVariants({ variant: "tinted" })} mt-auto w-fit`}>
              Découvrir le coaching <span aria-hidden="true" className="text-accent">→</span>
            </span>
          </div>
        </Link>

        <Link
          href="/gapp-analyse-pratiques-professionnelles"
          aria-label="Découvrir les GAPP"
          className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <div className="flex items-center justify-center h-[190px]">
            <IconGappIllustration className="w-40 h-40" />
          </div>
          <div className="bg-sky p-6 flex flex-col gap-2.5 flex-1">
            <h3 className="font-display! font-extrabold! text-2xl! text-primary! m-0! max-w-none!">
              GAPP (Groupe d&apos;analyse des pratiques professionnelles)
            </h3>
            <p className="text-sm leading-relaxed text-primary/90">
              Des espaces réguliers de réflexion collective pour prendre du recul
              sur les situations vécues, réguler la charge émotionnelle et
              soutenir les pratiques dans la durée.
            </p>
            <span className={`${buttonVariants({ variant: "tinted" })} mt-auto w-fit`}>
              Découvrir les GAPP <span aria-hidden="true" className="text-accent">→</span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Axes;
