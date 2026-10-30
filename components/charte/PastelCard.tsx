import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type PastelTone = "sky" | "peach";

// Classes complètes (et non construites) pour que Tailwind les détecte.
const CARD_TONES: Record<PastelTone, string> = {
  sky: "bg-sky",
  peach: "bg-peach",
};

interface PastelCardProps {
  tone: PastelTone;
  as?: "article" | "div" | "section" | "li";
  className?: string;
  children: ReactNode;
}

// Carte à fond pastel des slides, à alterner (ciel, pêche) plutôt qu'un
// gris uniforme. Deux pastels seulement : palette resserrée (DESIGN.md).
export function PastelCard({
  tone,
  as: Element = "article",
  className,
  children,
}: PastelCardProps) {
  return (
    <Element className={cn("rounded-3xl p-6", CARD_TONES[tone], className)}>
      {children}
    </Element>
  );
}

export type ChipTone = "petrol" | "accent";

const CHIP_TONES: Record<ChipTone, string> = {
  petrol: "bg-petrol",
  // accent = orange foncé : blanc dessus ≈ 5.7:1 (jamais l'orange vif).
  accent: "bg-accent",
};

// Pastille de titre des cartes (« La peur », « Formations »…). Simple
// étiquette, pas un bouton.
export function Chip({
  tone,
  className,
  children,
}: {
  tone: ChipTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-4 py-1 font-display text-base font-extrabold text-white",
        CHIP_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
