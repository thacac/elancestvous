import { google } from "googleapis";

import { parseServiceAccountJson } from "@/services/blog/googleSearchConsoleClient";

import { summarizeInspection } from "./gscAudit";

import type { GscPageRow, InspectionSummary, SitemapStatus, UrlInspectionResponse } from "./gscAudit";
import type { GscPageQueryRow } from "@/services/blog/searchConsoleReport";

type SearchAnalyticsQueryParams = {
  siteUrl: string;
  requestBody: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    rowLimit: number;
    startRow: number;
  };
};

type SearchAnalyticsQueryFn = (params: SearchAnalyticsQueryParams) => Promise<{
  data: {
    rows?: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  };
}>;

type InspectFn = (params: {
  requestBody: { inspectionUrl: string; siteUrl: string; languageCode: string };
}) => Promise<{ data: UrlInspectionResponse }>;

type SitemapsListFn = (params: { siteUrl: string }) => Promise<{
  data: {
    sitemap?: Array<{
      path?: string | null;
      lastSubmitted?: string | null;
      lastDownloaded?: string | null;
      isPending?: boolean | null;
      // L'API renvoie ces compteurs en chaînes (int64 sérialisé).
      errors?: string | number | null;
      warnings?: string | number | null;
    }>;
  };
}>;

// Plafond de l'API Search Analytics par appel (cf. googleSearchConsoleClient.ts).
const DEFAULT_ROW_LIMIT = 25_000;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Client Search Console de l'audit SEO. Mêmes principes que
 * services/blog/googleSearchConsoleClient.ts : appels injectables (DI) pour
 * les tests, seule la fabrique par défaut parle au réseau. Scope lecture
 * seule : suffisant pour Search Analytics, URL Inspection et sitemaps.list.
 */
export function createGscAuditClient(options: {
  serviceAccountJson: string;
  siteUrl: string;
  queryImpl?: SearchAnalyticsQueryFn;
  inspectImpl?: InspectFn;
  sitemapsListImpl?: SitemapsListFn;
  rowLimit?: number;
}) {
  const needsDefault = !options.queryImpl || !options.inspectImpl || !options.sitemapsListImpl;
  const defaults = needsDefault ? defaultImpls(options.serviceAccountJson) : null;
  const queryImpl = options.queryImpl ?? defaults!.queryImpl;
  const inspectImpl = options.inspectImpl ?? defaults!.inspectImpl;
  const sitemapsListImpl = options.sitemapsListImpl ?? defaults!.sitemapsListImpl;
  const rowLimit = options.rowLimit ?? DEFAULT_ROW_LIMIT;

  type ApiRow = NonNullable<Awaited<ReturnType<SearchAnalyticsQueryFn>>["data"]["rows"]>[number];

  // Pagination par startRow : l'API ne renvoie ni total ni curseur, une page
  // pleine (== rowLimit) est le seul signal qu'il en reste.
  async function queryAll(rangeDays: number, dimensions: string[]): Promise<ApiRow[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const allRows: ApiRow[] = [];
    let startRow = 0;
    for (;;) {
      const response = await queryImpl({
        siteUrl: options.siteUrl,
        requestBody: {
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
          dimensions,
          rowLimit,
          startRow,
        },
      });
      const rows = response.data.rows ?? [];
      allRows.push(...rows);
      if (rows.length < rowLimit) break;
      startRow += rowLimit;
    }
    return allRows;
  }

  return {
    async fetchAllPageQueryRows(rangeDays: number): Promise<GscPageQueryRow[]> {
      return (await queryAll(rangeDays, ["page", "query"])).map((row) => ({
        page: row.keys[0],
        query: row.keys[1],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));
    },

    // Totaux par page : la dimension `query` omettrait les requêtes
    // anonymisées (rares) et sous-estimerait les impressions.
    async fetchPageTotals(rangeDays: number): Promise<GscPageRow[]> {
      return (await queryAll(rangeDays, ["page"])).map((row) => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));
    },

    // Séquentiel volontairement : quota URL Inspection de 600 requêtes/min,
    // et une vingtaine d'URLs seulement — aucun gain à paralléliser.
    async inspectUrls(urls: string[]): Promise<InspectionSummary[]> {
      const results: InspectionSummary[] = [];
      for (const url of urls) {
        try {
          const response = await inspectImpl({
            requestBody: { inspectionUrl: url, siteUrl: options.siteUrl, languageCode: "fr-FR" },
          });
          results.push(summarizeInspection(url, response.data));
        } catch (err) {
          results.push({ ...summarizeInspection(url, {}), error: (err as Error).message });
        }
      }
      return results;
    },

    async listSitemaps(): Promise<SitemapStatus[]> {
      const response = await sitemapsListImpl({ siteUrl: options.siteUrl });
      return (response.data.sitemap ?? []).map((s) => ({
        path: s.path ?? "",
        lastSubmitted: s.lastSubmitted ?? null,
        lastDownloaded: s.lastDownloaded ?? null,
        isPending: s.isPending ?? false,
        errors: Number(s.errors ?? 0),
        warnings: Number(s.warnings ?? 0),
      }));
    },
  };
}

function defaultImpls(serviceAccountJson: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: parseServiceAccountJson(serviceAccountJson),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const searchconsole = google.searchconsole({ version: "v1", auth });
  const queryImpl = (params: SearchAnalyticsQueryParams) =>
    searchconsole.searchanalytics.query(params);
  const inspectImpl = (params: Parameters<InspectFn>[0]) =>
    searchconsole.urlInspection.index.inspect(params);
  const sitemapsListImpl = (params: Parameters<SitemapsListFn>[0]) =>
    searchconsole.sitemaps.list(params);
  return {
    queryImpl: queryImpl as unknown as SearchAnalyticsQueryFn,
    inspectImpl: inspectImpl as unknown as InspectFn,
    sitemapsListImpl: sitemapsListImpl as unknown as SitemapsListFn,
  };
}
