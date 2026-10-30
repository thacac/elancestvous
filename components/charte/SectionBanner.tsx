import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface SectionBannerProps {
  title: ReactNode;
  /** Sous-titre manuscrit, rendu en paragraphe hors du titre. */
  subtitle?: ReactNode;
  /** Icône au trait (décorative), ex. une icône de icons-publics.tsx. */
  icon?: ReactNode;
  /** Niveau du titre dans la hiérarchie Hn de la page (h2 par défaut). */
  as?: "h1" | "h2" | "h3";
  /** Id posé sur le titre, pour les ancres internes (#axes-de-travail…). */
  id?: string;
  className?: string;
}

// Bandeau de section des slides de formation : aplat pétrole prolongé d'une
// vague, icône, barre
// orange, titre en Nunito et sous-titre manuscrit. Les styles globaux h1/h2/h3
// de globals.css sont hors @layer et l'emportent sur les utilitaires, d'où
// les modificateurs `!` sur le titre.
export function SectionBanner({
  title,
  subtitle,
  icon,
  as: Heading = "h2",
  id,
  className,
}: SectionBannerProps) {
  return (
    <header className={cn("text-white", className)}>
      <div className="bg-petrol">
        <div className="container wide flex items-center gap-4 pt-5 pb-3">
          {icon && (
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center text-white [&_svg]:size-10"
            >
              {icon}
            </span>
          )}
          <span
            aria-hidden="true"
            className="w-1 self-stretch rounded-full bg-orange"
          />
          <div className="min-w-0">
            <Heading
              id={id}
              className="font-display! text-2xl! font-black! leading-tight text-white! tracking-normal! m-0! lg:text-3xl!"
            >
              {title}
            </Heading>
            {subtitle && (
              <p className="font-hand text-base text-teal-soft md:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Vague sous l'aplat : le texte repose toujours sur le pétrole plein,
          quelle que soit la longueur du titre ou la largeur d'écran. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="block h-8 w-full md:h-12"
      >
        <path d="M0 0H1200V2C880 8 520 30 0 36Z" className="fill-petrol" />
        <path
          d="M380 26C700 14 960 4 1200 2V14C960 18 720 32 380 34Z"
          className="fill-cyan"
        />
        <path
          d="M0 44C420 40 820 20 1200 10"
          fill="none"
          strokeWidth="4"
          className="stroke-orange"
        />
      </svg>
    </header>
  );
}
