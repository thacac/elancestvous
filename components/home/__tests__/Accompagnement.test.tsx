import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Accompagnement from "../Accompagnement";

// Story 4.2 : déroulé d'un accompagnement en 4 étapes, texte validé par
// Cédric le 2026-10-30 (sans « sans engagement », non confirmé par Coralie).
describe("Accompagnement — démarche en 4 étapes", () => {
  it("ouvre sur un h2 dans le bandeau de la charte", () => {
    render(<Accompagnement />);
    const titre = screen.getByRole("heading", { level: 2, name: "Comment se passe un accompagnement ?" });
    expect(titre.closest(".bg-petrol")).not.toBeNull();
    expect(screen.getByText("Une démarche simple en 4 étapes").tagName).toBe("P");
  });

  it("liste les 4 étapes validées, dans l'ordre", () => {
    render(<Accompagnement />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "On échange",
      "On fait le point",
      "On agit",
      "On ancre dans la durée",
    ]);
    expect(items[0]).toHaveTextContent(
      "Un premier échange pour comprendre votre contexte, vos équipes et ce qui vous amène.",
    );
    expect(items[1]).toHaveTextContent(
      "J'analyse avec vous les besoins, les sources de tension et les ressources déjà présentes dans l'équipe.",
    );
    expect(items[2]).toHaveTextContent(
      "Je vous propose un accompagnement sur-mesure, en formation, coaching ou GAPP, adapté au rythme de votre établissement.",
    );
    expect(items[3]).toHaveTextContent(
      "On fait le bilan ensemble et on définit ce qui sera suivi dans le temps, pour que les changements tiennent.",
    );
  });

  it("ne promet pas d'échange gratuit ou « sans engagement » (non confirmé)", () => {
    const { container } = render(<Accompagnement />);
    expect(container.textContent).not.toMatch(/sans engagement|gratuit/i);
  });
});

describe("Accompagnement — ancre", () => {
  it("décale l'ancre sous la barre de navigation collante", () => {
    const { container } = render(<Accompagnement />);
    expect(container.querySelector("#comment-se-passe-un-accompagnement")).toHaveClass("scroll-mt-20");
  });
});

