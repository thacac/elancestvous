"use client";

import { useEffect, useRef, type FocusEvent, type ReactNode } from "react";

// Largeur du fondu décoratif au bord droit (w-10 de la page).
const FONDU_PX = 40;

// Story 4.7 : rangée de filtres qui défile sur smartphone. Chrome ne la fait
// défiler au focus que si le filtre est entièrement caché : un filtre à
// moitié visible restait masqué sous le bord ou le fondu. On l'amène en
// entier à l'écran (scroll-pr-10 le garde hors du fondu). Sans JavaScript,
// les filtres restent des liens utilisables.
// Au chargement, un filtre actif qui dépasse à droite est amené au début de
// la rangée : sinon on ne voyait pas quel filtre s'appliquait.
export function FiltresDefilants({ children }: { children: ReactNode }) {
  const rangee = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rangee.current;
    const actif = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !actif) return;
    // La rangée n'est pas positionnée : offsetLeft se mesure depuis son
    // conteneur `relative`, qui commence au même bord.
    if (actif.offsetLeft + actif.offsetWidth > el.clientWidth - FONDU_PX) {
      // Marge intérieure gardée, pour ne pas rogner l'anneau de focus.
      el.scrollLeft = actif.offsetLeft - (parseFloat(getComputedStyle(el).paddingLeft) || 0);
    }
  }, []);

  function montrer(event: FocusEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  return (
    <div
      ref={rangee}
      onFocus={montrer}
      className="flex gap-2 overflow-x-auto scroll-pl-1 scroll-pr-10 px-1 py-1 pr-10 sm:flex-wrap sm:overflow-x-visible sm:pr-1"
    >
      {children}
    </div>
  );
}
