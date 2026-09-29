import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  FORMATION_FAMILLE_IDS,
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
    expect(FORMATION_FAMILLE_IDS).toEqual([
      "cadre-legal-etablissements-sante",
      "prevention-rps-qvct-etablissements-sante",
      "accompagnement-professionnel-etablissements-sante",
      "dynamique-equipe-etablissements-sante",
    ]);
    expect(FORMATION_FAMILLE_IDS).not.toContain("A");
    expect(FORMATION_FAMILLE_IDS).not.toContain("C");
    expect(FORMATION_FAMILLE_IDS).not.toContain("F");
  });

  it("derives FORMATION_FAMILLE_IDS from FORMATION_FAMILLES — one source, never two structures that could diverge", () => {
    // Miroir de PILLARS/PILLAR_IDS (services/blog/pillars.ts).
    expect(FORMATION_FAMILLE_IDS).toEqual(FORMATION_FAMILLES.map((f) => f.id));
  });

  it("has exactly one label per famille, matching the PRD Glossary", () => {
    expect(FORMATION_FAMILLES).toHaveLength(4);
    expect(
      FORMATION_FAMILLES.find((f) => f.id === "cadre-legal-etablissements-sante")
        ?.label
    ).toBe("Cadre légal, droits et éthique");
    expect(
      FORMATION_FAMILLES.find(
        (f) => f.id === "prevention-rps-qvct-etablissements-sante"
      )?.label
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

  it("exposes programme as a structured list of modules (titre + texte), not a single free-text field", () => {
    const formations = getAllFormationsMeta(VALID);
    const formation = formations.find(
      (f) => f.slug === "obligations-legales-des-etablissements"
    );
    expect(Array.isArray(formation?.programme)).toBe(true);
    expect(formation!.programme.length).toBeGreaterThan(0);
    expect(formation!.programme[0]).toEqual(
      expect.objectContaining({
        titre: expect.any(String),
        texte: expect.any(String),
      })
    );
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
