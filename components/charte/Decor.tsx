import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

// Éléments décoratifs de la charte inspirée des slides de formation. Tous
// masqués aux technologies d'assistance : ils n'apportent aucun contenu.
// Couleurs via les classes dérivées des tokens de app/globals.css, jamais en
// hex : un ajustement de palette se répercute ici sans modification.

interface WaveProps {
  /** "bottom" (défaut) ferme une section, "top" en ouvre une. */
  position?: "top" | "bottom";
  className?: string;
}

// Vague de transition entre sections : bleu pâle, pétrole et trait orange.
export function Wave({ position = "bottom", className }: WaveProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 64"
      preserveAspectRatio="none"
      className={cn(
        "block h-12 w-full md:h-16",
        position === "top" && "-scale-y-100",
        className,
      )}
    >
      <path d="M0 22C220 4 420 40 700 54V64H0Z" className="fill-sky" />
      <path d="M460 64C780 56 1000 30 1200 6V64Z" className="fill-petrol" />
      <path
        d="M0 48C380 30 820 66 1200 18"
        fill="none"
        strokeWidth="4"
        className="stroke-orange"
      />
      <path d="M0 58C400 44 840 72 1200 30" fill="none" strokeWidth="3" className="stroke-cyan" />
    </svg>
  );
}

// Les trois traits orange qui « font briller » un élément dans les slides.
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 40 40"
      fill="none"
      strokeWidth="4"
      strokeLinecap="round"
      className={cn("size-8 shrink-0 stroke-orange", className)}
    >
      <line x1="8" y1="30" x2="15" y2="21" />
      <line x1="18" y1="34" x2="30" y2="20" />
      <line x1="26" y1="38" x2="34" y2="31" />
    </svg>
  );
}

// Trait de pinceau orange sous un mot clé. Simple <span> en ligne avec
// l'utilitaire brush-underline (app/globals.css) : le texte reste un nœud
// texte ordinaire (indexé tel quel), se coupe comme le reste du titre, et
// chaque ligne garde son trait.
export function BrushUnderline({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("brush-underline", className)}>{children}</span>;
}
