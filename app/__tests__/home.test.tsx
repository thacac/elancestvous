import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home, { metadata } from "../page";

// Story 4.2 : la charte habille l'accueil sans toucher au SEO.
describe("Accueil — structure et SEO (Story 4.2)", () => {
  it("garde le title et la meta description", () => {
    expect(metadata.title).toBe("Coaching & Formations pour la santé des soignants à Toulouse");
    expect(metadata.description).toMatch(/^Coaching individuel et collectif, formations QVCT\/RPS/);
    expect(metadata.alternates?.canonical).toBe("/");
  });

  it("a un seul H1 et enchaîne les sections dans l'ordre prévu", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Mes 3 Axes d'Intervention",
      "Comment se passe un accompagnement ?",
    ]);
    expect(screen.getByRole("note", { name: "À retenir" })).toBeInTheDocument();
  });

  it("ne saute aucun niveau de titre", () => {
    const { container } = render(<Home />);
    const niveaux = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) =>
      Number(h.tagName[1]),
    );
    niveaux.forEach((niveau, i) => {
      if (i > 0) expect(niveau - niveaux[i - 1]).toBeLessThanOrEqual(1);
    });
  });
});
