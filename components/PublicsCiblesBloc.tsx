import { PastelCard, SectionBanner } from "@/components/charte";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export interface PublicCibleCardProps {
  icon?: ReactNode;
  titre: string;
}

export interface PublicsCiblesBlocProps {
  titre: string;
  sousTitre?: string;
  cartes: PublicCibleCardProps[];
  /** Icône au trait du bandeau (décorative). */
  icon?: ReactNode;
  className?: string;
}

// Story 4.3 : bandeau pétrole (vrai h2), introduction en paragraphe, puis
// publics en cartes pastel alternées. L'icône (décorative) passe en blanc
// dans une pastille pétrole, quelle que soit la couleur fournie par la page.
export default function PublicsCiblesBloc({
  titre,
  sousTitre,
  cartes,
  icon,
  className = "",
}: PublicsCiblesBlocProps) {
  return (
    <section className={cn("bg-white pb-15", className)}>
      <SectionBanner title={titre} icon={icon} />
      <div className="container wide mt-8">
        {sousTitre && <p className="mb-6 text-lg text-primary/80">{sousTitre}</p>}
        <ul
          role="list"
          className={cn("grid list-none grid-cols-1 gap-4 p-0", cartes.length > 1 && "sm:grid-cols-2")}
        >
          {cartes.map((carte, i) => (
            <PastelCard
              key={i}
              as="li"
              tone={i % 2 === 0 ? "sky" : "peach"}
              className="flex items-center gap-4 p-5"
            >
              {carte.icon && (
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-petrol text-white [&_svg]:size-6 [&_svg]:text-white"
                >
                  {carte.icon}
                </span>
              )}
              <span className="font-semibold text-primary">{carte.titre}</span>
            </PastelCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
