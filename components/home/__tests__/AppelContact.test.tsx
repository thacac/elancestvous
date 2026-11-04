import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppelContact from "../AppelContact";

describe("AppelContact — fin de l'accueil (Story 4.2)", () => {
  it("affiche le message clé validé dans un encadré « À retenir »", () => {
    render(<AppelContact />);
    expect(screen.getByRole("note", { name: "À retenir" })).toHaveTextContent(
      "Prendre soin de ceux qui soignent, c'est aussi prendre soin de la qualité des soins.",
    );
  });

  it("propose un vrai lien « Prendre contact » vers /contact, en bouton orange lisible", () => {
    render(<AppelContact />);
    const lien = screen.getByRole("link", { name: "Prendre contact" });
    expect(lien).toHaveAttribute("href", "/contact");
    expect(lien.className.split(/\s+/)).toContain("bg-accent");
  });

  // Story 4.8 : la vague vit dans le pied de page partagé (Footer).
  it("ne contient plus de vague : elle appartient au pied de page", () => {
    const { container } = render(<AppelContact />);
    expect(container.querySelector('svg[viewBox="0 0 1200 64"]')).toBeNull();
  });
});
