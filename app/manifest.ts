import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Élan C'est Vous",
    short_name: "ÉlanCestVous",
    description:
      "Coaching individuel et collectif, formations QVCT/RPS et accompagnement des professionnels de santé.",
    start_url: "/",
    display: "standalone",
    theme_color: "#29b5ad",
    background_color: "#ffffff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
