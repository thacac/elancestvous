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

import FormationPage, { generateMetadata, generateStaticParams } from "../page";

function formation(overrides: Partial<Formation> = {}): Formation {
  return {
    titre: "Obligations légales des établissements",
    titreSeo: null,
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

  // Story 4.4 : étapes numérotées de la charte (Steps) — numéros décoratifs,
  // l'ordre est porté par la liste ordonnée, un h3 par module.
  it("affiche le programme en étapes numérotées (1, 2...), titre et description, plutôt qu'un bloc de texte", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.getByText("1")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("2")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading", { level: 3, name: "Cadre légal et obligation de sécurité" })).toBeInTheDocument();
    expect(screen.getByText("Code du travail, jurisprudence.")).toBeInTheDocument();
    expect(screen.getByText("DUERP en pratique")).toBeInTheDocument();
    expect(screen.getByText("Méthode d'évaluation des risques, mise à jour.")).toBeInTheDocument();
  });

  // Revue story 4.4 : la colonne de lecture (≈ 574 px) ne loge pas plus de
  // 3 étapes sur une ligne ; au-delà, grille de 2 colonnes sans flèches.
  it("passe le programme en grille quand il compte plus de 3 modules", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({
        programme: Array.from({ length: 5 }, (_, i) => ({ titre: `Module ${i + 1}`, texte: "Texte." })),
      })
    );

    render(await FormationPage({ params: PARAMS }));

    const liste = screen.getByRole("heading", { level: 2, name: "Programme" }).closest("section")!.querySelector("ol")!;
    expect(liste).not.toHaveClass("lg:grid-flow-col");
    expect(liste.querySelector("[data-arrow]")).toBeNull();
  });

  it("garde les étapes en ligne, reliées par des flèches, jusqu'à 3 modules", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    render(await FormationPage({ params: PARAMS }));

    const liste = screen.getByRole("heading", { level: 2, name: "Programme" }).closest("section")!.querySelector("ol")!;
    expect(liste).toHaveClass("lg:grid-flow-col");
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

  it("relie le référent handicap renseigné au formulaire de contact, pré-rempli avec cette formation", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ referentHandicap: "Pour toute demande d'adaptation, merci de me contacter" })
    );

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.getByText("Pour toute demande d'adaptation, merci de me contacter")).toBeInTheDocument();
    const lien = screen.getByRole("link", { name: "Formulaire de contact" });
    const url = new URL(lien.getAttribute("href")!, "https://elancestvous.fr");
    expect(url.pathname).toBe("/contact");
    expect(url.searchParams.get("type")).toBe("institution");
    expect(url.searchParams.get("sujet")).toBe(
      "Adaptation handicap – formation « Obligations légales des établissements »"
    );
    // WCAG 2.2 (2.5.8) : cible d'au moins 24 × 24 px.
    expect(lien.className).toContain("min-h-6");
  });

  it("n'affiche aucun lien de contact handicap tant que le référent n'est pas renseigné", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation({ referentHandicap: null }));

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    expect(screen.queryByRole("link", { name: "Formulaire de contact" })).not.toBeInTheDocument();
  });

  it("place la fiche pratique dans un conteneur sticky sur desktop (reste visible pendant le défilement)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    const { container } = render(jsx);

    expect(container.querySelector(".lg\\:sticky")).not.toBeNull();
  });

  it("le CTA \"Demander un devis\" est un bouton plein, jamais un lien texte nu", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    const ctas = screen.getAllByRole("link", { name: "Demander un devis" });
    for (const cta of ctas) {
      expect(cta.className).toContain("bg-accent");
    }
  });

  it("le CTA \"Demander un devis\" pré-remplit le formulaire de contact avec cette formation (provenance)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    const ctas = screen.getAllByRole("link", { name: "Demander un devis" });
    for (const cta of ctas) {
      const href = cta.getAttribute("href")!;
      const url = new URL(href, "https://elancestvous.fr");
      expect(url.pathname).toBe("/contact");
      expect(url.searchParams.get("type")).toBe("institution");
      expect(url.searchParams.get("sujet")).toBe(
        "Devis pour la formation « Obligations légales des établissements »"
      );
    }
  });

  it("répète le CTA \"Demander un devis\" en bas de fiche, après la lecture (mobile)", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    const ctas = screen.getAllByRole("link", { name: "Demander un devis" });
    expect(ctas).toHaveLength(2);
    const [, ctaBas] = ctas;

    const modalites = screen.getByRole("heading", {
      name: /modalités pédagogiques et d.évaluation/i,
    });
    const retour = screen.getByRole("link", { name: /retour au catalogue/i });
    // Après le dernier contenu lu, avant le lien de retour au catalogue.
    expect(
      modalites.compareDocumentPosition(ctaBas) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      ctaBas.compareDocumentPosition(retour) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("masque le CTA de bas de fiche sur desktop, où la fiche pratique sticky reste visible", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const jsx = await FormationPage({ params: PARAMS });
    render(jsx);

    const [ctaHaut, ctaBas] = screen.getAllByRole("link", {
      name: "Demander un devis",
    });
    expect(ctaBas.closest(".lg\\:hidden")).not.toBeNull();
    expect(ctaHaut.closest(".lg\\:hidden")).toBeNull();
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

describe("generateMetadata — audit SEO, finding #1 (canonical faux, hérité de l'accueil)", () => {
  it("déclare un canonical self-référent sur l'URL réelle de la fiche, jamais celui, générique, hérité du layout racine", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const meta = await generateMetadata({ params: PARAMS });

    expect(meta.alternates?.canonical).toBe(
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
  });

  it("déclare le titre de la fiche et une description qui lui est propre", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const meta = await generateMetadata({ params: PARAMS });

    // SEO first : pas de suffixe « | Élan C'est Vous » sur les fiches, le
    // titre seul doit tenir dans les ~60 caractères affichés par Google.
    expect(meta.title).toEqual({ absolute: "Obligations légales des établissements" });
    expect(meta.openGraph?.title).toBe("Obligations légales des établissements");
    expect(meta.description).toBeTruthy();
    expect(meta.description).not.toBe(
      "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour établissements et soignants à Toulouse et en Occitanie."
    );
  });

  it("préfère le titre SEO court (titreSeo) au titre affiché pour <title> et og:title, sans suffixe", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ titreSeo: "Obligations légales en santé au travail" })
    );

    const meta = await generateMetadata({ params: PARAMS });

    expect(meta.title).toEqual({ absolute: "Obligations légales en santé au travail" });
    expect(meta.openGraph?.title).toBe("Obligations légales en santé au travail");
  });

  it("garde le titre complet en H1 même quand un titre SEO court est défini", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ titreSeo: "Obligations légales en santé au travail" })
    );

    render(await FormationPage({ params: PARAMS }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Obligations légales des établissements");
  });

  it("déclare un openGraph dédié avec une URL self-référente, jamais celle de l'accueil", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(formation());

    const meta = await generateMetadata({ params: PARAMS });

    expect(meta.openGraph?.url).toBe(
      "https://elancestvous.fr/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
    expect(meta.openGraph?.title).toBeTruthy();
    expect(meta.openGraph?.images).toBeTruthy();
  });

  it("ne plante pas et ne renvoie pas de metadata pour un slug inexistant (404 gérée par la page elle-même)", async () => {
    vi.mocked(getFormationBySlug).mockRejectedValue(new Error("introuvable"));

    const meta = await generateMetadata({
      params: Promise.resolve({
        famille: "cadre-legal-etablissements-sante",
        slug: "inexistant",
      }),
    });

    expect(meta).toEqual({});
  });

  it("ne renvoie pas de metadata quand la fiche existe mais sous une autre famille que l'URL", async () => {
    vi.mocked(getFormationBySlug).mockResolvedValue(
      formation({ famille: "prevention-rps-qvct-etablissements-sante" })
    );

    const meta = await generateMetadata({
      params: Promise.resolve({
        famille: "cadre-legal-etablissements-sante",
        slug: "obligations-legales-des-etablissements",
      }),
    });

    expect(meta).toEqual({});
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
