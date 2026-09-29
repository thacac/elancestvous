// Illustrations dédiées aux 3 tuiles piliers de la home (rattrapage design,
// cf. canevas Artifact "Home Élan C'est Vous — refonte piliers") : formes
// pleines distinctives par pilier, plutôt que les icônes stroke génériques
// utilisées ailleurs sur le site (icons-publics.tsx).
//
// Les couleurs de palette (logo/primary/accent) sont les classes Tailwind
// fill-* dérivées des tokens de app/globals.css, jamais du hex en dur : un
// futur ajustement de palette se répercute ici sans modification de ce
// fichier. Le blanc des surlignages (#ffffff) reste en dur : ce n'est pas
// un token de palette.
import * as React from "react";

// Formations : livre ouvert stylisé.
export function IconFormationsIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M100 40 C 65 25, 25 30, 15 45 L 15 155 C 25 140, 65 135, 100 150 Z"
        className="fill-logo"
      />
      <path
        d="M100 40 C 135 25, 175 30, 185 45 L 185 155 C 175 140, 135 135, 100 150 Z"
        className="fill-logo"
        opacity="0.85"
      />
      <rect x="96" y="42" width="8" height="108" rx="4" className="fill-primary" />
      <rect x="34" y="66" width="46" height="7" rx="3.5" fill="#ffffff" />
      <rect x="34" y="84" width="34" height="7" rx="3.5" fill="#ffffff" />
    </svg>
  );
}

// Coaching : duo de silhouettes (accompagnant + accompagné).
export function IconCoachingIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M105 178 C 105 145, 122 128, 140 128 C 158 128, 175 145, 175 178 Z"
        className="fill-primary"
        opacity="0.75"
      />
      <circle cx="140" cy="80" r="24" className="fill-primary" opacity="0.75" />
      <path
        d="M25 178 C 25 133, 45 108, 70 108 C 95 108, 115 133, 115 178 Z"
        className="fill-primary"
      />
      <circle cx="70" cy="65" r="30" className="fill-primary" />
    </svg>
  );
}

// GAPP : cercle de chaises occupées (jamais de chaise vide).
export function IconGappIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <circle cx="172" cy="100" r="17" className="fill-accent" />
      <circle cx="151" cy="151" r="17" className="fill-accent" />
      <circle cx="100" cy="172" r="17" className="fill-accent" />
      <circle cx="49" cy="151" r="17" className="fill-accent" />
      <circle cx="28" cy="100" r="17" className="fill-accent" />
      <circle cx="49" cy="49" r="17" className="fill-accent" />
      <circle cx="100" cy="28" r="17" className="fill-accent" />
      <circle cx="151" cy="49" r="17" className="fill-accent" />
      <circle cx="100" cy="100" r="8" className="fill-primary" />
    </svg>
  );
}
