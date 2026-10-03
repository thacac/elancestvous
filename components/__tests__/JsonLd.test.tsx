import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonLd from "../JsonLd";

function getGraph() {
  const { container } = render(<JsonLd />);
  const script = container.querySelector('script[type="application/ld+json"]')!;
  return JSON.parse(script.innerHTML)["@graph"];
}

function getOfferCatalog() {
  const graph = getGraph();
  const professionalService = graph.find((node: { "@type": string }) =>
    node["@type"] === "ProfessionalService"
  );
  return professionalService.hasOfferCatalog;
}

describe("JsonLd — OfferCatalog (audit SEO, finding #3 : obsolète depuis l'ajout des 3 autres familles)", () => {
  it("référence les 4 familles de formations, pas seulement prevention-rps-qvct", () => {
    const urls = getOfferCatalog().itemListElement.map(
      (offer: { itemOffered: { url: string } }) => offer.itemOffered.url
    );

    expect(urls).toContain("https://elancestvous.fr/formations/cadre-legal-etablissements-sante");
    expect(urls).toContain(
      "https://elancestvous.fr/formations/prevention-rps-qvct-etablissements-sante"
    );
    expect(urls).toContain(
      "https://elancestvous.fr/formations/accompagnement-professionnel-etablissements-sante"
    );
    expect(urls).toContain(
      "https://elancestvous.fr/formations/dynamique-equipe-etablissements-sante"
    );
  });

  it("référence le catalogue /formations lui-même, pas seulement les hubs famille", () => {
    const urls = getOfferCatalog().itemListElement.map(
      (offer: { itemOffered: { url: string } }) => offer.itemOffered.url
    );

    expect(urls).toContain("https://elancestvous.fr/formations");
  });

  it("conserve les offres déjà présentes (coaching particuliers, coaching établissements, GAPP)", () => {
    const urls = getOfferCatalog().itemListElement.map(
      (offer: { itemOffered: { url: string } }) => offer.itemOffered.url
    );

    expect(urls).toContain("https://elancestvous.fr/coaching/particuliers");
    expect(urls).toContain("https://elancestvous.fr/coaching/etablissements");
    expect(urls).toContain("https://elancestvous.fr/gapp-analyse-pratiques-professionnelles");
  });

  it("chaque offre est un Service nommé, pas une entrée vide", () => {
    const itemListElement = getOfferCatalog().itemListElement as Array<{
      "@type": string;
      itemOffered: { "@type": string; name: string; url: string };
    }>;

    expect(itemListElement.length).toBeGreaterThanOrEqual(7);
    for (const offer of itemListElement) {
      expect(offer["@type"]).toBe("Offer");
      expect(offer.itemOffered["@type"]).toBe("Service");
      expect(offer.itemOffered.name).toBeTruthy();
    }
  });
});
