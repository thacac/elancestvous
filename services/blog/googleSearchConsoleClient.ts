import { google } from "googleapis";

import type { GscPageQueryRow } from "./searchConsoleReport";

type SearchAnalyticsQueryParams = {
  siteUrl: string;
  requestBody: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    dimensionFilterGroups: Array<{
      filters: Array<{ dimension: string; operator: string; expression: string }>;
    }>;
    rowLimit: number;
    startRow: number;
  };
};

type SearchAnalyticsQueryResult = {
  data: {
    rows?: Array<{
      keys: string[];
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };
};

type SearchAnalyticsQueryFn = (
  params: SearchAnalyticsQueryParams
) => Promise<SearchAnalyticsQueryResult>;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Le compte de service Google est injectable via `queryImpl` (mêmes tests
// que `rssFeedFetcher.ts`/`discordNotifier.ts` : DI plutôt que mock du SDK)
// — seule la fabrique par défaut ci-dessous parle réellement au réseau/à
// l'auth Google, jamais couverte en test unitaire.
// Maximum autorisé par l'API Search Analytics pour un seul appel — au-delà,
// la réponse serait silencieusement tronquée sans erreur ni curseur, d'où la
// pagination par `startRow` ci-dessous plutôt qu'un seul appel à ce plafond.
const DEFAULT_ROW_LIMIT = 25_000;

export function createGoogleSearchConsoleClient(options: {
  serviceAccountJson: string;
  siteUrl: string;
  queryImpl?: SearchAnalyticsQueryFn;
  rowLimit?: number;
}) {
  const queryImpl = options.queryImpl ?? defaultQueryImpl(options.serviceAccountJson);
  const rowLimit = options.rowLimit ?? DEFAULT_ROW_LIMIT;

  return {
    async fetchBlogPageQueryRows(rangeDays: number): Promise<GscPageQueryRow[]> {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000);

      const allRows: GscPageQueryRow[] = [];
      let startRow = 0;
      // L'API ne renvoie ni total ni curseur : une page pleine (== rowLimit)
      // est le seul signal qu'il peut en rester d'autres.
      for (;;) {
        const response = await queryImpl({
          siteUrl: options.siteUrl,
          requestBody: {
            startDate: toDateString(startDate),
            endDate: toDateString(endDate),
            dimensions: ["page", "query"],
            dimensionFilterGroups: [
              {
                filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }],
              },
            ],
            rowLimit,
            startRow,
          },
        });

        const rows = response.data.rows ?? [];
        allRows.push(
          ...rows.map((row) => ({
            page: row.keys[0],
            query: row.keys[1],
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          }))
        );

        if (rows.length < rowLimit) break;
        startRow += rowLimit;
      }

      return allRows;
    },
  };
}

// Le secret est stocké encodé en base64, jamais en JSON brut : la clé privée
// RSA d'un compte de service contient des `\n` échappés sur une seule ligne
// très longue, ce qu'un copier-coller (GitHub, éditeur, lecteur PDF...) peut
// corrompre silencieusement (retours à la ligne réintroduits, espaces
// injectés dans le base64 de la clé) — deux incidents réels rencontrés en
// configurant ce secret. Le base64 traverse ces outils sans dommage.
export function parseServiceAccountJson(base64: string): Record<string, unknown> {
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  try {
    return JSON.parse(decoded);
  } catch (err) {
    throw new Error(
      `GSC_SERVICE_ACCOUNT_JSON invalide une fois décodé en base64 (${(err as Error).message}) — ` +
        "vérifier qu'il contient bien le fichier JSON du compte de service encodé en base64, pas le JSON brut."
    );
  }
}

function defaultQueryImpl(serviceAccountJson: string): SearchAnalyticsQueryFn {
  const credentials = parseServiceAccountJson(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const searchconsole = google.searchconsole({ version: "v1", auth });
  return async (params) =>
    searchconsole.searchanalytics.query(params) as unknown as Promise<SearchAnalyticsQueryResult>;
}
