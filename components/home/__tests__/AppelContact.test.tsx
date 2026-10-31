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

  it("se termine par une vague décorative avant le pied de page", () => {
    const { container } = render(<AppelContact />);
    const section = container.querySelector("section")!;
    expect(section.lastElementChild?.tagName.toLowerCase()).toBe("svg");
    expect(section.lastElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
