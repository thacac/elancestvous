import { getAllPostsMeta } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";
import { PILLARS } from "@/services/blog/pillars";

export type RelatedArticleLink = {
  href: string;
  label: string;
};

// Borne le maillage retour pour qu'une page de service n'accumule pas des
// dizaines de liens au fil des semaines de publication.
const MAX_RELATED_ARTICLES = 3;

// Maillage retour (issue #72) : chaque article publié déclare le pilier
// qu'il couvre (services/blog/pillars.ts), qui pointe déjà vers la page de
// service la plus pertinente. Cette fonction fait le chemin inverse — pour
// une page de service donnée, retrouver les articles qui la ciblent — sans
// nouvelle association à maintenir : le frontmatter "pillar" existant en
// est la seule source de vérité.
export function getRelatedArticleLinks(
  targetPage: string,
  dir?: string
): RelatedArticleLink[] {
  // Tant que le blog n'est pas public, /blog/[slug] renvoie 404 (voir
  // lib/featureFlags.ts) : lier vers un article depuis une page de service
  // produirait un lien mort.
  if (!isBlogPublic()) return [];

  const pillar = PILLARS.find((p) => p.targetPage === targetPage);
  if (!pillar) return [];

  return getAllPostsMeta(dir)
    .filter((post) => post.pillar === pillar.id)
    .slice(0, MAX_RELATED_ARTICLES)
    .map((post) => ({ href: `/blog/${post.slug}`, label: post.title }));
}
