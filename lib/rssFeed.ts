import type { PostMeta } from "@/lib/blog";

const BASE_URL = "https://elancestvous.fr";
const FEED_TITLE = "Élan C'est Vous — Blog";
const FEED_DESCRIPTION =
  "Conseils, retours d'expérience et ressources sur la QVCT, la prévention des RPS et le coaching des professionnels de santé.";

// Le titre/la description d'un article viennent du frontmatter généré par
// IA (services/blog/), pas d'une saisie de confiance — échapper avant de
// les insérer dans du XML plutôt que de leur faire confiance.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// L'appelant décide de l'ordre (getAllPostsMeta trie déjà du plus récent au
// plus ancien) : cette fonction ne fait que sérialiser en XML.
export function buildRssFeed(posts: PostMeta[]): string {
  const items = posts
    .map((post) => {
      const link = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;
}
