import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import About from "../page";

describe("About page internal linking (audit SEO finding #1)", () => {
  it("links contextually to coaching individuel, formations QVCT/RPS and GAPP", () => {
    render(<About />);

    expect(
      screen.getByRole("link", { name: /coaching individuel/i }),
    ).toHaveAttribute("href", "/coaching/particuliers");

    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/formations/prevention-rps-qvct-etablissements-sante",
    );

    expect(
      screen.getByRole("link", { name: /groupes d.analyse des pratiques/i }),
    ).toHaveAttribute("href", "/gapp-analyse-pratiques-professionnelles");
  });
});

describe("About page — espacement sous la navbar (mobile)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", () => {
    const { container } = render(<About />);
    const section = container.querySelector("#apropos")!;

    expect(section.className).toContain("pt-6");
    expect(section.className).toContain("sm:pt-20");
  });
});

describe("About page — phrase clé dans la bulle (story 4.13)", () => {
  const PHRASE = "je ne parle pas de théorie, je parle de votre réalité.";

  it("affiche la phrase, mot pour mot, dans un Bubble ciel en <p>, en <strong>", () => {
    render(<About />);
    // L'emphase sémantique d'origine (<strong>) est conservée dans la bulle.
    const fort = screen.getByText(PHRASE);
    expect(fort.tagName).toBe("STRONG");
    const phrase = fort.parentElement!;

    expect(phrase.tagName).toBe("P");
    expect(phrase.textContent).toBe(PHRASE);
    expect(phrase.className).toContain("bg-sky");
    expect(phrase.className).toContain("rounded-full");
    expect(phrase.className).not.toContain("italic");
    // Hors bloc prose : ses styles (couleur, graisse, marges) ne s'appliquent
    // pas à la bulle, sans recourir à not-prose ni à des `!`.
    expect(phrase.closest(".prose")).toBeNull();
  });

  it("garde « C'est ce qui fait aujourd'hui ma force : » en gras, seul sur sa ligne", () => {
    render(<About />);
    const debut = screen.getByText(/C.est ce qui fait aujourd.hui ma force/);

    expect(debut.tagName).toBe("STRONG");
    // Le paragraphe entier ne contient que ce début de phrase.
    expect(debut.parentElement!.tagName).toBe("P");
    expect(debut.parentElement!.textContent?.trim()).toBe(
      "C'est ce qui fait aujourd'hui ma force :",
    );
  });
});

describe("About page — 3e carte « GAPP » (animatrice en cours de certification)", () => {
  const carte = (texte: string) =>
    screen.getByText(texte, { selector: "span" }).closest(".rounded-3xl")!;

  it("ajoute la carte GAPP à côté de « 10+ » et « Coach », en alternance ciel / pêche / ciel", () => {
    render(<About />);
    const dix = carte("10+");
    const coach = carte("Coach");
    const gapp = carte("GAPP");

    const grille = dix.parentElement!;
    expect(Array.from(grille.children)).toEqual([dix, coach, gapp]);
    expect(dix.className).toContain("bg-sky");
    expect(coach.className).toContain("bg-peach");
    expect(gapp.className).toContain("bg-sky");
  });

  it("met « GAPP » en chiffre clé et la mention en stone-600, en capitales (texte réel)", () => {
    render(<About />);
    const grand = screen.getByText("GAPP", { selector: "span" });
    expect(grand.className).toContain("chiffre-cle");

    const mention = screen.getByText("Animatrice en cours de certification");
    expect(mention.className).toContain("texte-mention");
    expect(mention.className).toContain("text-stone-600");
    expect(mention.className).toContain("uppercase");
    expect(mention.closest(".rounded-3xl")).toBe(grand.closest(".rounded-3xl"));
  });

  it("aligne les trois cartes sur une ligne dès sm, empilées en dessous, sans césure", () => {
    render(<About />);
    const grille = carte("GAPP").parentElement!;
    const classes = grille.className.split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(["grid", "grid-cols-1", "sm:grid-cols-3"]));
    expect(classes).not.toContain("sm:grid-cols-2");
    expect(grille.innerHTML).not.toContain("hyphens-auto");
  });
});
