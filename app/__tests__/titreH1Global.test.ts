import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Story 4.13 : une seule définition du style du H1, sans `!`.
const RACINE = path.resolve(__dirname, "../..");
const CSS = readFileSync(path.join(RACINE, "app/globals.css"), "utf8");

// Blocs `@layer base { … }`, accolades équilibrées.
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

const REGLE_H1 = /(?:^|[\s,}])h1\s*\{([^}]*)\}/;

describe("Règle globale h1", () => {
  const blocs = blocsLayerBase(CSS);
  const dansBase = blocs.map((b) => CSS.slice(b.debut, b.fin)).join("\n");
  const horsBase = blocs.reduceRight(
    (css, b) => css.slice(0, b.debut) + css.slice(b.fin),
    CSS,
  );

  it("est dans @layer base (les utilitaires l'emportent sans `!`)", () => {
    expect(dansBase).toMatch(REGLE_H1);
    expect(horsBase).not.toMatch(REGLE_H1);
  });

  it("réduit le H1 sur smartphone et le coupe sans césure", () => {
    const corps = dansBase.match(REGLE_H1)![1];
    for (const classe of [
      "font-display",
      "text-primary",
      "font-extrabold",
      "tracking-tight",
      "text-3xl",
      "sm:text-5xl",
      "lg:text-6xl",
      "break-words",
    ]) {
      expect(corps.replace(/;/g, " ").split(/\s+/)).toContain(classe);
    }
    expect(corps).not.toMatch(/hyphens|!/);
  });
});

function fichiersTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((nom) => {
    const chemin = path.join(dir, nom);
    if (statSync(chemin).isDirectory()) {
      return nom === "__tests__" ? [] : fichiersTsx(chemin);
    }
    return nom.endsWith(".tsx") ? [chemin] : [];
  });
}

describe("Aucun H1 ne redéfinit le style global", () => {
  const sources = ["app", "components"].flatMap((d) =>
    fichiersTsx(path.join(RACINE, d)),
  );
  const h1s = sources.flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(/<h1\b[^>]*>/g)].map((m) => [
      path.relative(RACINE, f),
      m[0],
    ]),
  );

  it("trouve les H1 du site", () => {
    expect(h1s.length).toBeGreaterThanOrEqual(17);
  });

  it.each(h1s)("%s : %s", (_fichier, balise) => {
    const classes = balise.match(/className="([^"]*)"/)?.[1] ?? "";
    for (const classe of classes.split(/\s+/).filter(Boolean)) {
      expect(classe).not.toMatch(
        /^(?:[\w-]+:)*(?:text-(?:xs|sm|base|lg|\d?xl)|break-\w+|hyphens-\w+|font-\w+|tracking-\w+)$|!/,
      );
    }
  });
});
