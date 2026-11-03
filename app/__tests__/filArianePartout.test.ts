import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Story 4.13 : garde — toute page publique pose son haut de page (blanc puis
// fil d'Ariane) avec GabaritPage, seul composant qui rend Breadcrumbs. Exclus :
// l'accueil (racine du fil), les routes API et l'outil interne blog-review.
//
// Garde textuelle, limites connues : une balise écrite dans une chaîne, un
// `/*` ou `//` à l'intérieur d'une chaîne, ou un GabaritPage jamais rendu
// (fonction locale non appelée) peuvent la tromper. Le rendu réel est vérifié
// page par page (filArianePages.test.tsx, hautDePageMobile.test.tsx).
const APP_DIR = path.resolve(__dirname, "..");
const EXCLUS = ["api", "blog-review"];

function pagesPubliques(dir: string): string[] {
  return readdirSync(dir).flatMap((nom) => {
    const chemin = path.join(dir, nom);
    if (statSync(chemin).isDirectory()) {
      if (dir === APP_DIR && EXCLUS.includes(nom)) return [];
      if (nom === "__tests__") return [];
      return pagesPubliques(chemin);
    }
    return /^page\.(?:tsx?|jsx?)$/.test(nom) && dir !== APP_DIR ? [chemin] : [];
  });
}

// Retire les commentaires JSX `{/* … */}`, de bloc, et de ligne (y compris en
// fin de ligne, sans toucher aux `://` des URL).
function sansCommentaires(source: string): string {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

// Import par alias ou relatif, guillemets simples ou doubles, puis appel JSX.
const utilise = (composant: string) =>
  new RegExp(
    `import\\s+${composant}\\s+from\\s+["'][^"']*/${composant}["'][\\s\\S]*<${composant}\\b`,
  );
const UTILISE_GABARIT = utilise("GabaritPage");
const IMPORTE_BREADCRUMBS = /from\s+["'][^"']*\/Breadcrumbs["']/;

describe("sansCommentaires / UTILISE_GABARIT", () => {
  const IMPORT = 'import GabaritPage from "@/components/GabaritPage";\n';

  it("reconnaît un import par alias ou relatif, guillemets simples ou doubles", () => {
    for (const imp of [
      IMPORT,
      "import GabaritPage from '../../components/GabaritPage';\n",
    ]) {
      expect(
        sansCommentaires(`${imp}<GabaritPage filAriane={[]}>x</GabaritPage>`),
      ).toMatch(UTILISE_GABARIT);
    }
  });

  it("ignore un appel commenté, y compris en fin de ligne", () => {
    for (const appel of [
      "{/* <GabaritPage filAriane={[]} /> */}",
      "/* <GabaritPage filAriane={[]} /> */",
      "// <GabaritPage filAriane={[]} />",
      "const x = 1; // <GabaritPage filAriane={[]} />",
    ]) {
      expect(sansCommentaires(`${IMPORT}${appel}`)).not.toMatch(UTILISE_GABARIT);
    }
  });

  it("garde les URL intactes", () => {
    expect(sansCommentaires('const u = "https://elancestvous.fr";')).toBe(
      'const u = "https://elancestvous.fr";',
    );
  });
});

describe("Haut de page commun sur toutes les pages publiques", () => {
  const pages = pagesPubliques(APP_DIR);

  it("trouve les pages publiques", () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it.each(pages.map((p) => [path.relative(APP_DIR, p), p]))(
    "%s utilise GabaritPage, sans Breadcrumbs en direct",
    (_relatif, chemin) => {
      const source = sansCommentaires(readFileSync(chemin, "utf8"));
      expect(source).toMatch(UTILISE_GABARIT);
      expect(source).not.toMatch(IMPORTE_BREADCRUMBS);
    },
  );
});
