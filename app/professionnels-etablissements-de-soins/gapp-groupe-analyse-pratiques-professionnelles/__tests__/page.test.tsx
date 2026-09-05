import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GappPage from "../page";

describe("GappPage internal linking (audit SEO finding #1)", () => {
  it("links to the coaching en établissement page", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i }),
    ).toHaveAttribute("href", "/professionnels-etablissements-de-soins/coaching");
  });

  it("links to the formations QVCT/RPS page", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/formations-rps-qvct",
    );
  });
});
