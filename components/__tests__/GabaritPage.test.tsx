import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GabaritPage from "../GabaritPage";

// Story 4.13 : seul endroit qui pose le haut de page (blanc puis fil
// d'Ariane) ; le contenu de la page, H1 en tête, suit directement.
describe("GabaritPage", () => {
  it("pose le blanc puis le fil d'Ariane avant le contenu", () => {
    render(
      <GabaritPage filAriane={[{ label: "Contact" }]}>
        <h1>Titre</h1>
      </GabaritPage>,
    );
    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    const cadre = nav.parentElement!;

    expect(cadre.tagName).toBe("DIV");
    expect(cadre).toHaveClass("pt-6", "sm:pt-20");
    expect([...cadre.children].find((e) => e.tagName !== "SCRIPT")).toBe(nav);
    expect(
      nav.compareDocumentPosition(screen.getByRole("heading", { level: 1 })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Contact")).toHaveAttribute("aria-current", "page");
  });

  it("rend la balise demandée avec son id et ses classes en plus du blanc", () => {
    render(
      <GabaritPage
        as="section"
        id="contact"
        className="pb-20 min-h-screen"
        filAriane={[{ label: "Contact" }]}
      >
        <p>contenu</p>
      </GabaritPage>,
    );
    const cadre = screen.getByRole("navigation", { name: "Fil d'Ariane" })
      .parentElement!;

    expect(cadre.tagName).toBe("SECTION");
    expect(cadre).toHaveAttribute("id", "contact");
    expect(cadre).toHaveClass("pt-6", "sm:pt-20", "pb-20", "min-h-screen");
  });

  it("rend un article", () => {
    render(
      <GabaritPage as="article" filAriane={[{ label: "Blog", href: "/blog" }, { label: "Billet" }]}>
        <p>contenu</p>
      </GabaritPage>,
    );
    expect(
      screen.getByRole("navigation", { name: "Fil d'Ariane" }).parentElement!.tagName,
    ).toBe("ARTICLE");
  });
});
