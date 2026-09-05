import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/a-propos",
}));

import Footer from "../Footer";

describe("Footer on a non-home page (audit: crawlable links everywhere)", () => {
  it("renders Mentions légales as a real link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /mentions légales/i }),
    ).toHaveAttribute("href", "/mentions-legales");
  });

  it("renders Politique de confidentialité as a real link to an existing section, not a dead '#'", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {
      name: /politique de confidentialité/i,
    });
    const href = link.getAttribute("href");
    expect(href).not.toBe("#");
    expect(href).toMatch(/^\/mentions-legales/);
  });

  it("renders the LinkedIn social link as a real anchor", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/coralie-mathorel-852b44360",
    );
  });

  it("does not disguise Mentions légales or Politique de confidentialité as a fake button", () => {
    render(<Footer />);
    expect(
      screen.queryAllByRole("button", {
        name: /mentions légales|politique de confidentialité|linkedin/i,
      }),
    ).toHaveLength(0);
  });
});
