import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface KeyMessageProps {
  children: ReactNode;
  /** Nom accessible de l'encadré. */
  label?: string;
  className?: string;
}

// Message clé « ampoule » des slides : la phrase à retenir en fin de section
// ou d'article. role="note" plutôt qu'<aside> : le message fait partie du
// contenu principal et ne doit pas créer de repère de navigation (un par
// section donnerait des repères dupliqués).
export function KeyMessage({
  children,
  label = "À retenir",
  className,
}: KeyMessageProps) {
  return (
    <div
      role="note"
      aria-label={label}
      className={cn(
        "mx-auto flex max-w-3xl items-center gap-4 rounded-3xl bg-sky px-5 py-4 md:rounded-full md:px-8",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 48 48"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-10 shrink-0 stroke-petrol md:size-11"
      >
        <path d="M17 30a11 11 0 1 1 14 0c-1.5 1.3-2 2.8-2 4.5V36H19v-1.5c0-1.7-.5-3.2-2-4.5z" />
        <path d="M19 40h10M21 44h6M24 22v6M21 25l3 3 3-3" />
        <path
          d="M6 18h4M38 18h4M10 6l3 3M38 6l-3 3"
          className="stroke-orange"
        />
      </svg>
      <span
        aria-hidden="true"
        className="w-1 self-stretch rounded-full bg-orange"
      />
      <p className="min-w-0 font-display text-base font-extrabold leading-snug text-primary md:text-lg">
        {children}
      </p>
    </div>
  );
}
