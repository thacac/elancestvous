"use client";

import { useEffect, useRef, type FocusEvent, type ReactNode } from "react";

// Largeur du fondu décoratif au bord droit (w-10 de la page).
const FONDU_PX = 40;

// Story 4.7 : rangée de filtres qui défile sur smartphone. Sans JavaScript,
// les filtres restent des liens utilisables.
// - Focus clavier : Chrome ne fait défiler la rangée que si le filtre est
//   entièrement caché ; un filtre à moitié visible restait masqué sous le
//   bord ou le fondu. On l'amène en entier à l'écran (scroll-pr-10 le garde
//   hors du fondu).
// - Clic ou toucher : pas de défilement. Le focus arrive au mousedown ; en
//   déplaçant le filtre avant le mouseup, le clic tombait sur la rangée et le
//   filtre ne s'appliquait pas (revue).
// - Filtre actif : amené au début de la rangée s'il est caché à droite (ou
//   sous le fondu) ou à gauche, au chargement et à chaque changement (le
//   composant survit à une navigation <Link>, Retour navigateur compris).
export function FiltresDefilants({ actif, children }: { actif: string; children: ReactNode }) {
  const rangee = useRef<HTMLDivElement>(null);
  const viaPointeur = useRef(false);

  useEffect(() => {
    const el = rangee.current;
    const lien = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !lien) return;
    // La rangée est positionnée (`relative`) : offsetLeft se mesure depuis
    // son bord intérieur, indépendamment de son défilement.
    const marge = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const cacheAGauche = lien.offsetLeft - marge < el.scrollLeft;
    const cacheADroite = lien.offsetLeft + lien.offsetWidth > el.scrollLeft + el.clientWidth - FONDU_PX;
    if (cacheAGauche || cacheADroite) {
      // Marge intérieure gardée, pour ne pas rogner l'anneau de focus.
      el.scrollLeft = Math.max(0, lien.offsetLeft - marge);
    }
  }, [actif]);

  function montrer(event: FocusEvent<HTMLDivElement>) {
    const pointeur = viaPointeur.current;
    viaPointeur.current = false;
    if (!pointeur && event.target !== event.currentTarget) {
      event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  return (
    <div
      ref={rangee}
      onPointerDown={() => (viaPointeur.current = true)}
      onClick={() => (viaPointeur.current = false)}
      onFocus={montrer}
      className="relative flex gap-2 overflow-x-auto scroll-pl-1 scroll-pr-10 px-1 py-1 pr-10 sm:flex-wrap sm:overflow-x-visible sm:pr-1"
    >
      {children}
    </div>
  );
}
