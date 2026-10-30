import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KeyMessage } from "../KeyMessage";

// Message clé « ampoule » des slides : la phrase à retenir en fin de section.
describe("KeyMessage", () => {
  it("rend la phrase dans un encadré nommé « À retenir »", () => {
    render(<KeyMessage>Une émotion n&apos;est ni bonne ni mauvaise.</KeyMessage>);
    const aside = screen.getByRole("complementary", { name: "À retenir" });
    expect(aside).toHaveTextContent("Une émotion n'est ni bonne ni mauvaise.");
  });

  it("accepte un autre libellé", () => {
    render(<KeyMessage label="L'essentiel">Texte</KeyMessage>);
    expect(screen.getByRole("complementary", { name: "L'essentiel" })).toBeInTheDocument();
  });

  it("met le texte dans un paragraphe et masque l'ampoule décorative", () => {
    const { container } = render(<KeyMessage>Texte clé</KeyMessage>);
    expect(screen.getByText("Texte clé").tagName).toBe("P");
    for (const svg of container.querySelectorAll("svg")) {
      expect(svg.closest("[aria-hidden='true']")).not.toBeNull();
    }
  });
});
