/**
 * Audit Search Console ponctuel — lancé par le workflow manuel
 * `.github/workflows/seo-gsc-audit.yml` (bouton « Run workflow »).
 *
 * Pour chaque URL du sitemap de production : état d'indexation (API URL
 * Inspection), canonical retenu par Google, blocage robots.txt, dernier
 * crawl ; plus les performances de recherche de toutes les pages et l'état
 * des sitemaps soumis. Écrit `<date>.json` et `<date>.md` dans OUTPUT_DIR
 * (défaut : seo-gsc-audit-output/, ignoré par git) — le workflow les publie
 * en artefact et dans le résumé du run, rien n'est committé.
 *
 * Usage : yarn seo:gsc-audit [rangeDays=90]
 * Requiert GSC_SERVICE_ACCOUNT_JSON et GSC_SITE_URL (mêmes secrets que
 * yarn blog:search-console-report). SITEMAP_URL optionnel.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildGscAuditReport, parseSitemapUrls, renderGscAuditMarkdown } from "../services/seo/gscAudit";
import { createGscAuditClient } from "../services/seo/gscAuditClient";

const DEFAULT_RANGE_DAYS = 90;
const DEFAULT_SITEMAP_URL = "https://elancestvous.fr/sitemap.xml";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

async function main() {
  const rangeDays = Number(process.argv[2]) || DEFAULT_RANGE_DAYS;
  const siteUrl = requireEnv("GSC_SITE_URL");
  const sitemapUrl = process.env.SITEMAP_URL || DEFAULT_SITEMAP_URL;
  const outputDir = path.resolve(process.env.OUTPUT_DIR || "seo-gsc-audit-output");

  const sitemapResponse = await fetch(sitemapUrl);
  if (!sitemapResponse.ok) {
    throw new Error(`Sitemap inaccessible (${sitemapResponse.status}) : ${sitemapUrl}`);
  }
  const sitemapUrls = parseSitemapUrls(await sitemapResponse.text());
  console.log(`${sitemapUrls.length} URLs lues dans ${sitemapUrl}`);

  const client = createGscAuditClient({
    serviceAccountJson: requireEnv("GSC_SERVICE_ACCOUNT_JSON"),
    siteUrl,
  });

  const [rows, sitemaps, inspections] = await Promise.all([
    client.fetchAllPageQueryRows(rangeDays),
    client.listSitemaps(),
    client.inspectUrls(sitemapUrls),
  ]);

  const report = buildGscAuditReport({
    generatedAt: new Date().toISOString(),
    siteUrl,
    rangeDays,
    sitemapUrls,
    inspections,
    rows,
    sitemaps,
  });

  await mkdir(outputDir, { recursive: true });
  const base = path.join(outputDir, report.generatedAt.slice(0, 10));
  await writeFile(`${base}.json`, JSON.stringify(report, null, 2));
  await writeFile(`${base}.md`, renderGscAuditMarkdown(report));
  console.log(`Rapport écrit : ${base}.json et ${base}.md`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
