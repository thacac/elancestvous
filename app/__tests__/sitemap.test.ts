import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/featureFlags", () => ({
  isBlogPublic: () => false,
}));

vi.mock("@/lib/blog", () => ({
  getAllPostsMeta: vi.fn(() => []),
}));

vi.mock("@/lib/formations", () => ({
  FORMATION_FAMILLES: [
    { id: "cadre-legal-etablissements-sante", label: "Cadre légal, droits et éthique" },
    {
      id: "prevention-rps-qvct-etablissements-sante",
      label: "Prévention des RPS et QVCT",
    },
    {
      id: "accompagnement-professionnel-etablissements-sante",
      label: "Accompagnement et pratiques professionnelles",
    },
    {
      id: "dynamique-equipe-etablissements-sante",
      label: "Dynamique d'équipe et développement professionnel",
    },
  ],
  getAllFormationsMeta: vi.fn(),
}));

import { getAllFormationsMeta } from "@/lib/formations";

import sitemap from "../sitemap";

describe("sitemap — audit SEO, finding #2 (3 des 4 hubs famille et toutes les fiches manquaient)", () => {
  it("liste les 4 hubs famille, pas seulement prevention-rps-qvct", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([]);

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://elancestvous.fr/formations/cadre-legal-etablissements-sante");
    expect(urls).toContain(
      "https://elancestvous.fr/formations/prevention-rps-qvct-etablissements-sante"
    );
    expect(urls).toContain(
      "https://elancestvous.fr/formations/accompagnement-professionnel-etablissements-sante"
    );
    expect(urls).toContain(
      "https://elancestvous.fr/formations/dynamique-equipe-etablissements-sante"
    );
  });

  it("liste chaque fiche individuelle publiée, dérivées de getAllFormationsMeta (comme le blog)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      {
        titre: "Obligations légales des établissements",
        slug: "obligations-legales-des-etablissements",
        famille: "cadre-legal-etablissements-sante",
      },
      {
        titre: "Diagnostic et plan d'action QVCT",
        slug: "diagnostic-plan-action-qvct",
        famille: "prevention-rps-qvct-etablissements-sante",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(
      "https://elancestvous.fr/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
    expect(urls).toContain(
      "https://elancestvous.fr/formations/prevention-rps-qvct-etablissements-sante/diagnostic-plan-action-qvct"
    );
  });

  it("reste à jour automatiquement : une fiche future apparaît sans toucher à sitemap.ts (pas de liste en dur)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      {
        titre: "Nouvelle fiche jamais vue",
        slug: "nouvelle-fiche-jamais-vue",
        famille: "dynamique-equipe-etablissements-sante",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    ]);

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(
      "https://elancestvous.fr/formations/dynamique-equipe-etablissements-sante/nouvelle-fiche-jamais-vue"
    );
  });

  it("n'inclut pas /mentions-legales (noindex, à ne pas régresser)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([]);

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).not.toContain("https://elancestvous.fr/mentions-legales");
  });

  it("conserve les pages statiques déjà listées (accueil, coaching, GAPP, contact)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([]);

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://elancestvous.fr");
    expect(urls).toContain("https://elancestvous.fr/coaching");
    expect(urls).toContain("https://elancestvous.fr/coaching/particuliers");
    expect(urls).toContain("https://elancestvous.fr/coaching/etablissements");
    expect(urls).toContain("https://elancestvous.fr/gapp-analyse-pratiques-professionnelles");
    expect(urls).toContain("https://elancestvous.fr/contact");
  });
});
