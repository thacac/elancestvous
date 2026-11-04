import { Chip, SectionBanner } from "@/components/charte";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export interface BadgesBlocProps {
  titre: string;
  badges: string[];
  citation?: ReactNode;
  /** Icône au trait du bandeau (décorative). */
  icon?: ReactNode;
  className?: string;
}

// Story 4.3 : bandeau pétrole (vrai h2) puis pastilles de la charte, simples
// étiquettes non cliquables, pétrole et orange foncé en alternance (blanc
// dessus 8.4:1 et 5.7:1).
export default function BadgesBloc({
  titre,
  badges,
  citation,
  icon,
  className = "",
}: BadgesBlocProps) {
  return (
    <section className={cn("bg-white pb-15", className)}>
      <SectionBanner title={titre} icon={icon} />
      <div className="container wide mt-8 flex flex-col items-center gap-10">
        <ul role="list" className="flex list-none flex-wrap justify-center gap-3 p-0">
          {badges.map((badge, i) => (
            <li key={i}>
              <Chip tone={i % 2 === 0 ? "petrol" : "accent"} className="px-5 py-2">
                {badge}
              </Chip>
            </li>
          ))}
        </ul>
        {citation}
      </div>
    </section>
  );
}
