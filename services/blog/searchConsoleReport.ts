import type { PostMeta } from "@/lib/blog";
import type { PillarId } from "@/services/blog/pillars";

export type GscPageQueryRow = {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type ArticleQueryStat = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type ArticleDelta = {
  clicks: number;
  impressions: number;
  position: number;
};

export type ArticleReportEntry = {
  slug: string;
  pillar: PillarId | null;
  tags: string[];
  publishedAt: string;
  clicks: number;
  impressions: number;
  position: number;
  topQueries: ArticleQueryStat[];
  diagnostics: string[];
  delta: ArticleDelta | null;
};

export type PillarAggregate = {
  pillar: PillarId;
  articleCount: number;
  clicks: number;
  impressions: number;
  position: number;
};

export type SearchConsoleReport = {
  generatedAt: string;
  rangeDays: number;
  siteUrl: string;
  articles: ArticleReportEntry[];
  byPillar: PillarAggregate[];
};

function slugFromPageUrl(pageUrl: string): string | null {
  const path = new URL(pageUrl).pathname;
  const match = path.match(/^\/blog\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function weightedAveragePosition(rows: { position: number; impressions: number }[]): number {
  const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  if (totalImpressions === 0) return 0;
  const weighted = rows.reduce((sum, r) => sum + r.position * r.impressions, 0);
  return weighted / totalImpressions;
}

// Seuils numériques objectifs uniquement — pas de jugement qualitatif
// (ex. "la requête ne correspond pas au sujet de l'article") qu'une simple
// comparaison de chaînes rendrait peu fiable. Ce jugement-là se fait en
// relisant `topQueries` dans le JSON, pas en le codant en dur ici.
function computeDiagnostics(article: {
  impressions: number;
  ctr: number;
  position: number;
}): string[] {
  const diagnostics: string[] = [];
  if (article.impressions === 0) {
    diagnostics.push("ZERO_IMPRESSIONS");
    return diagnostics;
  }
  if (article.position <= 10 && article.ctr < 0.02) {
    diagnostics.push("LOW_CTR_TOP10");
  }
  if (article.position > 30) {
    diagnostics.push("POOR_POSITION");
  }
  return diagnostics;
}

export function buildSearchConsoleReport(args: {
  generatedAt: string;
  rangeDays: number;
  siteUrl: string;
  rows: GscPageQueryRow[];
  posts: PostMeta[];
  previousReport: SearchConsoleReport | null;
}): SearchConsoleReport {
  const rowsBySlug = new Map<string, GscPageQueryRow[]>();
  for (const row of args.rows) {
    const slug = slugFromPageUrl(row.page);
    if (!slug) continue;
    const existing = rowsBySlug.get(slug) ?? [];
    existing.push(row);
    rowsBySlug.set(slug, existing);
  }

  const previousBySlug = new Map(
    (args.previousReport?.articles ?? []).map((a) => [a.slug, a] as const)
  );

  const articles: ArticleReportEntry[] = args.posts.map((post) => {
    const rows = rowsBySlug.get(post.slug) ?? [];
    const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
    const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
    const position = weightedAveragePosition(rows);
    const ctr = impressions > 0 ? clicks / impressions : 0;

    const topQueries: ArticleQueryStat[] = [...rows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .map((r) => ({
        query: r.query,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      }));

    const previous = previousBySlug.get(post.slug);
    const delta: ArticleDelta | null = previous
      ? {
          clicks: clicks - previous.clicks,
          impressions: impressions - previous.impressions,
          position: position - previous.position,
        }
      : null;

    return {
      slug: post.slug,
      pillar: post.pillar,
      tags: post.tags,
      publishedAt: post.publishedAt,
      clicks,
      impressions,
      position,
      topQueries,
      diagnostics: computeDiagnostics({ impressions, ctr, position }),
      delta,
    };
  });

  const byPillarMap = new Map<PillarId, { articleCount: number; clicks: number; impressions: number; positions: number[] }>();
  for (const article of articles) {
    if (!article.pillar) continue;
    const entry = byPillarMap.get(article.pillar) ?? {
      articleCount: 0,
      clicks: 0,
      impressions: 0,
      positions: [],
    };
    entry.articleCount += 1;
    entry.clicks += article.clicks;
    entry.impressions += article.impressions;
    if (article.impressions > 0) entry.positions.push(article.position);
    byPillarMap.set(article.pillar, entry);
  }

  const byPillar: PillarAggregate[] = Array.from(byPillarMap.entries()).map(
    ([pillar, entry]) => ({
      pillar,
      articleCount: entry.articleCount,
      clicks: entry.clicks,
      impressions: entry.impressions,
      position:
        entry.positions.length > 0
          ? entry.positions.reduce((sum, p) => sum + p, 0) / entry.positions.length
          : 0,
    })
  );

  return {
    generatedAt: args.generatedAt,
    rangeDays: args.rangeDays,
    siteUrl: args.siteUrl,
    articles,
    byPillar,
  };
}
