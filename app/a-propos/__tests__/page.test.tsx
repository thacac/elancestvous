import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import About from "../page";

describe("About page internal linking (audit SEO finding #1)", () => {
  it("links contextually to coaching individuel, formations QVCT/RPS and GAPP", () => {
    render(<About />);

    expect(
      screen.getByRole("link", { name: /coaching individuel/i }),
    ).toHaveAttribute("href", "/particuliers/coaching-individuel");

    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/formations-rps-qvct",
    );

    expect(
      screen.getByRole("link", { name: /groupes d.analyse des pratiques/i }),
    ).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });
});
