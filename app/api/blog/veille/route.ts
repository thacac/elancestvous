import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { runVeilleScan } from "@/services/blog/generateDraft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Même secret/vérification que /api/blog/generate (BLOG_CRON_SECRET) : un
// seul cron authentifie les deux, pas de secret dédié à ajouter.
function isAuthorized(authHeader: string | null, expectedSecret: string | undefined): boolean {
  if (!expectedSecret || !authHeader) return false;
  const expected = Buffer.from(`Bearer ${expectedSecret}`);
  const actual = Buffer.from(authHeader);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

// Réveillée par le cron quotidien (.github/workflows/blog-veille-trigger.yml),
// indépendant du cron hebdomadaire de génération — voir
// generateDraft.ts::runVeilleScan. runVeilleScan() ne lève jamais (best-effort
// de bout en bout) : le seul cas d'erreur ici est un problème de
// configuration (secret/variable d'environnement manquante côté
// createBlogDraftDeps()), qui mérite de remonter en 500 plutôt que d'être
// avalé comme un simple "rien trouvé cette fois".
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BLOG_CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!isAuthorized(authHeader, expectedSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const deps = createBlogDraftDeps();
    const result = await runVeilleScan(deps);
    return NextResponse.json(result);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ proposed: false, error: reason }, { status: 500 });
  }
}
