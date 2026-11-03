import { render, screen } from "@testing-library/react";
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

import FormationsCataloguePage, { metadata } from "../page";

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

describe("FormationsCataloguePage — espacement sous la navbar (mobile, rattrapage design)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const { container } = render(<FormationsCataloguePage />);
    const wrapper = container.firstElementChild!;

    expect(wrapper.className).toContain("pt-6");
    expect(wrapper.className).toContain("sm:pt-20");
  });
});

describe("FormationsCataloguePage — fil d'Ariane (rattrapage design)", () => {
  it("affiche un fil d'Ariane Accueil / Formations", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    render(<FormationsCataloguePage />);

    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    // Élément courant du fil d'Ariane (le H1 contient aussi « Formations »).
    expect(screen.getByText("Formations", { selector: "[aria-current='page']" })).toBeInTheDocument();
  });
});

describe("FormationsCataloguePage — tuiles vers les 4 familles (Story 2.4)", () => {
  it("affiche une tuile cliquable par famille, menant vers son hub", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    render(<FormationsCataloguePage />);

    const tuiles = screen.getAllByRole("link", { name: /^Découvrir/ });
    expect(
      tuiles.some((lien) => lien.getAttribute("href") === "/formations/cadre-legal-etablissements-sante")
    ).toBe(true);
    expect(
      tuiles.some(
        (lien) => lien.getAttribute("href") === "/formations/dynamique-equipe-etablissements-sante"
      )
    ).toBe(true);
  });

  it("autorise le titre d'une tuile à se couper si besoin (filet de sécurité pour un libellé long)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    render(<FormationsCataloguePage />);

    const titre = screen.getByRole("heading", {
      name: "Accompagnement et pratiques professionnelles",
    });
    expect(titre.className).toContain("break-words");
  });

  it("reste en 2 colonnes même sur grand écran, jamais 4 (retour visuel : 4 colonnes ne laissait pas assez de place au titre des tuiles)", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const { container } = render(<FormationsCataloguePage />);

    const grille = container.querySelector('[aria-labelledby="explorer-par-famille"] .grid')!;
    expect(grille.className).toContain("sm:grid-cols-2");
    expect(grille.className).not.toMatch(/lg:grid-cols-4|grid-cols-3|grid-cols-4/);
  });
});

describe("FormationsCataloguePage — metadata (audit SEO, finding #1 : canonical faux, hérité de l'accueil)", () => {
  it("déclare un canonical self-référent, jamais celui, générique, hérité du layout racine", () => {
    expect(metadata.alternates?.canonical).toBe("/formations");
  });

  it("déclare un titre et une description propres à la page, pas génériques", () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.title).not.toBe("Élan C'est Vous | Coaching & Formations – Toulouse");
    expect(metadata.description).toBeTruthy();
  });

  it("déclare un openGraph dédié avec une URL self-référente", () => {
    expect(metadata.openGraph?.url).toBe("https://elancestvous.fr/formations");
    expect(metadata.openGraph?.title).toBeTruthy();
    expect(metadata.openGraph?.images).toBeTruthy();
  });
});

// Cédric, 2026-11-03 : la double sélection (barre de filtres + tuiles) était
// une mauvaise décision. Le catalogue ne garde que les 4 tuiles Famille ;
// chaque hub Famille liste ses propres fiches.
describe("FormationsCataloguePage — uniquement les tuiles Famille", () => {
  it("n'affiche plus de barre de filtres ni de liste de fiches", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);
    render(<FormationsCataloguePage />);

    expect(screen.queryByRole("navigation", { name: /filtre/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Formations du catalogue" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Toutes nos formations" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Voir la fiche/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^Bientôt disponible/ })).not.toBeInTheDocument();
  });

  it("enchaîne le titre de page et le bandeau des tuiles, avec une hiérarchie Hn sans saut", () => {
    const { container } = render(<FormationsCataloguePage />);
    const niveaux = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => h.tagName);
    expect(niveaux).toEqual(["H1", "H2", "H3", "H3", "H3", "H3"]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Explorer les formations par famille");
  });

  it("ignore un ancien ?famille= : la page ne lit plus les paramètres d'URL", () => {
    expect(FormationsCataloguePage.length).toBe(0);
  });
});
