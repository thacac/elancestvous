import { parseDraftContent } from "@/lib/blog";

export type PublishDraftResult =
  | { status: "published"; slug: string; title: string; commitUrl: string }
  | { status: "missing_cover_image"; slug: string }
  | { status: "slug_mismatch"; slug: string }
  | { status: "draft_not_found"; slug: string };

export type PublishDraftDeps = {
  github: {
    getDraftContent(
      slug: string
    ): Promise<{ markdown: string; coverImage: Buffer | null } | null>;
    publishDraft(args: {
      slug: string;
      commitMessage: string;
    }): Promise<{ commitUrl: string }>;
  };
};

export async function publishDraft(
  slug: string,
  deps: PublishDraftDeps
): Promise<PublishDraftResult> {
  const draft = await deps.github.getDraftContent(slug);
  if (!draft) return { status: "draft_not_found", slug };

  const { frontmatter } = parseDraftContent(draft.markdown, slug);

  // frontmatter.slug alimente le chemin de coverImage écrit dans le
  // frontmatter (/blog/<frontmatter.slug>/...), tandis que
  // github.publishDraft() publie le fichier réel à
  // public/blog/<slug>/... (le slug demandé, celui de la branche
  // blog-draft/<slug>). Un écart entre les deux casserait l'URL de
  // l'image de l'article publié.
  if (frontmatter.slug !== slug) {
    return { status: "slug_mismatch", slug };
  }

  // Le schéma des articles publiés (lib/blog.ts) exige coverImage/
  // coverImageAlt — contrairement au brouillon, qui peut en être dépourvu
  // tant que la génération d'image est en bypass. Publier sans image
  // produirait un article dont le rendu (app/blog/[slug]/page.tsx,
  // PostJsonLd) est cassé silencieusement. On vérifie à la fois le
  // frontmatter (référence textuelle) ET le blob réel (draft.coverImage) :
  // un frontmatter qui promet une image dont le fichier a disparu/est
  // corrompu sur la branche ne doit pas non plus passer.
  if (!frontmatter.coverImage || !draft.coverImage) {
    return { status: "missing_cover_image", slug };
  }

  const { commitUrl } = await deps.github.publishDraft({
    slug,
    commitMessage: `blog: publication "${frontmatter.title}" (approuvé via Discord)`,
  });

  return { status: "published", slug, title: frontmatter.title, commitUrl };
}
