/**
 * Audit Search Console ponctuel (workflow `seo-gsc-audit.yml`) : croise, pour
 * chaque URL du sitemap de production, l'état d'indexation renvoyé par l'API
 * URL Inspection, les performances de recherche (toutes pages, pas seulement
 * /blog/ comme le rapport mensuel de services/blog/searchConsoleReport.ts) et
 * l'état des sitemaps soumis.
 *
 * Fonctions pures uniquement — tout appel réseau vit dans gscAuditClient.ts.
 */
import type { GscPageQueryRow } from "@/services/blog/searchConsoleReport";

// Sous-ensemble de la réponse `urlInspection.index.inspect` utile au
// diagnostic (https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect).
export type UrlInspectionResponse = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string | null;
      coverageState?: string | null;
      robotsTxtState?: string | null;
      indexingState?: string | null;
      pageFetchState?: string | null;
      lastCrawlTime?: string | null;
      crawledAs?: string | null;
      googleCanonical?: string | null;
      userCanonical?: string | null;
      sitemap?: string[] | null;
      referringUrls?: string[] | null;
    } | null;
  } | null;
};

export type InspectionSummary = {
  url: string;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  pageFetchState: string | null;
  lastCrawlTime: string | null;
  crawledAs: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  canonicalMismatch: boolean;
  inSitemap: boolean;
  referringUrls: string[];
  error: string | null;
};

export type SitemapStatus = {
  path: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  errors: number;
  warnings: number;
};

export type QueryPerformance = {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
};

export type PagePerformance = {
  page: string;
  clicks: number;
  impressions: number;
  position: number;
  topQueries: QueryPerformance[];
};

// Ligne Search Analytics agrégée par page seule (dimensions: ["page"]).
export type GscPageRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscAuditReport = {
  generatedAt: string;
  siteUrl: string;
  rangeDays: number;
  summary: {
    sitemapUrlCount: number;
    indexedCount: number;
    notIndexed: string[];
    canonicalMismatches: string[];
    blockedByRobots: string[];
    inspectionErrors: string[];
    withoutImpressions: string[];
    pagesOutsideSitemap: string[];
  };
  sitemaps: SitemapStatus[];
  // Sources de données en échec (Search Analytics, sitemaps.list) : le
  // rapport est produit quand même avec ce qui a pu être récupéré.
  sourceErrors: string[];
  pages: Array<InspectionSummary & { performance: PagePerformance | null }>;
  pagesOutsideSitemap: PagePerformance[];
};

const TOP_QUERIES_PER_PAGE = 5;
const DEFAULT_RANGE_DAYS = 90;
// Search Console conserve 16 mois d'historique : 480 jours reste en deçà.
const MAX_RANGE_DAYS = 480;

export function parseRangeDays(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return DEFAULT_RANGE_DAYS;
  const days = Number(value);
  if (!Number.isInteger(days) || days < 1 || days > MAX_RANGE_DAYS) {
    throw new Error(
      `Période invalide (« ${value} ») : un nombre entier de jours entre 1 et ${MAX_RANGE_DAYS} est attendu.`
    );
  }
  return days;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function parseSitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => decodeXmlEntities(m[1]));
}

