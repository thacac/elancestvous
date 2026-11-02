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
    return nom === "page.tsx" && dir !== APP_DIR ? [chemin] : [];
  });
}

describe("Fil d'Ariane sur toutes les pages publiques", () => {
  const pages = pagesPubliques(APP_DIR);

  it("trouve les pages publiques", () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it.each(pages.map((p) => [path.relative(APP_DIR, p), p]))(
    "%s utilise Breadcrumbs",
    (_relatif, chemin) => {
      const source = readFileSync(chemin, "utf8");
      expect(source).toMatch(/from "@\/components\/Breadcrumbs"/);
      expect(source).toMatch(/<Breadcrumbs\b/);
    },
  );
});
