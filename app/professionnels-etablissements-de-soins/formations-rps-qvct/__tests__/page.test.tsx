import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormationsProPage from "../page";

describe("FormationsProPage internal linking (audit SEO finding #1)", () => {
  it("links to the coaching en établissement page", () => {
    render(<FormationsProPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i }),
    ).toHaveAttribute("href", "/professionnels-etablissements-de-soins/coaching");
  });

  it("links to the GAPP page", () => {
    render(<FormationsProPage />);
    expect(screen.getByRole("link", { name: /gapp/i })).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });
});
