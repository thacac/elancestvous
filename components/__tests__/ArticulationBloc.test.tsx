import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArticulationBloc from "../ArticulationBloc";

describe("ArticulationBloc", () => {
  it("renders no links when none are provided", () => {
    render(<ArticulationBloc />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders each provided lien as a real internal link", () => {
    render(
      <ArticulationBloc
        liens={[
          {
            href: "/professionnels-etablissements-de-soins/coaching",
            label: "Coaching en établissement",
          },
          {
            href: "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
            label: "GAPP",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Coaching en établissement" }),
    ).toHaveAttribute("href", "/professionnels-etablissements-de-soins/coaching");
    expect(screen.getByRole("link", { name: "GAPP" })).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });
});

// Story 4.3 : `text-muted` (#93999b) faisait 2.9:1 sur blanc, sous le seuil
// de 4.5:1 exigé pour le texte courant.
describe("ArticulationBloc — contraste (Story 4.3)", () => {
  it("n'utilise plus l'ancien gris muted", () => {
    const { container } = render(<ArticulationBloc />);
    expect(container.innerHTML).not.toMatch(/muted/);
  });
});
