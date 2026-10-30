import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Fondations de la charte inspirée des slides de formation de Coralie :
// pétrole, orange, pastels (ciel, pêche, vert d'eau, lilas) et les polices
// Nunito / Nunito Sans / Kalam auto-hébergées via next/font.
const root = join(__dirname, "..", "..");
const globalsCss = readFileSync(join(root, "app", "globals.css"), "utf8");

function themeToken(name: string): string | undefined {
  const match = globalsCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1].trim();
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (entry === "node_modules" || entry.startsWith(".")) return [];
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("globals.css — palette inspirée des slides", () => {
  it.each([
    ["color-petrol", "#015566"],
    ["color-cyan", "#01a4b8"],
    ["color-orange", "#f28a1e"],
    ["color-accent", "#a64d08"],

    ["color-sky", "#dff7fa"],
    ["color-peach", "#fdefe2"],

  ])("définit le token %s = %s", (name, value) => {
    expect(themeToken(name)).toBe(value);
  });

  // Couleurs mesurées dans le PDF des slides (validé par Cédric le 2026-10-30) :
  // bleu nuit indigo des titres #0a0c44, pétrole #015566, turquoise #01a4b8.
  it("garde le turquoise du logo et prend le bleu nuit indigo des slides", () => {
    expect(themeToken("color-primary")).toBe("#0a0c44");
    expect(themeToken("color-logo")).toBe("#29b5ad");
  });
});

describe("globals.css — typographie", () => {
  it("branche les familles sur les variables CSS exposées par next/font", () => {
    expect(themeToken("font-sans")).toMatch(/^var\(--font-nunito-sans\)/);
    expect(themeToken("font-display")).toMatch(/^var\(--font-nunito\)/);
    expect(themeToken("font-hand")).toMatch(/^var\(--font-kalam\)/);
  });

  it("n'utilise plus Playfair Display (jamais chargée, retombait sur un serif système)", () => {
    expect(globalsCss).not.toMatch(/Playfair/);
    expect(themeToken("font-serif")).toBeUndefined();
  });

  it("aucun composant ni page n'utilise encore la classe font-serif", () => {
    const offenders = [
      ...tsxFiles(join(root, "app")),
      ...tsxFiles(join(root, "components")),
    ].filter((file) => /\bfont-serif\b/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});

describe("globals.css — animation des étincelles du logo", () => {
  it("déclare l'utilitaire animate-elan-sparkle et ses keyframes", () => {
    expect(themeToken("animate-elan-sparkle")).toMatch(/^elan-sparkle /);
    expect(globalsCss).toMatch(/@keyframes elan-sparkle/);
  });
});

// Revue (WCAG 2.2.2) : une animation qui démarre seule doit s'arrêter en
// moins de 5 s, sinon il faut un bouton pause. On scintille quelques fois au
// chargement puis on se fige.
describe("globals.css — le scintillement s'arrête de lui-même", () => {
  it("n'est pas infini et dure moins de 5 s, décalage des étincelles compris", () => {
    const token = themeToken("animate-elan-sparkle") ?? "";
    expect(token).not.toMatch(/infinite/);
    const [, duration, iterations] = token.match(/^elan-sparkle ([\d.]+)s \S+ (\d+)/) ?? [];
    const maxStagger = 0.5; // 2 × 0.25 s (components/charte/Logo.tsx)
    expect(Number(duration) * Number(iterations) + maxStagger).toBeLessThanOrEqual(5);
  });
});

describe("globals.css — utilitaire du trait de pinceau", () => {
  it("déclare brush-underline, répété sur chaque ligne du texte", () => {
    const bloc = globalsCss.match(/@utility brush-underline \{([^}]*)\}/)?.[1] ?? "";
    expect(bloc).toMatch(/box-decoration-break:\s*clone/);
    expect(bloc).toMatch(/background-image:\s*url\("data:image\/svg\+xml/);
    // Orange décoratif de la charte (token --color-orange).
    expect(bloc).toContain("%23f28a1e");
  });
});

// Palette resserrée à 8 couleurs, chacune avec un rôle unique (validé par
// Cédric le 2026-10-30) : moins de variantes, contrastes maîtrisés.
describe("globals.css — palette resserrée", () => {
  it.each(["color-accent-ink", "color-sage", "color-sage-ink", "color-lilac", "color-teal-soft"])(
    "ne définit plus %s",
    (name) => {
      expect(themeToken(name)).toBeUndefined();
    },
  );

  it("garde exactement les 8 couleurs de la charte", () => {
    expect({
      primary: themeToken("color-primary"),
      petrol: themeToken("color-petrol"),
      cyan: themeToken("color-cyan"),
      logo: themeToken("color-logo"),
      orange: themeToken("color-orange"),
      accent: themeToken("color-accent"),
      sky: themeToken("color-sky"),
      peach: themeToken("color-peach"),
    }).toEqual({
      primary: "#0a0c44",
      petrol: "#015566",
      cyan: "#01a4b8",
      logo: "#29b5ad",
      orange: "#f28a1e",
      accent: "#a64d08",
      sky: "#dff7fa",
      peach: "#fdefe2",
    });
  });

  it("aucun composant n'utilise une couleur supprimée", () => {
    const supprimees = /\b(?:bg|text|fill|stroke|border)-(?:accent-ink|sage|sage-ink|lilac|teal-soft)\b/;
    const fautifs = [...tsxFiles(join(root, "app")), ...tsxFiles(join(root, "components"))].filter(
      (file) => !file.includes("__tests__") && supprimees.test(readFileSync(file, "utf8")),
    );
    expect(fautifs).toEqual([]);
  });
});

