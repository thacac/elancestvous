import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordSignature } from "@/lib/discordSignature";
import {
  getApprovalSlug,
  handleDiscordInteraction,
} from "@/services/blog/discordInteractionHandler";
import { updateInteractionMessage } from "@/services/blog/discordNotifier";
import { createGithubBlogRepo, parseGithubRepoEnv } from "@/services/blog/githubBlogRepo";
import { publishDraft } from "@/services/blog/publishDraft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

// Le clic "Approuver" reçoit une réponse différée (type 6, cf.
// discordInteractionHandler.ts) car la publication réelle — greffe Git Data
// API sur master — dépasse souvent les ~3s que Discord accorde pour
// répondre. Ce travail se termine donc après coup, dans le process Node qui
// tourne en continu sur le VPS (pas une fonction serverless qui gèlerait à
// la réponse), puis met à jour le message via le webhook d'interaction.
async function completeApproval(
  applicationId: string,
  interactionToken: string,
  slug: string
): Promise<void> {
  let content: string;
  try {
    const { owner, repo } = parseGithubRepoEnv(requireEnv("GITHUB_REPO"));
    const github = createGithubBlogRepo({ auth: requireEnv("GH_PAT_TOKEN"), owner, repo });
    const result = await publishDraft(slug, { github });

    content =
      result.status === "published"
        ? `✅ Publié : **${result.title}** — ${result.commitUrl}`
        : result.status === "missing_cover_image"
          ? `⚠️ Impossible de publier \`${slug}\` : il manque une image de couverture. Configure la génération d'image puis régénère avant de réessayer.`
          : `⚠️ Brouillon \`${slug}\` introuvable (branche supprimée ?).`;
  } catch (err) {
    // Ne jamais laisser Discord bloqué sur l'état différé — un échec
    // inattendu (API GitHub, réseau...) doit quand même mettre à jour le
    // message plutôt que de rester silencieux.
    content = `⚠️ Échec de la publication de \`${slug}\` : ${
      err instanceof Error ? err.message : String(err)
    }`;
  }

  try {
    await updateInteractionMessage(applicationId, interactionToken, { content });
  } catch {
    // Le token d'interaction expire au bout de 15 min ; si la mise à jour
    // échoue à ce stade, il n'y a plus rien à faire de ce côté-là.
  }
}

export async function POST(request: NextRequest) {
  // Corps brut obligatoire pour la vérification de signature — jamais
  // request.json() puis re-sérialisation, ça invaliderait silencieusement
  // la signature envoyée par Discord.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey || !verifyDiscordSignature(rawBody, signature, timestamp, publicKey)) {
    return NextResponse.json({ error: "invalid request signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const result = handleDiscordInteraction(payload);

  const approvalSlug = getApprovalSlug(payload);
  if (approvalSlug) {
    void completeApproval(payload.application_id, payload.token, approvalSlug);
  }

  return NextResponse.json(result);
}
