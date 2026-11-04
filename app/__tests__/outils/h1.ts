import { expect } from "vitest";

// Story 4.13 : le style du H1 (taille réduite sur smartphone, coupure sans
// césure, police, graisse) vient de la seule règle `h1` de app/globals.css,
// en @layer base. Un H1 ne porte donc ni classe de taille (y compris
// arbitraire), de coupure, de police ou de graisse, ni modificateur `!`.
// Marges et interlignage restent libres (l'accueil garde son leading-tight).
export const CLASSE_DE_STYLE_H1 =
  /^(?:[\w-]+:)*(?:text-(?:xs|sm|base|lg|\d?xl|\[.*\]|\(.*\))|break-\w+|hyphens-\w+|font-\w+|tracking-\w+)$|!/;

export function expectH1StyleGlobal(h1: HTMLElement) {
  for (const classe of h1.classList) {
    expect(classe).not.toMatch(CLASSE_DE_STYLE_H1);
  }
}

// Balises ouvrantes `<h1 …>` d'un source JSX, en sautant les `>` situés dans
// une expression `{…}` (ex. `onClick={() => …}`) ou une chaîne.
export function balisesH1(source: string): string[] {
  const balises: string[] = [];
  for (const m of source.matchAll(/<h1\b/g)) {
    let profondeur = 0;
    let guillemet: string | null = null;
    let i = m.index! + 3;
    for (; i < source.length; i++) {
      const c = source[i];
      if (guillemet) {
        if (c === guillemet) guillemet = null;
      } else if (c === '"' || c === "'" || c === "`") {
        guillemet = c;
      } else if (c === "{") {
        profondeur++;
      } else if (c === "}") {
        profondeur--;
      } else if (c === ">" && profondeur === 0) {
        break;
      }
    }
    balises.push(source.slice(m.index!, i + 1));
  }
  return balises;
}

// Classes d'une balise H1 : seule une chaîne littérale est acceptée, pour que
// la garde puisse les lire (un `cn(...)` ou un template literal la rendrait
// aveugle). Renvoie null si le className n'est pas une chaîne littérale.
export function classesLitterales(balise: string): string[] | null {
  if (/\bclassName\s*=\s*\{/.test(balise)) return null;
  const m = balise.match(/\bclassName\s*=\s*"([^"]*)"/);
  return m ? m[1].split(/\s+/).filter(Boolean) : [];
}

// Sélecteurs hors `@layer base` qui visent le H1 de façon globale (`h1`,
// `h1, .x`, `h1:where(…)`…). Les sélecteurs descendants (`.prose h1`) sont
// légitimes et ignorés.
export function reglesH1HorsBase(css: string): string[] {
  const sansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let horsBase = sansCommentaires;
  for (const bloc of blocsLayerBase(sansCommentaires).reverse()) {
    horsBase = horsBase.slice(0, bloc.debut) + horsBase.slice(bloc.fin);
  }
  return [...horsBase.matchAll(/([^{};]+)\{/g)]
    .flatMap((m) => m[1].split(","))
    .map((s) => s.trim())
    .filter((s) => /^h1\b/.test(s));
}

// Corps de la règle `h1 { … }` (sélecteur `h1` seul ou dans une liste) à
// l'intérieur d'un `@layer base`, ou null.
export function regleH1EnBase(css: string): string | null {
  const sansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const bloc of blocsLayerBase(sansCommentaires)) {
    const contenu = sansCommentaires.slice(bloc.debut, bloc.fin);
    for (const m of contenu.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
      if (m[1].split(",").some((s) => s.trim() === "h1")) return m[2];
    }
  }
  return null;
}

function blocsLayerBase(css: string): { debut: number; fin: number }[] {
  const blocs = [];
  for (const m of css.matchAll(/@layer\s+base\s*\{/g)) {
    let profondeur = 1;
    let i = m.index! + m[0].length;
    while (profondeur > 0 && i < css.length) {
      if (css[i] === "{") profondeur++;
      if (css[i] === "}") profondeur--;
      i++;
    }
    blocs.push({ debut: m.index!, fin: i });
  }
  return blocs;
}
