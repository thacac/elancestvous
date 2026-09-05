import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CoachingPage from "../page";

describe("CoachingPage internal linking (audit SEO finding #1)", () => {
  it("links to the formations QVCT/RPS page", () => {
    render(<CoachingPage />);
    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/formations-rps-qvct",
    );
  });

  it("links to the GAPP page", () => {
    render(<CoachingPage />);
    expect(screen.getByRole("link", { name: /gapp/i })).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });
});
