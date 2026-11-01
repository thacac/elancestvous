import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Hero from "../Hero";

describe("Hero — pas de décalage négatif sous la navbar sticky", () => {
  it("n'a plus de top négatif (la navbar est sticky et déjà dans le flux, aucun chevauchement à compenser)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;

    expect(section.className).not.toMatch(/-top-\d/);
  });
});

describe("Hero — fond visible en transparence sous la navbar (effet vitre dépolie)", () => {
  it("étend son fond pastel sous la navbar via une marge négative, compensée par un padding pour que le contenu reste sous la navbar", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;

    // La marge négative ne déplace que la boîte (donc le fond) ; le padding
    // compensateur repousse tout le contenu réel d'autant, pour qu'il ne se
    // retrouve jamais derrière la navbar (contrairement à l'ancien -top-20
    // qui déplaçait aussi le contenu).
    expect(section.className).toContain("-mt-20");
    expect(section.className).toContain("pt-20");
  });
});

describe("Hero — tient dans un écran mobile sans scroll excessif avant le CTA", () => {
  it("le logo n'a plus son propre décalage mt-20 mobile, désormais redondant avec le pt-20 de la section (sinon 80px perdus deux fois)", () => {
    render(<Hero />);
    const logo = screen.getByRole("img", { name: /coaching et formations/i });

    expect(logo.getAttribute("class") ?? "").not.toMatch(/(?<!md:)(?<!lg:)(?<!xl:)\bmt-20\b/);
  });
});

describe("Hero — bloc \"particulier\" aligné comme le reste du contenu sur mobile", () => {
  it("se centre sur mobile (comme le titre et le CTA), et repasse à gauche à partir de md", () => {
    render(<Hero />);
    const titre = screen.getByText(/vous êtes un particulier/i);
    const bloc = titre.closest("div")!;

    expect(bloc.className).toContain("text-center");
    expect(bloc.className).toContain("md:text-left");
    expect(bloc.className).not.toMatch(/(?<!md:)\btext-left\b/);
  });
});

describe("Hero — logo variante C", () => {
  it("affiche le logo vectoriel avec ses étincelles animées", () => {
    const { container } = render(<Hero />);
    const logo = screen.getByRole("img", { name: /coaching et formations/i });
    expect(logo.tagName.toLowerCase()).toBe("svg");
    expect(container.querySelectorAll("[data-sparkle]")).toHaveLength(3);
    expect(container.querySelector("[data-sparkle]")).toHaveClass("motion-safe:animate-elan-sparkle");
  });
});

describe("Hero — charte slides (Story 4.2)", () => {
  it("garde le H1 mot pour mot, avec le trait de pinceau sous « ceux qui soignent »", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/^Préserver la santé de\s?ceux qui soignent\.$/);
    expect(h1.querySelector(".brush-underline")).toHaveTextContent("ceux qui soignent");
  });

  it("pose la question au visiteur dans une bulle, à partir du desktop seulement", () => {
    render(<Hero />);
    const question = screen.getByText("Et vous, comment allez-vous vraiment ?");
    expect(question.tagName).toBe("P");
    // Sur mobile la colonne visuelle passe avant le texte : la bulle y
    // repousserait le H1 hors du premier écran.
    expect(question.parentElement).toHaveClass("hidden", "lg:block");
  });

  it("rend le texte d'introduction lisible sur le fond pastel (plus de gris secondary)", () => {
    render(<Hero />);
    const intro = screen.getByText(/ancienne soignante basée à/i).closest("p")!;
    expect(intro.className).not.toMatch(/\btext-secondary\b/);
  });

  it("ferme la section par une vague décorative", () => {
    const { container } = render(<Hero />);
    const vague = container.querySelector("section > svg[aria-hidden='true']");
    expect(vague).not.toBeNull();
  });
});

// Revue Story 4.2 : corrections de mise en page et de contraste.
describe("Hero — espacements et contrastes (revue Story 4.2)", () => {
  it("garde un espace sous le logo quand la bulle est masquée (mobile, tablette)", () => {
    render(<Hero />);
    const logo = screen.getByRole("img", { name: /coaching et formations/i });
    expect(logo).toHaveClass("mb-10", "lg:mb-0");
  });

  it("réserve sous le contenu au moins la hauteur de la vague (h-12, md:h-16)", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section")).toHaveClass("pb-16", "md:pb-16");
  });

  it("écrit le bloc « particulier » en couleurs lisibles sur le pastel (≥ 4.5:1)", () => {
    render(<Hero />);
    const texte = screen.getByText(/pour débloquer une situation/i);
    expect(texte.className).not.toMatch(/\btext-secondary\b/);
    const lien = screen.getByRole("link", { name: /accompagnement individuel/i });
    expect(lien.closest("span")!.className.split(/\s+/)).toContain("text-accent");
  });
});


// Story 4.6 : l'accueil quitte l'ancien pastel pour le ciel de la charte ; la
// bulle passe en blanc pour s'en détacher (décision de Cédric, 2026-11-01).
describe("Hero — palette de la charte (Story 4.6)", () => {
  it("pose son fond en ciel, plus en pastel", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;
    expect(section).toHaveClass("bg-sky");
    expect(section.className).not.toMatch(/\bbg-pastel\b/);
  });

  it("met la bulle en blanc pour qu'elle reste visible sur le ciel", () => {
    render(<Hero />);
    expect(screen.getByText("Et vous, comment allez-vous vraiment ?")).toHaveClass("bg-white");
  });

  it("trace le séparateur du bloc « particulier » en bleu nuit atténué, plus en muted", () => {
    render(<Hero />);
    const bloc = screen.getByText(/vous êtes un particulier/i).closest("div")!;
    expect(bloc).toHaveClass("border-t-primary/20");
    expect(bloc.className).not.toMatch(/\bborder-t-muted\b/);
  });
});
