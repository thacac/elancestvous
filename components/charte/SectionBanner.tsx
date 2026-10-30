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

// Bandeau de section des slides de formation : vague pétrole, icône, barre
// orange, titre en Nunito et sous-titre manuscrit. Les styles globaux h1/h2/h3
// de globals.css sont hors @layer et l'emportent sur les utilitaires, d'où
// les modificateurs `!` sur le titre.
export function SectionBanner({ title, subtitle, icon, as: Heading = "h2", id, className }: SectionBannerProps) {
  return (
    <header className={cn("relative isolate text-white", className)}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <path d="M0 0H1200V44C880 52 520 98 0 104Z" className="fill-petrol" />
        <path d="M380 92C700 76 960 50 1200 44V58C960 64 720 88 380 100Z" className="fill-teal-soft" />
        <path d="M0 112C420 106 820 74 1200 56" fill="none" strokeWidth="4" className="stroke-orange" />
      </svg>
      <div className="container wide flex items-center gap-4 pt-5 pb-12 md:pb-14">
        {icon && (
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center text-white [&_svg]:size-10">
            {icon}
          </span>
        )}
        <span aria-hidden="true" className="w-1 self-stretch rounded-full bg-orange" />
        <div className="min-w-0">
          <Heading
            id={id}
            className="font-display! text-2xl! font-black! leading-tight text-white! tracking-normal! m-0! lg:text-3xl!"
          >
            {title}
          </Heading>
          {subtitle && <p className="font-hand text-base text-teal-soft md:text-lg">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
