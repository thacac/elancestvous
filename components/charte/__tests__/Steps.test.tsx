import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Steps } from "../Steps";

const steps = [
  { title: "On échange", description: "Un premier appel pour comprendre votre contexte." },
  { title: "J'analyse", description: "Les besoins de l'équipe." },
  { title: "On agit", description: "Formation, coaching ou GAPP." },
  { title: "On fait le bilan", description: "Ce qu'on ancre dans le quotidien." },
];

// Étapes numérotées des slides, réservées aux vraies démarches : l'ordre est
// porté par une liste ordonnée (sémantique), les pastilles numérotées et les
// flèches ne sont que du décor.
describe("Steps", () => {
  it("rend une liste ordonnée avec une entrée par étape", () => {
    render(<Steps steps={steps} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  });

  it("donne à chaque étape un titre h3 par défaut et sa description", () => {
    render(<Steps steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByRole("heading", { level: 3 })).toHaveTextContent("On échange");
    expect(items[0]).toHaveTextContent("Un premier appel pour comprendre votre contexte.");
  });

  it("permet d'adapter le niveau de titre des étapes", () => {
    render(<Steps steps={steps} headingLevel="h4" />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(4);
  });

  it("affiche les numéros 1 à n, masqués des lecteurs d'écran (déjà portés par la liste)", () => {
    render(<Steps steps={steps} />);
    const items = screen.getAllByRole("listitem");
    items.forEach((item, index) => {
      const badge = within(item).getByText(String(index + 1));
      expect(badge).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("ne met une flèche qu'entre deux étapes, jamais avant la première", () => {
    render(<Steps steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].querySelector("[data-arrow]")).toBeNull();
    for (const item of items.slice(1)) {
      expect(item.querySelector("[data-arrow]")).toHaveAttribute("aria-hidden", "true");
    }
  });
});

describe("Steps — robustesse (revue)", () => {
  it("garde la sémantique de liste même sans puces (VoiceOver/Safari)", () => {
    render(<Steps steps={steps} />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it("n'a pas de pastille blanc sur orange vif (contraste insuffisant en 18px)", () => {
    render(<Steps steps={steps} />);
    for (const item of screen.getAllByRole("listitem")) {
      expect(item.querySelector("[aria-hidden='true'].bg-orange")).toBeNull();
    }
  });

  it("accepte deux étapes de même titre sans avertissement de clé React", () => {
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    try {
      render(
        <Steps
          steps={[
            { title: "On fait le point", description: "Avant" },
            { title: "On fait le point", description: "Après" },
          ]}
        />,
      );
    } finally {
      console.error = original;
    }
    expect(errors).toEqual([]);
  });

  it("accepte une description en bloc (liste) sans l'imbriquer dans un <p>", () => {
    render(
      <Steps
        steps={[
          {
            title: "On agit",
            description: (
              <ul>
                <li>Formation</li>
              </ul>
            ),
          },
        ]}
      />,
    );
    expect(screen.getByText("Formation").closest("p")).toBeNull();
  });
});
