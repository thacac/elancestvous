import { getAllPostsMeta } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";

import type { MetadataRoute } from "next";

const BASE_URL = "https://elancestvous.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = isBlogPublic() ? getAllPostsMeta() : [];

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
      url: `${BASE_URL}/particuliers/coaching-individuel`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/professionnels-etablissements-de-soins/coaching`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/professionnels-etablissements-de-soins/formations-rps-qvct`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles`,
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
