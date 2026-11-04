import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BadgesBloc from "../BadgesBloc";

// Story 4.3 : les badges deviennent des pastilles de la charte (Chip), de
// simples étiquettes — plus d'effet de survol qui les ferait passer pour
// des boutons. Blanc sur pétrole 8.4:1, sur accent 5.7:1.
const badges = ["Écoute", "Respect du rythme", "Clarification", "Ressources"];

describe("BadgesBloc — charte des slides (Story 4.3)", () => {
  it("s'ouvre sur un bandeau avec un vrai h2", () => {
    render(<BadgesBloc titre="Une posture d'écoute" badges={badges} />);
    expect(screen.getByRole("heading", { level: 2, name: "Une posture d'écoute" }).closest("header")).not.toBeNull();
  });

  it("liste les badges en pastilles pétrole / orange foncé alternées", () => {
    render(<BadgesBloc titre="Titre" badges={badges} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    const tons = items.map((item) => item.firstElementChild!.className);
    expect(tons[0]).toContain("bg-petrol");
    expect(tons[1]).toContain("bg-accent");
    expect(tons[0]).toContain("text-white");
  });

  it("ne donne aux badges aucun effet de survol ni aspect de bouton", () => {
    const { container } = render(<BadgesBloc titre="Titre" badges={badges} />);
    expect(container.innerHTML).not.toMatch(/hover:|cursor-|shadow/);
  });

  it("affiche la citation fournie", () => {
    render(<BadgesBloc titre="Titre" badges={badges} citation={<p>Une citation</p>} />);
    expect(screen.getByText("Une citation")).toBeInTheDocument();
  });
});
