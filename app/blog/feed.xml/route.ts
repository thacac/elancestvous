import { NextResponse } from "next/server";

import { getAllPostsMeta } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";
import { buildRssFeed } from "@/lib/rssFeed";

// Même garde que app/sitemap.ts/app/robots.ts : pas de flux tant que le blog
// n'est pas lancé publiquement.
export function GET() {
  if (!isBlogPublic()) {
    return new NextResponse(null, { status: 404 });
  }

  const xml = buildRssFeed(getAllPostsMeta());

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
