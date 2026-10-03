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
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    const { container } = render(jsx);
    const wrapper = container.firstElementChild!;

    expect(wrapper.className).toContain("pt-6");
    expect(wrapper.className).toContain("sm:pt-20");
  });
});

describe("FormationsCataloguePage — fil d'Ariane (rattrapage design)", () => {
  it("affiche un fil d'Ariane Accueil / Formations", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Formations")).toBeInTheDocument();
  });
});

describe("FormationsCataloguePage — tuiles vers les 4 familles (Story 2.4)", () => {
  it("affiche une tuile cliquable par famille, menant vers son hub", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const tuiles = screen.getAllByRole("link", { name: "Découvrir" });
    expect(
      tuiles.some((lien) => lien.getAttribute("href") === "/formations/cadre-legal-etablissements-sante")
    ).toBe(true);
    expect(
      tuiles.some(
        (lien) => lien.getAttribute("href") === "/formations/dynamique-equipe-etablissements-sante"
      )
    ).toBe(true);
  });

  it("autorise le titre d'une tuile à se couper si besoin (filet de sécurité pour un libellé long)", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const titre = screen.getByRole("heading", {
      name: "Accompagnement et pratiques professionnelles",
    });
    expect(titre.className).toContain("break-words");
  });

  it("reste en 2 colonnes même sur grand écran, jamais 4 (retour visuel : 4 colonnes ne laissait pas assez de place au titre des tuiles)", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    const { container } = render(jsx);

    const grille = container.querySelector('[aria-label="Familles de formations"] > div')!;
    expect(grille.className).toContain("sm:grid-cols-2");
    expect(grille.className).not.toMatch(/lg:grid-cols-4|grid-cols-3|grid-cols-4/);
  });

  it("positionne les tuiles au-dessus de la grille filtrable, sans la modifier", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const tuile = screen
      .getAllByRole("link", { name: "Découvrir" })
      .find((lien) => lien.getAttribute("href") === "/formations/cadre-legal-etablissements-sante")!;
    const filtres = screen.getByRole("navigation", { name: /filtre/i });

    expect(
      tuile.compareDocumentPosition(filtres) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

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

  it("chaque carte affiche sa pastille de famille colorée, sa durée et un CTA accent Voir la fiche", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([formationMeta()]);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const carte = screen
      .getByRole("heading", { name: "Obligations légales des établissements" })
      .closest("div")!;

    const pastille = within(carte).getByText("Cadre légal, droits et éthique");
    expect(pastille.className).toContain("bg-cat-legal");
    expect(within(carte).getByText("1 journée")).toBeInTheDocument();
    const lien = within(carte).getByRole("link", { name: "Voir la fiche" });
    expect(lien).toHaveAttribute(
      "href",
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
    expect(lien.className).toContain("bg-accent");
  });
});

describe("FormationsCataloguePage — état vide honnête par famille (rattrapage design)", () => {
  it("affiche une carte 'Bientôt disponible' pour chaque famille sans fiche encore publiée, en vue Toutes", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const cartesBientot = screen.getAllByRole("heading", { name: "Bientôt disponible" });
    expect(cartesBientot).toHaveLength(2);

    const famillesEnAttente = cartesBientot.map(
      (titre) => titre.closest("div")!.querySelector("span")!.textContent
    );
    expect(famillesEnAttente).toContain("Accompagnement et pratiques professionnelles");
    expect(famillesEnAttente).toContain("Dynamique d'équipe et développement professionnel");
  });

  it("n'affiche aucune carte 'Bientôt disponible' pour une famille qui a des fiches publiées", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const cartesBientot = screen.getAllByRole("heading", { name: "Bientôt disponible" });
    const famillesEnBientot = cartesBientot.map(
      (titre) => within(titre.closest("div")!).getByText(/^(Cadre légal|Prévention|Accompagnement|Dynamique)/).textContent
    );
    expect(famillesEnBientot).not.toContain("Cadre légal, droits et éthique");
    expect(famillesEnBientot).not.toContain("Prévention des RPS et QVCT");
  });

  it("filtré sur une famille vide, affiche sa carte 'Bientôt disponible' plutôt qu'une grille vide", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue(ALL_FORMATIONS);

    const jsx = await FormationsCataloguePage({
      searchParams: Promise.resolve({ famille: "dynamique-equipe-etablissements-sante" }),
    });
    render(jsx);

    expect(screen.getByRole("heading", { name: "Bientôt disponible" })).toBeInTheDocument();
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
