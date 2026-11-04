import { getAllPostsMeta } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";
import { FORMATION_FAMILLES, getAllFormationsMeta } from "@/lib/formations";

import type { MetadataRoute } from "next";

const BASE_URL = "https://elancestvous.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = isBlogPublic() ? getAllPostsMeta() : [];
  const formations = getAllFormationsMeta();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/a-propos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/coaching/particuliers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/coaching/etablissements`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/formations`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Les 4 hubs famille (audit SEO, finding #2 : seul prevention-rps-qvct
    // était listé, ajouté quand c'était encore le seul hub existant) —
    // dérivés de FORMATION_FAMILLES plutôt qu'une liste en dur, pour rester
    // à jour si une famille est ajoutée.
    ...FORMATION_FAMILLES.map((famille) => ({
      url: `${BASE_URL}/formations/${famille.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // Chaque fiche individuelle publiée (audit SEO, finding #2 : aucune
    // fiche n'était listée) — même logique que les articles de blog
    // ci-dessous, dérivée de getAllFormationsMeta plutôt qu'une liste en
    // dur, pour qu'une future fiche apparaisse automatiquement.
    ...formations.map((formation) => ({
      url: `${BASE_URL}/formations/${formation.famille}/${formation.slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/gapp-analyse-pratiques-professionnelles`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    ...(isBlogPublic()
      ? [
          {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
          },
          ...posts.map((post) => ({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt ?? post.publishedAt),
            changeFrequency: "yearly" as const,
            priority: 0.5,
          })),
        ]
      : []),
  ];
}
