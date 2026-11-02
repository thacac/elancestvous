import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Footer from "../Footer";

describe("Footer on a non-home page (audit: crawlable links everywhere)", () => {
  it("renders Mentions légales as a real link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /mentions légales/i }),
    ).toHaveAttribute("href", "/mentions-legales");
  });

  it("renders Politique de confidentialité as a real link to an existing section, not a dead '#'", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {
      name: /politique de confidentialité/i,
    });
    const href = link.getAttribute("href");
    expect(href).not.toBe("#");
    expect(href).toMatch(/^\/mentions-legales/);
  });

  it("renders the LinkedIn social link as a real anchor", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/coralie-mathorel-852b44360",
    );
  });

  it("does not disguise Mentions légales or Politique de confidentialité as a fake button", () => {
    render(<Footer />);
    expect(
      screen.queryAllByRole("button", {
        name: /mentions légales|politique de confidentialité|linkedin/i,
      }),
    ).toHaveLength(0);
  });
});

// Charte slides : pied de page pétrole, texte clair. Sur l'orange de la
// nouvelle palette, le texte bleu nuit tombait à ≈ 4:1 (< 4.5:1 requis pour
// ce texte de petite taille) ; blanc sur pétrole ≈ 9.5:1.
describe("Footer — charte slides (contraste)", () => {
  it("utilise le fond pétrole, plus l'orange", () => {
    const { container } = render(<Footer />);
    const bloc = container.querySelector("footer")!.lastElementChild;
    expect(bloc).toHaveClass("bg-petrol");
    expect(container.innerHTML).not.toMatch(/bg-accent/);
  });

  it("écrit liens et mentions en clair, jamais en bleu nuit sur le pétrole", () => {
    const { container } = render(<Footer />);
    for (const name of [/mentions légales/i, /politique de confidentialité/i, /linkedin/i]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveClass("text-white");
      expect(link).not.toHaveClass("text-primary");
    }
    for (const paragraph of container.querySelectorAll("footer p")) {
      expect(paragraph.className).not.toMatch(/text-primary/);
    }
  });
});

// Story 4.8 : la vague décorative fait partie du pied de page partagé, posé une
// seule fois dans le layout, pour qu'elle apparaisse sur toutes les pages.
describe("Footer — vague de transition sur toutes les pages (Story 4.8)", () => {
  it("garde son repère de pied de page (contentinfo)", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("s'ouvre sur une seule vague décorative, masquée aux technologies d'assistance", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer")!;
    const vagues = footer.querySelectorAll('svg[viewBox="0 0 1200 64"]');
    expect(vagues).toHaveLength(1);
    expect(footer.firstElementChild).toBe(vagues[0]);
    expect(vagues[0]).toHaveAttribute("aria-hidden", "true");
    expect(vagues[0]).toHaveAttribute("focusable", "false");
  });

  it("laisse la vague sur un fond transparent : elle prend le fond de la page", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer")!;
    expect(footer.className).not.toMatch(/\bbg-/);
    expect(footer.firstElementChild!.getAttribute("class")).not.toMatch(/\bbg-/);
    // Le contenu (liens, mentions) reste sur l'aplat pétrole, sous la vague.
    const bloc = footer.lastElementChild!;
    expect(bloc).toHaveClass("bg-petrol");
    expect(bloc).toContainElement(screen.getByRole("link", { name: /mentions légales/i }));
  });
});
