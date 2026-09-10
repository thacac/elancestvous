import type { SearchConsoleReport } from "./searchConsoleReport";

export type ReportEmbedField = { name: string; value: string };
export type ReportEmbed = {
  title: string;
  color: number;
  timestamp: string;
  fields: ReportEmbedField[];
};

// Discord refuse un embed dont un champ `value` dépasse 1024 caractères (400
// à l'envoi) — sans ça, le script échouerait à poster dès qu'assez d'articles
// sont publiés, alors que le JSON (déjà écrit sur disque à ce stade) reste
// complet, lui.
const EMBED_FIELD_VALUE_MAX = 1024;
const BRAND_COLOR = 0x29b5ad;
const PILLAR_LABELS: Record<string, string> = {
  A: "Coaching individuel",
  B: "Coaching en établissement",
  C: "QVCT / RPS",
  D: "GAPP",
};

function formatDelta(value: number): string {
  if (value === 0) return "";
  return value > 0 ? ` (+${value.toFixed(1)})` : ` (${value.toFixed(1)})`;
}

function renderPillarField(pillar: SearchConsoleReport["byPillar"][number]) {
  const label = PILLAR_LABELS[pillar.pillar] ?? pillar.pillar;
  return {
    name: `Pilier ${pillar.pillar} — ${label}`,
    value: [
      `${pillar.articleCount} article(s)`,
      `${pillar.clicks} clics`,
      `${pillar.impressions} impressions`,
      `position moy. ${pillar.position.toFixed(1)}`,
    ].join(" · "),
  };
}

// Inclut les lignes une à une tant que le budget le permet, en réservant à
// chaque étape la place d'une éventuelle note finale ("… +N autres") — évite
// de dépasser `max` de justesse sur la toute dernière ligne ajoutée.
function fitLinesToBudget(lines: string[], max: number, note: (omitted: number) => string): string[] {
  const kept: string[] = [];
  let usedLength = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = (kept.length > 0 ? 1 : 0) + lines[i].length;
    const remainingAfterThis = lines.length - (i + 1);
    const reserveForNote = remainingAfterThis > 0 ? 1 + note(remainingAfterThis).length : 0;
    if (usedLength + lineLength + reserveForNote > max) break;
    kept.push(lines[i]);
    usedLength += lineLength;
  }
  const omittedCount = lines.length - kept.length;
  return omittedCount > 0 ? [...kept, note(omittedCount)] : kept;
}

const omittedArticlesNote = (n: number) => `… +${n} autres (voir le JSON du rapport)`;

function renderArticlesTable(articles: SearchConsoleReport["articles"]) {
  const sorted = [...articles].sort((a, b) => b.impressions - a.impressions);
  const rows = sorted.map((article) => {
    const deltaClicks = article.delta ? formatDelta(article.delta.clicks) : "";
    const deltaImpressions = article.delta ? formatDelta(article.delta.impressions) : "";
    return `${article.slug.padEnd(40).slice(0, 40)} clics=${article.clicks}${deltaClicks} impr=${article.impressions}${deltaImpressions} pos=${article.position.toFixed(1)}`;
  });
  const fenceOverhead = "```".length * 2 + 2; // deux clôtures + deux retours à la ligne
  const kept = fitLinesToBudget(rows, EMBED_FIELD_VALUE_MAX - fenceOverhead, omittedArticlesNote);
  return ["```", ...kept, "```"].join("\n");
}

export function renderSearchConsoleReportEmbed(report: SearchConsoleReport): ReportEmbed[] {
  const pillarFields = report.byPillar.map(renderPillarField);

  const flaggedArticles = report.articles.filter((a) => a.diagnostics.length > 0);
  const diagnosticsField =
    flaggedArticles.length > 0
      ? [
          {
            name: "⚠️ À surveiller",
            value: fitLinesToBudget(
              flaggedArticles.map((a) => `${a.slug} : ${a.diagnostics.join(", ")}`),
              EMBED_FIELD_VALUE_MAX,
              (n) => `… +${n} autres (voir le JSON du rapport)`
            ).join("\n"),
          },
        ]
      : [];

  const articlesField =
    report.articles.length > 0
      ? [{ name: "Articles", value: renderArticlesTable(report.articles) }]
      : [];

  return [
    {
      title: `📊 Rapport Search Console — blog (${report.rangeDays} derniers jours)`,
      color: BRAND_COLOR,
      timestamp: report.generatedAt,
      fields: [...pillarFields, ...articlesField, ...diagnosticsField],
    },
  ];
}
