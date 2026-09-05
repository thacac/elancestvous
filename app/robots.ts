import type { MetadataRoute } from "next";
import { isBlogPublic } from "@/lib/featureFlags";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Défense en profondeur en plus du 404 (notFound()) : tant que le
        // blog n'est pas lancé publiquement, on évite même que les robots
        // tentent de le crawler. À retirer automatiquement dès que
        // BLOG_ENABLED passe à "true" — jamais l'inverse, pour ne pas
        // reproduire le classique "disallow oublié après le lancement".
        disallow: isBlogPublic() ? ["/api/", "/_next/"] : ["/api/", "/_next/", "/blog"],
      },
    ],
    sitemap: "https://elancestvous.fr/sitemap.xml",
    host: "https://elancestvous.fr",
  };
}
