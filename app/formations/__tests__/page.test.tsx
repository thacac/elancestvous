import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
import type { FormationMeta } from "@/lib/formations";

import FormationsCataloguePage from "../page";

function formationMeta(overrides: Partial<FormationMeta> = {}): FormationMeta {
  return {
    titre: "Obligations légales des établissements",
    slug: "obligations-legales-des-etablissements",
    famille: "cadre-legal-etablissements-sante",
    objectifsPedagogiques: ["Objectif"],
    prerequis: "Aucun",
    publicVise: ["Direction"],
    programme: "Programme.",
    duree: "1 journée",
    format: "Présentiel",
    delaiAcces: "4 semaines",
    modalitesEvaluation: "Quiz.",
    accessibilite: "Locaux accessibles PMR.",
    tarif: null,
    referentHandicap: null,
    indicateursResultats: null,
    ...overrides,
  };
}

const ALL_FORMATIONS = [
  formationMeta(),
  formationMeta({
    titre: "Diagnostic et plan d'action QVCT",
    slug: "diagnostic-plan-action-qvct",
    famille: "prevention-rps-qvct-etablissements-sante",
    duree: "2 jours",
  }),
];

describe("FormationsCataloguePage — grille sans filtre (FR4)", () => {
  it("liste toutes les fiches, toutes familles confondues", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Obligations légales des établissements" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Diagnostic et plan d'action QVCT" })
    ).toBeInTheDocument();
  });

  it("chaque carte affiche sa pastille de famille, sa durée et un lien Voir la fiche stylé en bouton", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const carte = screen
      .getByRole("heading", { name: "Obligations légales des établissements" })
      .closest("div")!;

    expect(within(carte).getByText("Cadre légal, droits et éthique")).toBeInTheDocument();
    expect(within(carte).getByText("1 journée")).toBeInTheDocument();
    const lien = within(carte).getByRole("link", { name: "Voir la fiche" });
    expect(lien).toHaveAttribute(
      "href",
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
    expect(lien.className).toContain("border-primary");
  });
});

describe("FormationsCataloguePage — pastilles de filtre", () => {
  it("affiche une pastille Toutes et une par famille, chacune liée à la bonne URL", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const filtres = screen.getByRole("navigation", { name: /filtre/i });
    expect(within(filtres).getByRole("link", { name: "Toutes" })).toHaveAttribute(
      "href",
      "/formations"
    );
    expect(
      within(filtres).getByRole("link", { name: "Cadre légal, droits et éthique" })
    ).toHaveAttribute("href", "/formations?famille=cadre-legal-etablissements-sante");
  });

  it("marque la pastille Toutes comme active quand aucun filtre n'est appliqué", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const toutes = screen.getByRole("link", { name: "Toutes" });
    expect(toutes.className.split(" ")).toContain("bg-primary");
  });

  it("marque la pastille de la famille active quand un filtre est appliqué", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({
      searchParams: Promise.resolve({ famille: "cadre-legal-etablissements-sante" }),
    });
    render(jsx);

    const pastille = screen.getByRole("link", { name: "Cadre légal, droits et éthique" });
    expect(pastille.className.split(" ")).toContain("bg-primary");
    const toutes = screen.getByRole("link", { name: "Toutes" });
    expect(toutes.className.split(" ")).not.toContain("bg-primary");
  });
});

describe("FormationsCataloguePage — filtre par famille via searchParams (AD-5)", () => {
  it("n'affiche que les fiches de la famille demandée quand ?famille= est présent", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({
      searchParams: Promise.resolve({ famille: "prevention-rps-qvct-etablissements-sante" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Diagnostic et plan d'action QVCT" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Obligations légales des établissements" })
    ).not.toBeInTheDocument();
  });

  it("restaure la liste complète pour un ?famille= inconnu plutôt que de planter", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({
      searchParams: Promise.resolve({ famille: "famille-inexistante" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Obligations légales des établissements" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Diagnostic et plan d'action QVCT" })
    ).toBeInTheDocument();
  });
});
