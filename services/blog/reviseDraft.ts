import { BlogDraftSchema } from "./draftSchema";
import { buildDraftMarkdown, type AnthropicParseResult } from "./generateDraft";

export type ReviseDraftResult =
  | { status: "committed"; slug: string; title: string; branch: string; url: string }
  | { status: "refused"; category?: string }
  | { status: "generation_failed"; reason: string }
  | { status: "draft_not_found"; slug: string };

export type ReviseDraftDeps = {
  anthropic: {
    reviseDraft(currentMarkdown: string, feedback: string): Promise<AnthropicParseResult>;
  };
  // Optionnel, comme pour generateDraft.ts : tant qu'aucune clé de
  // génération d'image n'est configurée, la retouche est committée et
  // notifiée sans illustration plutôt que de bloquer.
  imageGenerator?: {
    generateCoverImage(prompt: string): Promise<Buffer>;
  };
  github: {
    getDraftContent(
      slug: string
    ): Promise<{ markdown: string; coverImage: Buffer | null } | null>;
    commitDraftBranch(args: {
      slug: string;
      postMarkdown: string;
      coverImage: Buffer | null;
      commitMessage: string;
    }): Promise<{ branch: string; url: string }>;
  };
  discord: {
    notifyDraftReady(args: {
      slug: string;
      title: string;
      excerpt: string;
      coverImage: Buffer | null;
    }): Promise<{ messageId: string }>;
  };
};

export async function reviseDraft(
  slug: string,
  feedback: string,
  deps: ReviseDraftDeps
): Promise<ReviseDraftResult> {
  const existing = await deps.github.getDraftContent(slug);
  if (!existing) return { status: "draft_not_found", slug };

  const response = await deps.anthropic.reviseDraft(existing.markdown, feedback);

  if (response.stop_reason === "refusal") {
    return { status: "refused", category: response.stop_details?.category ?? undefined };
  }

  const parsed = BlogDraftSchema.safeParse(response.parsed_output);
  if (!parsed.success) {
    return {
      status: "generation_failed",
      reason: `sortie structurée invalide : ${parsed.error.message}`,
    };
  }

  // Le slug reste celui de l'article d'origine, jamais celui que la
  // sortie révisée propose — la branche blog-draft/<slug> et l'URL
  // publiée ne doivent pas changer d'une retouche à l'autre (cf. le
  // garde-fou slug_mismatch de publishDraft.ts, qui rejetterait sinon
  // la publication).
  const draft = { ...parsed.data, slug };

  // Par défaut, on conserve l'illustration déjà commitée sur la branche —
  // sans ça, une retouche sans imageGenerator configuré supprimerait
  // silencieusement cover.jpg (commitDraftBranch réécrit l'état de la
  // branche), ce qui ferait ensuite échouer systématiquement publishDraft.ts
  // avec missing_cover_image même si le brouillon d'origine avait déjà une
  // image.
  let coverImage: Buffer | null = existing.coverImage;
  if (deps.imageGenerator) {
    try {
      coverImage = await deps.imageGenerator.generateCoverImage(
        draft.imagePrompts[0].prompt
      );
    } catch (err) {
      return {
        status: "generation_failed",
        reason: `génération de l'illustration échouée : ${
          err instanceof Error ? err.message : String(err)
        }`,
      };
    }
  }

  const postMarkdown = buildDraftMarkdown(draft, coverImage);
  const { branch, url } = await deps.github.commitDraftBranch({
    slug,
    postMarkdown,
    coverImage,
    commitMessage: `blog: retouche "${draft.title}" (via Discord)`,
  });

  await deps.discord.notifyDraftReady({
    slug,
    title: draft.title,
    excerpt: draft.excerpt,
    coverImage,
  });

  return { status: "committed", slug, title: draft.title, branch, url };
}
