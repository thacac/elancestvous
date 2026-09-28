import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(),
}));

import { getAllFormationsMeta } from "@/lib/formations";
import type { FormationMeta } from "@/lib/formations";

import FormationsDisponiblesBloc from "../FormationsDisponiblesBloc";

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

describe("FormationsDisponiblesBloc — liste filtrée par famille", () => {
  it("affiche uniquement les fiches de la famille demandée", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      formationMeta(),
      formationMeta({
        titre: "Diagnostic et plan d'action QVCT",
        slug: "diagnostic-plan-action-qvct",
        famille: "prevention-rps-qvct-etablissements-sante",
      }),
    ]);

    render(<FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />);

    expect(
      screen.getByRole("heading", { name: "Obligations légales des établissements" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Diagnostic et plan d'action QVCT" })
    ).not.toBeInTheDocument();
  });

  it("chaque fiche lie vers sa page, avec sa durée affichée", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    render(<FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />);

    const carte = screen
      .getByRole("heading", { name: "Obligations légales des établissements" })
      .closest("div")!;

    expect(within(carte).getByText("1 journée")).toBeInTheDocument();
    expect(within(carte).getByRole("link", { name: "Voir la fiche" })).toHaveAttribute(
      "href",
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
  });

  it("affiche un titre de section 'Formations disponibles'", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    render(<FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />);

    expect(
      screen.getByRole("heading", { name: "Formations disponibles" })
    ).toBeInTheDocument();
  });
});

describe("FormationsDisponiblesBloc — état vide honnête (UJ-1)", () => {
  it("n'affiche ni liste tronquée ni erreur quand aucune fiche n'existe pour la famille", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    render(
      <FormationsDisponiblesBloc famille="accompagnement-professionnel-etablissements-sante" />
    );

    expect(
      screen.getByRole("heading", { name: "Formations disponibles" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voir la fiche" })).not.toBeInTheDocument();
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
  });
});
