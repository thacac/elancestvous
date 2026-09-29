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
  getFormationBySlug: vi.fn(),
}));

import { getAllFormationsMeta, getFormationBySlug } from "@/lib/formations";
import type { Formation, FormationMeta } from "@/lib/formations";

import FormationPage, { generateStaticParams } from "../page";

function formation(overrides: Partial<Formation> = {}): Formation {
  return {
    titre: "Obligations légales des établissements",
    slug: "obligations-legales-des-etablissements",
    famille: "cadre-legal-etablissements-sante",
    objectifsPedagogiques: [
      "Identifier le cadre légal de l'obligation de sécurité",
      "Construire un DUERP exploitable",
    ],
    prerequis: "Aucun",
    publicVise: ["Direction", "Encadrement"],
    programme: [
      { titre: "Cadre légal et obligation de sécurité", texte: "Code du travail, jurisprudence." },
      { titre: "DUERP en pratique", texte: "Méthode d'évaluation des risques, mise à jour." },
    ],
    duree: "1 journée",
    format: "Présentiel, en intra-établissement",
    delaiAcces: "4 à 6 semaines",
    modalitesEvaluation: "Quiz de fin de session.",
    accessibilite: "Locaux accessibles PMR.",
    tarif: null,
    referentHandicap: null,
    indicateursResultats: null,
    html: "<p>Comprendre l'obligation de sécurité de l'employeur.</p>",
    ...overrides,
  };
}

const PARAMS = Promise.resolve({
  famille: "cadre-legal-etablissements-sante",
  slug: "obligations-legales-des-etablissements",
});

describe("FormationPage — contenu principal (FR5)", () => {
  it("affiche les objectifs pédagogiques, le programme, le public visé et les modalités", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(
      screen.getByText("Identifier le cadre légal de l'obligation de sécurité")
    ).toBeInTheDocument();
    expect(screen.getByText("Cadre légal et obligation de sécurité")).toBeInTheDocument();
    expect(screen.getByText("Code du travail, jurisprudence.")).toBeInTheDocument();
    expect(screen.getByText("Direction")).toBeInTheDocument();
    expect(screen.getByText(/Quiz de fin de session\./)).toBeInTheDocument();
  });

  it("affiche le programme en modules numérotés (01, 02...), titre en gras et description, plutôt qu'un bloc de texte (rattrapage design)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Cadre légal et obligation de sécurité")).toBeInTheDocument();
    expect(screen.getByText("Code du travail, jurisprudence.")).toBeInTheDocument();
    expect(screen.getByText("DUERP en pratique")).toBeInTheDocument();
    expect(screen.getByText("Méthode d'évaluation des risques, mise à jour.")).toBeInTheDocument();
  });

  it("affiche le titre et le corps rendu depuis le markdown", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Obligations légales des établissements" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Comprendre l'obligation de sécurité de l'employeur.")
    ).toBeInTheDocument();
  });
});

describe("FormationPage — fiche pratique Qualiopi", () => {
  it("affiche les champs Qualiopi renseignés (durée, format, délai d'accès, prérequis)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.getByText("1 journée")).toBeInTheDocument();
    expect(screen.getByText("Présentiel, en intra-établissement")).toBeInTheDocument();
    expect(screen.getByText("4 à 6 semaines")).toBeInTheDocument();
    expect(screen.getByText("Aucun")).toBeInTheDocument();
  });

  it("affiche un placeholder explicite pour un champ Qualiopi optionnel absent, jamais une valeur inventée", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ tarif: null, referentHandicap: null, indicateursResultats: null })
    );

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.queryByText("null")).not.toBeInTheDocument();
    expect(screen.getAllByText("[À confirmer]").length).toBeGreaterThanOrEqual(3);
  });

  it("affiche la vraie valeur quand un champ Qualiopi optionnel est renseigné", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation({ tarif: "Sur devis" }));

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.getByText("Sur devis")).toBeInTheDocument();
  });

  it("place la fiche pratique dans un conteneur sticky (reste visible pendant le défilement)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    const { container } = render(jsx);

    expect(container.querySelector(".sticky")).not.toBeNull();
  });

  it("le CTA \"Demander un devis\" est un bouton plein, jamais un lien texte nu", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    const cta = screen.getByRole("link", { name: "Demander un devis" });
    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta.className).toContain("bg-accent");
  });
});

describe("FormationPage — pied de fiche (rattrapage design)", () => {
  it("propose un lien de retour vers le catalogue des formations", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(
      screen.getByRole("link", { name: /retour au catalogue/i })
    ).toHaveAttribute("href", "/formations");
  });
});

describe("FormationPage — 404 quand la famille ne correspond pas au slug", () => {
  it("renvoie une 404 si la fiche existe mais sous une autre famille", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ famille: "prevention-rps-qvct-etablissements-sante" })
    );

    await expect(
      FormationPage({
        params: Promise.resolve({
          famille: "cadre-legal-etablissements-sante",
          slug: "obligations-legales-des-etablissements",
        }),
      })
    ).rejects.toThrow();
  });

  it("renvoie une 404 pour un slug inexistant", async () => {
    vi.mocked(getFormationBySlug).mockRejectedValue(new Error("introuvable"));

    await expect(
      FormationPage({
        params: Promise.resolve({
          famille: "cadre-legal-etablissements-sante",
          slug: "inexistant",
        }),
      })
    ).rejects.toThrow();
  });
});

describe("FormationPage — espacement sous la navbar (mobile, rattrapage design)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    const { container } = render(jsx);
    const article = container.querySelector("article")!;

    expect(article.className).toContain("pt-6");
    expect(article.className).toContain("sm:pt-20");
  });
});

describe("generateStaticParams", () => {
  it("génère une route statique par fiche valide, miroir de app/blog/[slug]/page.tsx", async () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      { ...formation(), famille: "cadre-legal-etablissements-sante", slug: "fiche-a" },
      {
        ...formation(),
        famille: "prevention-rps-qvct-etablissements-sante",
        slug: "fiche-b",
      },
    ] as unknown as FormationMeta[]);

    const params = generateStaticParams();

    expect(params).toEqual([
      { famille: "cadre-legal-etablissements-sante", slug: "fiche-a" },
      { famille: "prevention-rps-qvct-etablissements-sante", slug: "fiche-b" },
    ]);
  });
});
