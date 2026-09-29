import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/featureFlags", () => ({
  isBlogPublic: () => true,
}));

vi.mock("@/lib/blog", () => ({
  getAllPostsMeta: vi.fn(() => []),
}));

import BlogIndex from "../page";

describe("BlogIndex — fil d'Ariane", () => {
  it("affiche Accueil > Blog, Blog étant la page courante (pas de niveau pilier — tous piliers confondus)", () => {
    render(<BlogIndex />);

    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Blog" })).toBeNull();
    expect(screen.getByText("Blog", { selector: "span" })).toBeInTheDocument();
  });
});

describe("BlogIndex — espacement sous la navbar (mobile)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", () => {
    const { container } = render(<BlogIndex />);
    const section = container.querySelector("section")!;

    expect(section.className).toContain("pt-6");
    expect(section.className).toContain("sm:pt-20");
  });
});
