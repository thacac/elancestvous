import { expect } from "vitest";

// Story 4.13 : le style du H1 (taille réduite sur smartphone, coupure sans
// césure, police, graisse) vient de la seule règle `h1` de app/globals.css,
// en @layer base. Un H1 ne porte donc ni classe de taille, de coupure, de
// police ou de graisse, ni modificateur `!`. Marges et interlignage restent
// libres (l'accueil garde son leading-tight).
const CLASSE_DE_STYLE_H1 =
  /^(?:[\w-]+:)*(?:text-(?:xs|sm|base|lg|\d?xl)|break-\w+|hyphens-\w+|font-\w+|tracking-\w+)$|!/;

export function expectH1StyleGlobal(h1: HTMLElement) {
  for (const classe of h1.classList) {
    expect(classe).not.toMatch(CLASSE_DE_STYLE_H1);
  }
}
