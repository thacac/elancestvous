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

// Le clic "Approuver" reçoit une réponse immédiate (type 7, cf.
// discordInteractionHandler.ts) qui désactive déjà les boutons, car la
// publication réelle — greffe Git Data API sur master — dépasse souvent les
// ~3s que Discord accorde pour répondre. Ce travail se termine donc après
// coup, dans le process Node qui tourne en continu sur le VPS (pas une
// fonction serverless qui gèlerait à la réponse), puis met à jour le même
// message une seconde fois via le webhook d'interaction.
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

    switch (result.status) {
      case "published":
        content = `✅ Publié : **${result.title}** — ${result.commitUrl}`;
        break;
      case "missing_cover_image":
        content = `⚠️ Impossible de publier \`${slug}\` : il manque une image de couverture. Configure la génération d'image puis régénère avant de réessayer.`;
        break;
      case "slug_mismatch":
        content = `⚠️ Impossible de publier \`${slug}\` : le frontmatter du brouillon référence un autre slug — probablement corrompu, régénère-le.`;
        break;
      case "invalid_cover_path":
        content = `⚠️ Impossible de publier \`${slug}\` : le chemin de l'image de couverture dans le frontmatter ne correspond pas à celui publié — probablement corrompu, régénère-le.`;
        break;
      case "draft_not_found":
        content = `⚠️ Brouillon \`${slug}\` introuvable (branche supprimée ?).`;
        break;
    }
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
  } catch (err) {
    // Le token d'interaction expire au bout de 15 min ; si la mise à jour
    // échoue à ce stade, il n'y a plus rien à faire côté Discord — mais
    // avaler l'erreur en silence laisserait le message bloqué sur
    // "publication en cours" sans aucune trace pour diagnostiquer. Jamais
    // le token lui-même dans le log (secret de courte durée mais un secret
    // quand même).
    console.error(
      `[discord/interactions] échec de la mise à jour finale du message pour "${slug}" :`,
      err instanceof Error ? err.message : String(err)
    );
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
