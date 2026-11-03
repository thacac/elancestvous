import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Story 4.13 : garde — toute page publique pose son fil d'Ariane. Exclus :
// l'accueil (racine du fil), les routes API et l'outil interne blog-review.
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

// Un appel commenté ne compte pas (revue 4.13) : on retire les commentaires
// JSX `{/* … */}`, de bloc et de ligne avant de chercher l'import et l'appel.
function sansCommentaires(source: string): string {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

// Import par alias ou relatif, guillemets simples ou doubles, puis appel JSX.
const UTILISE_BREADCRUMBS =
  /import\s+Breadcrumbs\s+from\s+["'][^"']*\/Breadcrumbs["'][\s\S]*<Breadcrumbs\b/;

describe("sansCommentaires / UTILISE_BREADCRUMBS", () => {
  const IMPORT = 'import Breadcrumbs from "@/components/Breadcrumbs";\n';

  it("reconnaît un import par alias ou relatif, guillemets simples ou doubles", () => {
    for (const imp of [
      IMPORT,
      "import Breadcrumbs from '../../components/Breadcrumbs';\n",
    ]) {
      expect(sansCommentaires(`${imp}<Breadcrumbs items={[]} />`)).toMatch(
        UTILISE_BREADCRUMBS,
      );
    }
  });

  it("ignore un appel commenté", () => {
    for (const appel of [
      "{/* <Breadcrumbs items={[]} /> */}",
      "/* <Breadcrumbs items={[]} /> */",
      "// <Breadcrumbs items={[]} />",
    ]) {
      expect(sansCommentaires(`${IMPORT}${appel}`)).not.toMatch(
        UTILISE_BREADCRUMBS,
      );
    }
  });
});

describe("Fil d'Ariane sur toutes les pages publiques", () => {
  const pages = pagesPubliques(APP_DIR);

  it("trouve les pages publiques", () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it.each(pages.map((p) => [path.relative(APP_DIR, p), p]))(
    "%s utilise Breadcrumbs",
    (_relatif, chemin) => {
      expect(sansCommentaires(readFileSync(chemin, "utf8"))).toMatch(
        UTILISE_BREADCRUMBS,
      );
    },
  );
});
