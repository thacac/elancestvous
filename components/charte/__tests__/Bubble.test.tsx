import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Bubble } from "../Bubble";

// Bulle qui interpelle le visiteur, comme en formation.
describe("Bubble", () => {
  it("rend la question dans un paragraphe par défaut", () => {
    render(<Bubble>Et vous, comment allez-vous vraiment ?</Bubble>);
    expect(screen.getByText("Et vous, comment allez-vous vraiment ?").tagName).toBe("P");
  });

  it("peut être un vrai titre quand la question structure la section", () => {
    render(<Bubble as="h2">Quelles situations génèrent du stress ?</Bubble>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Quelles situations génèrent du stress ?",
    );
  });

  it("masque les petites bulles décoratives et ne les met pas dans le texte", () => {
    const { container } = render(<Bubble>Question</Bubble>);
    const decorations = container.querySelectorAll("[data-bubble-tail]");
    expect(decorations.length).toBeGreaterThan(0);
    for (const decoration of decorations) {
      expect(decoration).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getByText("Question")).toHaveTextContent(/^Question$/);
  });
});

describe("Bubble — titre", () => {
  it("neutralise l'interlettrage serré du h2 global", () => {
    render(<Bubble as="h2">Question</Bubble>);
    expect(screen.getByRole("heading")).toHaveClass("tracking-normal!");
  });
});

// Dette UX-DR7 / NFR1 résorbée en Story 4.2 (la bulle arrive sur l'accueil).
describe("Bubble — échelle Tailwind par défaut", () => {
  it("n'utilise aucune valeur arbitraire", () => {
    const { container } = render(<Bubble>Question</Bubble>);
    for (const element of container.querySelectorAll("*")) {
      expect(element.getAttribute("class") ?? "").not.toMatch(/-\[[^\]]+\]/);
    }
  });
});

