import { NextRequest, NextResponse } from "next/server";

import { verifyDiscordSignature } from "@/lib/discordSignature";
import { createBlogDraftDeps, createReviseDraftDeps } from "@/services/blog/createBlogDraftDeps";
import {
  getActualiteApprovalId,
  getActualiteRejectionId,
  getApprovalSlug,
  getRevisionRequest,
  handleDiscordInteraction,
} from "@/services/blog/discordInteractionHandler";
import {
  buildActualiteProposalActionRow,
  buildDraftActionRow,
  updateInteractionMessage,
} from "@/services/blog/discordNotifier";
import { generateApprovedActualite, generateDraft } from "@/services/blog/generateDraft";
import { createGithubBlogRepo, parseGithubRepoEnv } from "@/services/blog/githubBlogRepo";
import { publishDraft } from "@/services/blog/publishDraft";
import { reviseDraft } from "@/services/blog/reviseDraft";

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
  // Le clic initial désactive déjà les boutons (components: [] — cf.
  // discordInteractionHandler.ts) ; sans les rattacher explicitement ici,
  // un échec laisserait le message bloqué sans aucun moyen de réessayer
  // depuis Discord (constaté en prod). Réattachés seulement sur échec — une
  // publication réussie n'a plus besoin d'être réessayée.
  let retryable = false;
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
        retryable = true;
        break;
      case "slug_mismatch":
        content = `⚠️ Impossible de publier \`${slug}\` : le frontmatter du brouillon référence un autre slug — probablement corrompu, régénère-le.`;
        retryable = true;
        break;
      case "invalid_cover_path":
        content = `⚠️ Impossible de publier \`${slug}\` : le chemin de l'image de couverture dans le frontmatter ne correspond pas à celui publié — probablement corrompu, régénère-le.`;
        retryable = true;
        break;
      case "draft_not_found":
        content = `⚠️ Brouillon \`${slug}\` introuvable (branche supprimée ?).`;
        retryable = true;
        break;
    }
  } catch (err) {
    // Ne jamais laisser Discord bloqué sur l'état différé — un échec
    // inattendu (API GitHub, réseau...) doit quand même mettre à jour le
    // message plutôt que de rester silencieux.
    content = `⚠️ Échec de la publication de \`${slug}\` : ${
      err instanceof Error ? err.message : String(err)
    }`;
    retryable = true;
  }

  try {
    await updateInteractionMessage(applicationId, interactionToken, {
      content,
      ...(retryable ? { components: buildDraftActionRow(slug) } : {}),
    });
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

// Même raisonnement que completeApproval() ci-dessus : la soumission de la
// modale "Retoucher" reçoit déjà une réponse immédiate (type 7) qui
// désactive les boutons, car relancer Claude + recommiter + renotifier
// Discord dépasse souvent les ~3s accordés. Le résultat final met donc à
// jour ce même message une seconde fois via le webhook d'interaction.
async function completeRevision(
  applicationId: string,
  interactionToken: string,
  slug: string,
  feedback: string
): Promise<void> {
  let content: string;
  // Même raisonnement que completeApproval() : réattacher les boutons sur
  // échec pour permettre de réessayer depuis Discord. Pas nécessaire sur
  // succès — reviseDraft() poste déjà un nouveau message avec ses propres
  // boutons pour la version retouchée.
  let retryable = false;
  try {
    const result = await reviseDraft(slug, feedback, createReviseDraftDeps());

    switch (result.status) {
      case "committed":
        content = `✅ Retouche appliquée pour \`${slug}\` : nouvelle version postée ci-dessous.`;
        break;
      case "refused":
        content = `⚠️ Le modèle a refusé de retoucher \`${slug}\` (catégorie : ${
          result.category ?? "inconnue"
        }). Réessaie avec une formulation différente.`;
        retryable = true;
        break;
      case "generation_failed":
        content = `⚠️ Échec de la retouche de \`${slug}\` : ${result.reason}`;
        retryable = true;
        break;
      case "draft_not_found":
        content = `⚠️ Brouillon \`${slug}\` introuvable (branche supprimée ?).`;
        retryable = true;
        break;
    }
  } catch (err) {
    // Même garde-fou que completeApproval() : ne jamais laisser Discord
    // bloqué sur l'état différé en cas d'échec inattendu.
    content = `⚠️ Échec de la retouche de \`${slug}\` : ${
      err instanceof Error ? err.message : String(err)
    }`;
    retryable = true;
  }

  try {
    await updateInteractionMessage(applicationId, interactionToken, {
      content,
      ...(retryable ? { components: buildDraftActionRow(slug) } : {}),
    });
  } catch (err) {
    // Jamais le token lui-même dans le log (secret de courte durée mais un
    // secret quand même).
    console.error(
      `[discord/interactions] échec de la mise à jour finale du message de retouche pour "${slug}" :`,
      err instanceof Error ? err.message : String(err)
    );
  }
}

// Correction de #66 : "Approuver le sujet" ne fait que déclencher ici la
// génération d'un article déjà mis en attente (aucun sujet d'actualité ne
// génère plus jamais directement) ; "Ignorer" relance generateDraft(), qui
// exclut désormais cette actualité (githubBlogRepo.ts::listProposedActualiteSourceUrls)
// et proposera la suivante s'il y en a une, sinon retombera sur la rotation
// de piliers. Les deux dépassent souvent les ~3s accordés par Discord, d'où
// la réponse immédiate déjà envoyée par discordInteractionHandler.ts.
async function completeActualiteDecision(
  applicationId: string,
  interactionToken: string,
  decision: "approved" | "rejected",
  id: string
): Promise<void> {
  let content: string;
  // Même raisonnement que completeApproval()/completeRevision() : réattacher
  // les boutons Approuver/Ignorer sur échec pour permettre de réessayer
  // depuis Discord.
  let retryable = false;
  try {
    const deps = createBlogDraftDeps();
    const result =
      decision === "approved" ? await generateApprovedActualite(id, deps) : await generateDraft(deps);

    switch (result.status) {
      case "committed":
        content =
          decision === "approved"
            ? "✅ Article généré à partir de l'actualité approuvée : nouvelle version postée ci-dessous."
            : "🚫 Actualité ignorée. Un article a été généré via la rotation de piliers : nouvelle version postée ci-dessous.";
        break;
      case "pending_actualite_approval":
        // Ne peut arriver que pour "rejected" : generateApprovedActualite()
        // ne reconsulte jamais la veille elle-même.
        content =
          "🚫 Actualité ignorée. Une actualité suivante a été proposée ci-dessous — merci de la valider.";
        break;
      case "refused":
        content = `⚠️ Claude a refusé de générer l'article (catégorie : ${
          result.category ?? "inconnue"
        }).`;
        retryable = true;
        break;
      case "generation_failed":
        content = `⚠️ Échec de la génération : ${result.reason}`;
        retryable = true;
        break;
      case "proposal_not_found":
        content = "⚠️ Actualité introuvable (branche supprimée ?).";
        break;
    }
  } catch (err) {
    // Même garde-fou que completeApproval()/completeRevision() : ne jamais
    // laisser Discord bloqué sur l'état différé en cas d'échec inattendu.
    content = `⚠️ Échec : ${err instanceof Error ? err.message : String(err)}`;
    retryable = true;
  }

  try {
    await updateInteractionMessage(applicationId, interactionToken, {
      content,
      ...(retryable ? { components: buildActualiteProposalActionRow(id) } : {}),
    });
  } catch (err) {
    // Jamais le token lui-même dans le log (secret de courte durée mais un
    // secret quand même).
    console.error(
      `[discord/interactions] échec de la mise à jour finale du message d'actualité pour "${id}" :`,
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

  const revisionRequest = getRevisionRequest(payload);
  if (revisionRequest) {
    void completeRevision(
      payload.application_id,
      payload.token,
      revisionRequest.slug,
      revisionRequest.feedback
    );
  }

  const actualiteApprovalId = getActualiteApprovalId(payload);
  if (actualiteApprovalId) {
    void completeActualiteDecision(payload.application_id, payload.token, "approved", actualiteApprovalId);
  }

  const actualiteRejectionId = getActualiteRejectionId(payload);
  if (actualiteRejectionId) {
    void completeActualiteDecision(payload.application_id, payload.token, "rejected", actualiteRejectionId);
  }

  return NextResponse.json(result);
}