// Le sitemap déclare l'accueil sans slash final (`https://elancestvous.fr`),
// Search Console le renvoie avec (`https://elancestvous.fr/`), et parfois
// avec une ancre (liens « aller à ») qui désigne la même page.
export function normalizePageUrl(url: string): string {
  return url.replace(/#.*$/, "").replace(/\/+$/, "");
}

export function summarizeInspection(url: string, response: UrlInspectionResponse): InspectionSummary {
  const status = response.inspectionResult?.indexStatusResult ?? {};
  const googleCanonical = status.googleCanonical ?? null;
  const userCanonical = status.userCanonical ?? null;
  // Sans canonical déclaré, la page est sa propre référence.
  const expectedCanonical = userCanonical ?? url;

  return {
    url,
    verdict: status.verdict ?? null,
    coverageState: status.coverageState ?? null,
    robotsTxtState: status.robotsTxtState ?? null,
    indexingState: status.indexingState ?? null,
    pageFetchState: status.pageFetchState ?? null,
    lastCrawlTime: status.lastCrawlTime ?? null,
    crawledAs: status.crawledAs ?? null,
    googleCanonical,
    userCanonical,
    // Pas de canonical Google = page jamais indexée, pas un désaccord.
    canonicalMismatch:
      googleCanonical !== null &&
      normalizePageUrl(googleCanonical) !== normalizePageUrl(expectedCanonical),
    inSitemap: (status.sitemap ?? []).length > 0,
    referringUrls: status.referringUrls ?? [],
    error: null,
  };
}

function totals(rows: Array<{ clicks: number; impressions: number; position: number }>) {
  const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const weightedPosition = rows.reduce((sum, r) => sum + r.position * r.impressions, 0);
  return {
    clicks,
    impressions,
    position: impressions > 0 ? Math.round((weightedPosition / impressions) * 10) / 10 : 0,
  };
}

function groupByPage<T extends { page: string }>(rows: T[]): Map<string, T[]> {
  const byPage = new Map<string, T[]>();
  for (const row of rows) {
    const page = normalizePageUrl(row.page);
    byPage.set(page, [...(byPage.get(page) ?? []), row]);
  }
  return byPage;
}

/**
 * Totaux par page tirés de `pageRows` (requête `dimensions: ["page"]`) : la
 * requête page+query omet les requêtes anonymisées, et sous-estimerait les
 * impressions, voire mettrait à 0 une page peu visitée. `queryRows` ne sert
 * qu'aux principales requêtes, et aux totaux d'une page absente de
 * `pageRows` (repli).
 */
export function aggregatePagePerformance(
  pageRows: GscPageRow[],
  queryRows: GscPageQueryRow[]
): PagePerformance[] {
  const totalsByPage = groupByPage(pageRows);
  const queriesByPage = groupByPage(queryRows);
  const pages = new Set([...totalsByPage.keys(), ...queriesByPage.keys()]);

  return [...pages]
    .map((page) => {
      const queries = queriesByPage.get(page) ?? [];
      return {
        page,
        ...totals(totalsByPage.get(page) ?? queries),
        topQueries: [...queries]
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, TOP_QUERIES_PER_PAGE)
          .map(({ query, clicks, impressions, position }) => ({ query, clicks, impressions, position })),
      };
    })
    .sort((a, b) => b.impressions - a.impressions);
}

export function buildGscAuditReport(input: {
  generatedAt: string;
  siteUrl: string;
  rangeDays: number;
  sitemapUrls: string[];
  inspections: InspectionSummary[];
  rows: GscPageQueryRow[];
  pageRows?: GscPageRow[];
  sitemaps: SitemapStatus[];
  sourceErrors?: string[];
}): GscAuditReport {
  const performance = aggregatePagePerformance(input.pageRows ?? [], input.rows);
  const perfByPage = new Map(performance.map((p) => [p.page, p]));
  const sitemapSet = new Set(input.sitemapUrls.map(normalizePageUrl));

  const pages = input.inspections.map((inspection) => ({
    ...inspection,
    performance: perfByPage.get(normalizePageUrl(inspection.url)) ?? null,
  }));
  const inspected = pages.filter((p) => p.error === null);
  const outside = performance.filter((p) => !sitemapSet.has(p.page));

  return {
    generatedAt: input.generatedAt,
    siteUrl: input.siteUrl,
    rangeDays: input.rangeDays,
    summary: {
      sitemapUrlCount: input.sitemapUrls.length,
      indexedCount: inspected.filter((p) => p.verdict === "PASS").length,
      notIndexed: inspected.filter((p) => p.verdict !== "PASS").map((p) => p.url),
      canonicalMismatches: inspected.filter((p) => p.canonicalMismatch).map((p) => p.url),
      blockedByRobots: inspected.filter((p) => p.robotsTxtState === "DISALLOWED").map((p) => p.url),
      inspectionErrors: pages.filter((p) => p.error !== null).map((p) => p.url),
      withoutImpressions: pages.filter((p) => !p.performance?.impressions).map((p) => p.url),
      pagesOutsideSitemap: outside.map((p) => p.page),
    },
    sitemaps: input.sitemaps,
    sourceErrors: input.sourceErrors ?? [],
    pages,
    pagesOutsideSitemap: outside,
  };
}

