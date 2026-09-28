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
