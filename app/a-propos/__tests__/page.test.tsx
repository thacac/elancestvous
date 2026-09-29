import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import About from "../page";

describe("About page internal linking (audit SEO finding #1)", () => {
  it("links contextually to coaching individuel, formations QVCT/RPS and GAPP", () => {
    render(<About />);

    expect(
      screen.getByRole("link", { name: /coaching individuel/i }),
    ).toHaveAttribute("href", "/coaching/particuliers");

    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/formations/prevention-rps-qvct-etablissements-sante",
    );

    expect(
      screen.getByRole("link", { name: /groupes d.analyse des pratiques/i }),
    ).toHaveAttribute("href", "/gapp-analyse-pratiques-professionnelles");
  });
});

describe("About page — espacement sous la navbar (mobile)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", () => {
    const { container } = render(<About />);
    const section = container.querySelector("#apropos")!;

    expect(section.className).toContain("pt-6");
    expect(section.className).toContain("sm:pt-20");
  });
});
