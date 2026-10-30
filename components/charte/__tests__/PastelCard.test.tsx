import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Chip, PastelCard } from "../PastelCard";

describe("PastelCard", () => {
  it.each([
    ["sky", "bg-sky"],
    ["peach", "bg-peach"],
    ["sage", "bg-sage"],
    ["lilac", "bg-lilac"],
  ] as const)("teinte %s → %s", (tone, className) => {
    render(<PastelCard tone={tone}>Contenu</PastelCard>);
    expect(screen.getByText("Contenu")).toHaveClass(className);
  });

  it("est un <article> par défaut et accepte un autre élément", () => {
    const { rerender } = render(<PastelCard tone="sky">Contenu</PastelCard>);
    expect(screen.getByText("Contenu").tagName).toBe("ARTICLE");
    rerender(
      <ul>
        <PastelCard tone="sky" as="li">
          Contenu
        </PastelCard>
      </ul>,
    );
    expect(screen.getByText("Contenu").tagName).toBe("LI");
  });

  it("fusionne les classes fournies", () => {
    render(
      <PastelCard tone="peach" className="p-8">
        Contenu
      </PastelCard>,
    );
    expect(screen.getByText("Contenu")).toHaveClass("bg-peach", "p-8");
  });
});

describe("Chip", () => {
  it.each([
    ["petrol", "bg-petrol"],
    ["accent", "bg-accent-ink"],
    ["sage", "bg-sage-ink"],
  ] as const)("pastille %s → %s, texte blanc", (tone, className) => {
    render(<Chip tone={tone}>Formations</Chip>);
    expect(screen.getByText("Formations")).toHaveClass(className, "text-white");
  });
});

describe("Chip — contraste", () => {
  it("n'utilise jamais bg-accent (blanc dessus ≈ 3.5:1, insuffisant en 16px)", () => {
    render(<Chip tone="accent">Coaching</Chip>);
    expect(screen.getByText("Coaching")).not.toHaveClass("bg-accent");
  });
});
