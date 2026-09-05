import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { createDiscordNotifier } from "@/services/blog/discordNotifier";
import { generateDraft } from "@/services/blog/generateDraft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(authHeader: string | null, expectedSecret: string | undefined): boolean {
  if (!expectedSecret || !authHeader) return false;
  const expected = Buffer.from(`Bearer ${expectedSecret}`);
  const actual = Buffer.from(authHeader);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

// Best-effort : sans ça, un échec de génération (clé API manquante/expirée,
// solde épuisé, refus Claude...) ne se voit que dans les logs GitHub Actions.
// Construit indépendamment de createBlogDraftDeps() car c'est justement elle
// qui peut avoir échoué (ex. ANTHROPIC_API_KEY absente) — n'a besoin que des
// deux secrets Discord, qui eux ne devraient jamais manquer une fois posés.
async function notifyFailureBestEffort(reason: string): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!botToken || !channelId) return;
  try {
    await createDiscordNotifier({ botToken, channelId }).notifyGenerationFailed(reason);
  } catch {
    // Ne jamais masquer l'erreur d'origine à cause d'un échec de notification.
  }
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BLOG_CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!isAuthorized(authHeader, expectedSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const deps = createBlogDraftDeps();
    const result = await generateDraft(deps);
    if (result.status === "generation_failed") {
      await notifyFailureBestEffort(result.reason);
    } else if (result.status === "refused") {
      await notifyFailureBestEffort(
        `Claude a refusé de générer un article${
          result.category ? ` (catégorie : ${result.category})` : ""
        }.`
      );
    }
    const status = result.status === "generation_failed" ? 500 : 200;
    return NextResponse.json(result, { status });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await notifyFailureBestEffort(reason);
    return NextResponse.json({ status: "generation_failed", reason }, { status: 500 });
  }
}
