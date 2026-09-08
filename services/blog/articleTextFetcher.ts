// Contexte enrichi pour la veille actualité (#66) : le résumé RSS/Atom seul
// (souvent une ou deux phrases) force Claude à "rester général" plutôt qu'à
// citer des faits précis. Le texte intégral de la page source, une fois
// approuvée sur Discord, comble ce manque — mais le fetch est fait au clic
// "Approuver" (githubBlogRepo.ts::queueActualiteTopic), jamais à la
// génération elle-même : une source lente ou morte ne doit jamais retarder
// le cron hebdomadaire.
const FETCH_TIMEOUT_MS = 10_000;
// Borne défensive, même raisonnement que ACTUALITE_SUMMARY_MAX
// (anthropicDraftGenerator.ts) : une page anormalement volumineuse ne doit
// pas gonfler indéfiniment le prompt envoyé au modèle.
const ARTICLE_TEXT_MAX = 10_000;

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#\d+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity in HTML_ENTITIES) return HTML_ENTITIES[entity];
    if (entity.startsWith("#")) {
      const codePoint = Number(entity.slice(1));
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return match;
  });
}

// Extraction volontairement grossière (pas de lib type Readability) : une
// page avec paywall/contenu chargé en JS donnera un texte pauvre ou vide
// dans tous les cas, et Claude filtre déjà bien le bruit résiduel (nav,
// footer) d'un texte brut — inutile d'ajouter une dépendance fragile pour
// un contexte qui reste best-effort.
function stripHtml(html: string): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withoutTags = withoutNoise.replace(/<[^>]+>/g, " ");
  return decodeEntities(withoutTags).replace(/[ \t\f\v]+/g, " ").replace(/ *\n */g, "\n").trim();
}

function stripBrackets(host: string): string {
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
}

function isPrivateIPv4(host: string): boolean {
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  return (
    a === 127 || // loopback
    a === 10 || // private
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 169 && b === 254) || // link-local — couvre aussi les métadonnées cloud (169.254.169.254)
    a === 0 // adresse non spécifiée
  );
}

function isPrivateOrLoopbackHost(rawHost: string): boolean {
  const host = stripBrackets(rawHost).toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (isPrivateIPv4(host)) return true;
  // IPv6 : bouclage (::1), non spécifiée (::), lien-local (fe80::/10),
  // adresse locale unique (fc00::/7, préfixes fc/fd).
  if (host === "::1" || host === "::") return true;
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  return false;
}

// Garde-fou SSRF (#66) : sourceUrl vient d'un flux RSS/Atom externe non
// modéré — sans ce filtre, une source compromise ou anormale pourrait faire
// fetcher, depuis le serveur en production, une adresse interne (service de
// métadonnées cloud, admin local) puis en injecter le contenu dans le prompt
// envoyé à Claude. Filtre par IP/hostname littéral uniquement : ne protège
// pas d'un attaquant qui ferait résoudre un domaine public vers une IP
// interne (DNS rebinding) — risque résiduel accepté vu le contexte (clic
// humain explicite sur "Approuver" avant tout fetch, cf. queueApprovedActualite).
function isSafeToFetch(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  return !isPrivateOrLoopbackHost(parsed.hostname);
}

// Best-effort : ne lève jamais — une URL non sûre/mal formée, un échec
// réseau, un timeout, un statut HTTP en erreur ou une page sans texte
// extractible tombent tous sur le même repli côté appelant (résumé RSS déjà
// disponible), jamais sur un blocage.
export async function fetchArticleText(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<string | null> {
  if (!isSafeToFetch(url)) return null;
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    const text = stripHtml(await response.text());
    return text.length > 0 ? text.slice(0, ARTICLE_TEXT_MAX) : null;
  } catch {
    return null;
  }
}