function path(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

export function renderGscAuditMarkdown(report: GscAuditReport): string {
  const { summary } = report;
  const lines: string[] = [
    `# Audit Search Console — ${report.generatedAt.slice(0, 10)}`,
    "",
    `Propriété : \`${report.siteUrl}\` — performances sur ${report.rangeDays} jours.`,
    "",
    "## Synthèse",
    "",
    `- Indexées : ${summary.indexedCount} / ${summary.sitemapUrlCount}`,
    `- Non indexées : ${summary.notIndexed.length}`,
    `- Canonical choisi par Google ≠ déclaré : ${summary.canonicalMismatches.length}`,
    `- Bloquées par robots.txt : ${summary.blockedByRobots.length}`,
    `- Sans impression : ${summary.withoutImpressions.length}`,
    `- Pages avec impressions hors sitemap : ${summary.pagesOutsideSitemap.length}`,
    `- Inspections en échec : ${summary.inspectionErrors.length}`,
    "",
    ...(report.sourceErrors.length > 0
      ? [
          "## ⚠️ Données incomplètes",
          "",
          ...report.sourceErrors.map((e) => `- ${e.replace(/\r?\n/g, " ")}`),
          "",
        ]
      : []),
    "## Sitemaps soumis",
    "",
  ];

  if (report.sitemaps.length === 0) {
    lines.push("Aucun sitemap soumis à Search Console.");
  } else {
    lines.push("| Sitemap | Soumis | Dernière lecture | Erreurs | Avertissements |", "|---|---|---|---|---|");
    for (const s of report.sitemaps) {
      lines.push(
        `| ${cell(s.path)} | ${cell(s.lastSubmitted?.slice(0, 10))} | ${cell(s.lastDownloaded?.slice(0, 10))} | ${s.errors} | ${s.warnings} |`
      );
    }
  }

  lines.push(
    "",
    "## URLs du sitemap",
    "",
    "| Page | Verdict | État de couverture | Dernier crawl | Robots | Canonical Google | Impr. | Clics | Pos. |",
    "|---|---|---|---|---|---|---|---|---|"
  );
  for (const p of report.pages) {
    const canonical = p.canonicalMismatch ? `⚠️ ${path(p.googleCanonical ?? "")}` : p.googleCanonical ? "OK" : null;
    lines.push(
      [
        "",
        cell(path(p.url)),
        cell(p.error ? `ERREUR : ${p.error}` : p.verdict),
        cell(p.coverageState),
        cell(p.lastCrawlTime?.slice(0, 10)),
        cell(p.robotsTxtState),
        cell(canonical),
        cell(p.performance?.impressions ?? 0),
        cell(p.performance?.clicks ?? 0),
        cell(p.performance?.position || null),
        "",
      ].join(" | ").trim()
    );
  }

  if (report.pagesOutsideSitemap.length > 0) {
    lines.push("", "## Pages avec impressions hors sitemap", "", "| Page | Impr. | Clics |", "|---|---|---|");
    for (const p of report.pagesOutsideSitemap) {
      lines.push(`| ${cell(p.page)} | ${p.impressions} | ${p.clicks} |`);
    }
  }

  const withQueries = report.pages.filter((p) => p.performance && p.performance.topQueries.length > 0);
  if (withQueries.length > 0) {
    lines.push("", "## Principales requêtes par page", "");
    for (const p of withQueries) {
      lines.push(`### ${path(p.url)}`, "", "| Requête | Impr. | Clics | Pos. |", "|---|---|---|---|");
      for (const q of p.performance!.topQueries) {
        lines.push(`| ${cell(q.query)} | ${q.impressions} | ${q.clicks} | ${Math.round(q.position * 10) / 10} |`);
      }
      lines.push("");
    }
  }

  return lines.join("\n") + "\n";
}
