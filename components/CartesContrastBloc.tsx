import { PastelCard, SectionBanner } from "@/components/charte";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export interface CarteContrastProps {
  numero?: string;
  titre: string;
  texte: string;
}

export interface CartesContrastBlocProps {
  titre: string;
  sousTitre?: string;
  cartes: CarteContrastProps[];
  /** Icône au trait du bandeau (décorative). */
  icon?: ReactNode;
  className?: string;
}

// Classes écrites en entier : Tailwind ne détecte pas `md:grid-cols-${n}`.
const GRID_COLS: Record<number, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

// Story 4.3 : bandeau pétrole (vrai h2), puis cartes pastel ciel / pêche en
// alternance. Numéro en orange foncé `accent` (≥ 5:1 sur les deux pastels),
// texte en bleu nuit. Les styles globaux h2/h3 (globals.css) sont hors
// @layer, d'où les modificateurs `!` sur le titre de carte.
export default function CartesContrastBloc({
  titre,
  sousTitre,
  cartes,
  icon,
  className = "",
}: CartesContrastBlocProps) {
  return (
    <section className={cn("bg-white pb-15", className)}>
      <SectionBanner title={titre} subtitle={sousTitre} icon={icon} />
      <div className="container wide mt-8">
        <ul
          role="list"
          className={cn(
            "grid list-none grid-cols-1 gap-6 p-0",
            GRID_COLS[cartes.length] ?? "md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {cartes.map((carte, i) => (
            <PastelCard
              key={i}
              as="li"
              tone={i % 2 === 0 ? "sky" : "peach"}
              className="flex flex-col gap-3 p-8"
            >
              {carte.numero && (
                <span className="font-display text-4xl font-black leading-none text-accent">
                  {carte.numero}
                </span>
              )}
              <h3 className="font-display! text-xl! font-black! text-primary! m-0! max-w-none! lg:text-2xl!">
                {carte.titre}
              </h3>
              <p className="leading-relaxed text-primary/80">{carte.texte}</p>
            </PastelCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
