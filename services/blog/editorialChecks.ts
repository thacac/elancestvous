import { SITE } from "@/lib/siteIdentifiers";

import { PILLARS } from "./pillars";

// Pages de service disponibles pour le maillage interne article → service
// (#74) : dérivées de PILLARS (services/blog/pillars.ts), seule source de
// vérité déjà utilisée pour les liens ciblés par thème — pas de liste
// dupliquée qui risquerait de diverger.
const SERVICE_PAGE_PATHS = PILLARS.map((p) => p.targetPage);

// Autorise un lien absolu vers le domaine du site (avec ou sans "www.") en
// plus d'un lien relatif — dérivé de SITE (lib/siteIdentifiers.ts) plutôt que
// recopié, pour ne pas diverger si le domaine canonique change un jour.
const SITE_ORIGIN_PATTERN = new RegExp(`^https?://(www\\.)?${new URL(SITE).host.replace(/\./g, "\\.")}`, "i");

function extractLinkTargets(bodyMarkdown: string): string[] {
  return [...bodyMarkdown.matchAll(/\]\(([^)\s]+)/g)].map((match) => match[1]);
}

// Tolère les variations plausibles côté modèle (barre oblique finale,
// préfixe "www.") sans les traiter comme un lien absent — un faux négatif
// signalerait à tort un article qui pointe pourtant bien vers la bonne page.
function normalizeLinkPath(target: string): string {
  const withoutOrigin = target.replace(SITE_ORIGIN_PATTERN, "");
  const path = withoutOrigin.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function isServicePageLink(target: string): boolean {
  return SERVICE_PAGE_PATHS.includes(normalizeLinkPath(target));
}

// Vérification éditoriale (#74) : SYSTEM_PROMPT exige un lien Markdown vers
// une page de service, mais une consigne de prompt n'est jamais une garantie
// à 100 % côté modèle — ce contrôle signale un brouillon qui n'en contient
// aucun avant la validation Discord, plutôt que de faire confiance
// aveuglément à la génération.
export function hasServiceLink(bodyMarkdown: string): boolean {
  return extractLinkTargets(bodyMarkdown).some(isServicePageLink);
}
