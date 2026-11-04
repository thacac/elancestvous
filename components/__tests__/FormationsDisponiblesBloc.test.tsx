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
    programme: [{ titre: "Module", texte: "Programme." }],
    duree: "1 journée",
    format: "Présentiel",
    delaiAcces: "4 semaines",
    modalitesEvaluation: "Quiz.",
    accessibilite: "Locaux accessibles PMR.",
    tarif: null,
    referentHandicap: null,
    indicateursResultats: null,
    titreSeo: null,
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

  // Story 4.10 (RGAA 6.1, WCAG 2.4.4 / 2.5.3) : chaque « Voir la fiche »
  // nomme sa formation pour les lecteurs d'écran, texte visible inchangé,
  // sans aria-label.
  it("complète chaque « Voir la fiche » du titre de la formation (sr-only)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      formationMeta(),
      formationMeta({ titre: "Seconde fiche", slug: "seconde-fiche" }),
    ]);

    render(<FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />);

    const liens = screen.getAllByRole("link", { name: /^Voir la fiche/ });
    expect(liens.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      [
        "Voir la fiche : Obligations légales des établissements",
        "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements",
      ],
      ["Voir la fiche : Seconde fiche", "/formations/cadre-legal-etablissements-sante/seconde-fiche"],
    ]);
    // jsdom retire l'espace en tête du sr-only dans le nom calculé
    // (« Voir la fiche: … ») ; Chromium donne « Voir la fiche : … » (mesuré).
    expect(
      screen.getByRole("link", { name: /^Voir la fiche ?: Seconde fiche$/ })
    ).toHaveAttribute("href", "/formations/cadre-legal-etablissements-sante/seconde-fiche");
    liens.forEach((lien) => {
      const sr = lien.querySelector(".sr-only")!;
      expect(sr.textContent).toMatch(/^ : /);
      expect(lien.textContent!.slice(0, lien.textContent!.length - sr.textContent!.length)).toBe("Voir la fiche");
      expect(lien).not.toHaveAttribute("aria-label");
    });
  });

  it("chaque fiche lie vers sa page, avec sa durée affichée", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    render(<FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />);

    const carte = screen
      .getByRole("heading", { name: "Obligations légales des établissements" })
      .closest("div")!;

    expect(within(carte).getByText("1 journée")).toBeInTheDocument();
    expect(within(carte).getByRole("link", { name: /^Voir la fiche/ })).toHaveAttribute(
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

describe("FormationsDisponiblesBloc — mode bare (Story 3.2 : sidebar articles liés)", () => {
  // Story 4.4 : en mode bare, le parent porte la section et le bandeau
  // « Formations disponibles » (pleine largeur, au-dessus de la colonne
  // latérale) ; le bloc ne rend que les cartes.
  it("n'ajoute ni section, ni container, ni titre en mode bare, pour s'intégrer dans une grille parente", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    const { container } = render(
      <FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" bare />
    );

    expect(container.querySelector("section")).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Formations disponibles" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Obligations légales des établissements" })
    ).toBeInTheDocument();
  });

  it("garde le wrapper section habituel quand bare n'est pas passé", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    const { container } = render(
      <FormationsDisponiblesBloc famille="cadre-legal-etablissements-sante" />
    );

    expect(container.querySelector("section")).not.toBeNull();
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
    expect(screen.queryByRole("link", { name: /^Voir la fiche/ })).not.toBeInTheDocument();
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
  });
});
