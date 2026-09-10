import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Breadcrumbs from "../Breadcrumbs";

function getJsonLd() {
  const script = document.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.innerHTML);
}

describe("Breadcrumbs", () => {
  it("always renders Accueil as the first, linked item", () => {
    render(<Breadcrumbs items={[{ label: "Coaching en établissement" }]} />);
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders an intermediate category without a page as plain text, not a link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Professionnels & établissements de soins" },
          { label: "Coaching en établissement" },
        ]}
      />,
    );
    expect(
      screen.queryByRole("link", {
        name: "Professionnels & établissements de soins",
      }),
    ).toBeNull();
    expect(
      screen.getByText("Professionnels & établissements de soins"),
    ).toBeInTheDocument();
  });

  it("renders an intermediate item with an href as a real link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: "Un article" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("renders the last item as the current page, never as a link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: "Un article", href: "/blog/un-article" },
        ]}
      />,
    );
    expect(
      screen.queryByRole("link", { name: "Un article" }),
    ).toBeNull();
    const current = screen.getByText("Un article");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("embeds a schema.org BreadcrumbList, absolute URLs, positions renumbered", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Professionnels & établissements de soins" },
          { label: "Coaching en établissement", href: "/professionnels-etablissements-de-soins/coaching" },
        ]}
      />,
    );
    const jsonLd = getJsonLd();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://elancestvous.fr/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Coaching en établissement",
        item: "https://elancestvous.fr/professionnels-etablissements-de-soins/coaching",
      },
    ]);
  });

  it("omits the item URL in JSON-LD only for the last entry (current page)", () => {
    render(<Breadcrumbs items={[{ label: "Sans lien" }]} />);
    const jsonLd = getJsonLd();
    expect(jsonLd.itemListElement[1]).not.toHaveProperty("item");
  });

  it("drops an href-less intermediate category from the JSON-LD instead of emitting a ListItem without item (Search Console: 'Champ item manquant')", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Professionnels & établissements de soins" },
          { label: "GAPP", href: "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles" },
        ]}
      />,
    );
    const jsonLd = getJsonLd();
    expect(
      jsonLd.itemListElement.some(
        (entry: { name: string }) => entry.name === "Professionnels & établissements de soins",
      ),
    ).toBe(false);
    expect(jsonLd.itemListElement.map((entry: { position: number }) => entry.position)).toEqual([1, 2]);
  });

  it("never omits item on a non-last ListItem, regardless of trail shape", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Professionnels & établissements de soins" },
          { label: "Formations QVCT / RPS", href: "/professionnels-etablissements-de-soins/formations-rps-qvct" },
        ]}
      />,
    );
    const jsonLd = getJsonLd();
    const elements: Array<Record<string, unknown>> = jsonLd.itemListElement;
    elements.slice(0, -1).forEach((entry) => {
      expect(entry).toHaveProperty("item");
    });
  });

  it("still renders Accueil as a real link when no items are given", () => {
    render(<Breadcrumbs items={[]} />);
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
