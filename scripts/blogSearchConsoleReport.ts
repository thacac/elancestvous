/**
 * Outil manuel (issue #57) — croise les métriques Search Console des pages
 * /blog/* avec le pilier/tags déclarés en frontmatter (services/blog/
 * searchConsoleReport.ts), écrit un JSON daté versionné (historique pour
 * une future décision de repondération du tourniquet de piliers, #52) et
 * poste un résumé dans Discord (services/blog/searchConsoleReportEmbed.ts).
 *
 * Usage : yarn blog:search-console-report [rangeDays=90]
 * Requiert GSC_SERVICE_ACCOUNT_JSON, GSC_SITE_URL, DISCORD_BOT_TOKEN,
 * DISCORD_CHANNEL_ID dans l'environnement (DISCORD_SEO_REPORT_CHANNEL_ID
 * optionnel — cf. .env.example).
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllPostsMeta } from "@/lib/blog";

import { createDiscordNotifier } from "../services/blog/discordNotifier";
import { createGoogleSearchConsoleClient } from "../services/blog/googleSearchConsoleClient";
import { buildSearchConsoleReport } from "../services/blog/searchConsoleReport";
import { renderSearchConsoleReportEmbed } from "../services/blog/searchConsoleReportEmbed";

import type { SearchConsoleReport } from "../services/blog/searchConsoleReport";

const REPORTS_DIR = path.join(process.cwd(), "docs", "blog-search-console-reports");
const DEFAULT_RANGE_DAYS = 90;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

// Le nom de fichier est la date ISO du run (ex. 2026-09-10.json) : le tri
// alphabétique suffit donc à retrouver le rapport le plus récent, sans avoir
// à parser chaque fichier pour lire `generatedAt`.
async function loadPreviousReport(): Promise<SearchConsoleReport | null> {
  await mkdir(REPORTS_DIR, { recursive: true });
  const files = (await readdir(REPORTS_DIR)).filter((f) => f.endsWith(".json")).sort();
  const latest = files.at(-1);
  if (!latest) return null;
  const raw = await readFile(path.join(REPORTS_DIR, latest), "utf8");
  return JSON.parse(raw) as SearchConsoleReport;
}

async function main() {
  const rangeDays = Number(process.argv[2]) || DEFAULT_RANGE_DAYS;

  const gscClient = createGoogleSearchConsoleClient({
    serviceAccountJson: requireEnv("GSC_SERVICE_ACCOUNT_JSON"),
    siteUrl: requireEnv("GSC_SITE_URL"),
  });

  const [rows, previousReport] = await Promise.all([
    gscClient.fetchBlogPageQueryRows(rangeDays),
    loadPreviousReport(),
  ]);

  const report = buildSearchConsoleReport({
    generatedAt: new Date().toISOString(),
    rangeDays,
    siteUrl: requireEnv("GSC_SITE_URL"),
    rows,
    posts: getAllPostsMeta(),
    previousReport,
  });

  const reportFile = path.join(REPORTS_DIR, `${report.generatedAt.slice(0, 10)}.json`);
  await writeFile(reportFile, JSON.stringify(report, null, 2));
  console.log(`Rapport écrit : ${reportFile}`);

  const notifier = createDiscordNotifier({
    botToken: requireEnv("DISCORD_BOT_TOKEN"),
    channelId: requireEnv("DISCORD_CHANNEL_ID"),
    seoReportChannelId: process.env.DISCORD_SEO_REPORT_CHANNEL_ID || undefined,
  });
  await notifier.notifySearchConsoleReport(renderSearchConsoleReportEmbed(report));
  console.log("Rapport posté sur Discord.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
