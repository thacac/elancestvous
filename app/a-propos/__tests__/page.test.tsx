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

  it("affiche la phrase, mot pour mot, dans un Bubble ciel en <p>", () => {
    render(<About />);
    const phrase = screen.getByText(PHRASE);

    expect(phrase.tagName).toBe("P");
    expect(phrase.className).toContain("bg-sky");
    expect(phrase.className).toContain("rounded-full");
    expect(phrase.className).not.toContain("italic");
    expect(phrase.closest("strong")).toBeNull();
    // Hors styles prose, sinon la couleur et la graisse de prose l'emportent.
    expect(phrase.parentElement!.className).toContain("not-prose");
  });

  it("garde « C'est ce qui fait aujourd'hui ma force : » en gras, seul sur sa ligne", () => {
    render(<About />);
    const debut = screen.getByText(/C.est ce qui fait aujourd.hui ma force/);

    expect(debut.tagName).toBe("STRONG");
    expect(debut.textContent?.trim()).toBe(
      "C'est ce qui fait aujourd'hui ma force :",
    );
    expect(debut.textContent).not.toContain("théorie");
  });
});
