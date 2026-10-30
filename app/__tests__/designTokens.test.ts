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
    ["color-petrol", "#0f4c5c"],
    ["color-orange", "#f28a1e"],
    ["color-accent", "#d9680a"],
    ["color-accent-ink", "#a64d08"],
    ["color-teal-soft", "#c6e8ec"],
    ["color-sky", "#e6f4f8"],
    ["color-peach", "#fdefe2"],
    ["color-sage", "#e9f4e7"],
    ["color-sage-ink", "#3f7a3a"],
    ["color-lilac", "#efecf9"],
  ])("définit le token %s = %s", (name, value) => {
    expect(themeToken(name)).toBe(value);
  });

  it("garde le bleu nuit et le turquoise du logo comme socle", () => {
    expect(themeToken("color-primary")).toBe("#112e40");
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
