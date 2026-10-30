import { cn } from "@/lib/utils";

import type { ReactNode } from "react";


export type PastelTone = "sky" | "peach" | "sage" | "lilac";

// Classes complètes (et non construites) pour que Tailwind les détecte.
const CARD_TONES: Record<PastelTone, string> = {
  sky: "bg-sky",
  peach: "bg-peach",
  sage: "bg-sage",
  lilac: "bg-lilac",
};

interface PastelCardProps {
  tone: PastelTone;
  as?: "article" | "div" | "section" | "li";
  className?: string;
  children: ReactNode;
}

// Carte à fond pastel des slides, à alterner (ciel, pêche, vert d'eau, lilas)
// plutôt qu'un gris uniforme.
export function PastelCard({ tone, as: Element = "article", className, children }: PastelCardProps) {
  return <Element className={cn("rounded-3xl p-6", CARD_TONES[tone], className)}>{children}</Element>;
}

export type ChipTone = "petrol" | "accent" | "sage";

const CHIP_TONES: Record<ChipTone, string> = {
  petrol: "bg-petrol",
  accent: "bg-accent",
  sage: "bg-sage-ink",
};

// Pastille de titre des cartes (« La peur », « Formations »…). Simple
// étiquette, pas un bouton.
export function Chip({ tone, className, children }: { tone: ChipTone; className?: string; children: ReactNode }) {
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
