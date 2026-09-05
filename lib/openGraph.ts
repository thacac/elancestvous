/**
 * Shared default OG/Twitter image. Next.js does not deep-merge `openGraph`
 * or `twitter` across route segments: a page that declares its own
 * `openGraph` replaces the root layout's object wholesale, so `images` has
 * to be re-declared on every page that overrides `openGraph`/`twitter`.
 */
export const OG_BANNER_IMAGES = [
  {
    url: "/og-banner.jpg",
    width: 1200,
    height: 630,
    alt: "Élan C'est Vous – Coaching & Formations pour soignants à Toulouse",
  },
];

export const TWITTER_BANNER_IMAGES = ["/og-banner.jpg"];
