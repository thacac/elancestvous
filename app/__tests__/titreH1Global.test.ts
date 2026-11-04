import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  balisesH1,
  CLASSE_DE_STYLE_H1,
  classesLitterales,
  regleH1EnBase,
  reglesH1HorsBase,
} from "./outils/h1";

// Story 4.13 : une seule définition du style du H1, sans `!`.
const RACINE = path.resolve(__dirname, "../..");
const CSS = readFileSync(path.join(RACINE, "app/globals.css"), "utf8");

describe("Outils de la garde des H1", () => {
  it("repère toute règle globale h1 hors @layer base, pas les sélecteurs descendants", () => {
    expect(reglesH1HorsBase("h1 { color: red; }")).toEqual(["h1"]);
    expect(reglesH1HorsBase("h1, .x { color: red; }")).toEqual(["h1"]);
    expect(reglesH1HorsBase("h1:where(.a) { color: red; }")).toEqual(["h1:where(.a)"]);
    expect(reglesH1HorsBase("@media (min-width: 1px) { h1 { color: red; } }")).toEqual(["h1"]);
    expect(reglesH1HorsBase(".prose h1 { color: red; } main h1 { margin: 0; }")).toEqual([]);
    expect(reglesH1HorsBase("@layer base { h1 { color: red; } }")).toEqual([]);
    expect(reglesH1HorsBase("/* h1 { } */ h2 { color: red; }")).toEqual([]);
  });

  it("lit la règle h1 d'un @layer base, seule ou dans une liste", () => {
    expect(regleH1EnBase("@layer base { h1 { @apply a; } }")).toContain("@apply a");
    expect(regleH1EnBase("@layer base { h1, h2 { @apply b; } }")).toContain("@apply b");
    expect(regleH1EnBase("@layer base { .prose h1 { @apply c; } }")).toBeNull();
  });

  it("lit la balise H1 entière, même avec un `>` dans une expression", () => {
    const [balise] = balisesH1(
      '<h1 onClick={() => a > b} className="text-xl">Titre</h1>',
    );
    expect(classesLitterales(balise)).toEqual(["text-xl"]);
  });

  it("refuse un className qui n'est pas une chaîne littérale", () => {
    for (const source of [
      '<h1 className={cn("text-xl", x)}>T</h1>',
      "<h1 className={`text-xl ${x}`}>T</h1>",
    ]) {
      expect(classesLitterales(balisesH1(source)[0])).toBeNull();
    }
    expect(classesLitterales(balisesH1("<h1>T</h1>")[0])).toEqual([]);
  });

  it("refuse les tailles arbitraires et les `!`", () => {
    for (const classe of ["text-[2rem]", "sm:text-(--titre)", "text-3xl", "mb-4!"]) {
      expect(classe).toMatch(CLASSE_DE_STYLE_H1);
    }
    for (const classe of ["mb-6", "leading-tight", "text-accent", "text-primary"]) {
      expect(classe).not.toMatch(CLASSE_DE_STYLE_H1);
    }
  });
});

describe("Règle globale h1", () => {
  it("est dans @layer base, sans autre règle h1 globale (les utilitaires l'emportent sans `!`)", () => {
    expect(regleH1EnBase(CSS)).not.toBeNull();
    expect(reglesH1HorsBase(CSS)).toEqual([]);
  });

  it("réduit le H1 sur smartphone et le coupe sans césure", () => {
    const corps = regleH1EnBase(CSS)!;
    const classes = corps.replace(/;/g, " ").split(/\s+/);
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
      expect(classes).toContain(classe);
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
    balisesH1(readFileSync(f, "utf8")).map((balise) => [
      path.relative(RACINE, f),
      balise,
    ]),
  );

  it("trouve les H1 du site", () => {
    expect(h1s.length).toBeGreaterThanOrEqual(17);
  });

  it.each(h1s)("%s : %s", (_fichier, balise) => {
    const classes = classesLitterales(balise);
    // className en chaîne littérale, pour rester lisible par cette garde.
    expect(classes).not.toBeNull();
    for (const classe of classes!) {
      expect(classe).not.toMatch(CLASSE_DE_STYLE_H1);
    }
  });
});
