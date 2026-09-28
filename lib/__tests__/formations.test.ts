import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  FORMATION_FAMILLE_LABELS,
  FORMATION_FAMILLES,
  getAllFormationsMeta,
  getFormationBySlug,
  getFormationSlugs,
} from "../formations";

const FIXTURES = path.join(__dirname, "fixtures", "formations");
const VALID = path.join(FIXTURES, "valid");

describe("getFormationSlugs", () => {
  it("lists the frontmatter slugs of every markdown file in the directory", () => {
    const slugs = getFormationSlugs(VALID);
    expect([...slugs].sort()).toEqual([
      "diagnostic-plan-action-qvct",
      "obligations-legales-des-etablissements",
    ]);
  });
});

describe("getAllFormationsMeta", () => {
  it("exposes every field of the frontmatter", () => {
    const formations = getAllFormationsMeta(VALID);
    const formation = formations.find(
      (f) => f.slug === "obligations-legales-des-etablissements"
    );
    expect(formation).toMatchObject({
      titre: "Obligations légales des établissements",
      famille: "cadre-legal-etablissements-sante",
      duree: "1 journée",
      format: "Présentiel, intra-établissement",
    });
  });

  it("validates famille against its own local enum, never against PILLAR_IDS", () => {
    // AD-1 : les deux systèmes de classification (Famille catalogue / Pilier
    // blog) restent indépendants — famille n'est jamais un id de pillars.ts.
    expect(FORMATION_FAMILLES).toEqual([
      "cadre-legal-etablissements-sante",
      "prevention-rps-qvct-etablissements-sante",
      "accompagnement-professionnel-etablissements-sante",
      "dynamique-equipe-etablissements-sante",
    ]);
    expect(FORMATION_FAMILLES).not.toContain("A");
    expect(FORMATION_FAMILLES).not.toContain("C");
    expect(FORMATION_FAMILLES).not.toContain("F");
  });

  it("has exactly one label per famille, matching the PRD Glossary", () => {
    expect(Object.keys(FORMATION_FAMILLE_LABELS).sort()).toEqual(
      [...FORMATION_FAMILLES].sort()
    );
    expect(FORMATION_FAMILLE_LABELS["cadre-legal-etablissements-sante"]).toBe(
      "Cadre légal, droits et éthique"
    );
    expect(
      FORMATION_FAMILLE_LABELS["prevention-rps-qvct-etablissements-sante"]
    ).toBe("Prévention des RPS et QVCT");
  });

  it("exposes optional Qualiopi fields as null placeholders when absent, never as invented values", () => {
    const formations = getAllFormationsMeta(VALID);
    const formation = formations.find(
      (f) => f.slug === "obligations-legales-des-etablissements"
    );
    expect(formation?.tarif).toBeNull();
    expect(formation?.referentHandicap).toBeNull();
    expect(formation?.indicateursResultats).toBeNull();
  });

  it("keeps the provided value for an optional Qualiopi field when present", () => {
    const formations = getAllFormationsMeta(VALID);
    const formation = formations.find(
      (f) => f.slug === "diagnostic-plan-action-qvct"
    );
    expect(formation?.tarif).toBe("Sur devis");
  });

  it("throws a descriptive error when famille is missing or invalid", () => {
    expect(() =>
      getAllFormationsMeta(path.join(FIXTURES, "invalid-frontmatter"))
    ).toThrow(/bad\.md/);
  });

  it("throws when two files declare the same slug", () => {
    expect(() =>
      getAllFormationsMeta(path.join(FIXTURES, "duplicate-slug"))
    ).toThrow(/same-slug/);
  });
});

describe("getFormationBySlug", () => {
  it("returns the full formation with rendered HTML body", async () => {
    const formation = await getFormationBySlug(
      "obligations-legales-des-etablissements",
      VALID
    );
    expect(formation.titre).toBe("Obligations légales des établissements");
    expect(formation.html).toContain("<p>");
  });

  it("rejects for an unknown slug", async () => {
    await expect(getFormationBySlug("inexistant", VALID)).rejects.toThrow();
  });

  it("strips scripts and unsafe markup from the rendered body", async () => {
    const formation = await getFormationBySlug(
      "xss",
      path.join(FIXTURES, "malicious")
    );
    expect(formation.html).not.toContain("<script");
    expect(formation.html).toContain("Un paragraphe normal.");
  });
});
