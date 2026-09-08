import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
};

// ignoreAttributes: false pour lire link/@href sur Atom (RSS 2.0 n'a pas
// besoin des attributs, mais les deux formats partagent le même parseur).
const parser = new XMLParser({ ignoreAttributes: false });

export function parseFeedXml(xml: string): FeedItem[] {
  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch {
    // Flux mal formé ou contenu non-XML (ex. page d'erreur HTML renvoyée par
    // la source) : traité comme "aucun article" plutôt que de faire planter
    // toute la génération hebdomadaire pour une seule source défaillante.
    return [];
  }

  const rssItems = get(doc, ["rss", "channel", "item"]);
  if (rssItems !== undefined) {
    return toArray(rssItems)
      .map((item) => ({
        title: textOf(get(item, ["title"])),
        summary: textOf(get(item, ["description"])),
        url: textOf(get(item, ["link"])),
        publishedAt: textOf(get(item, ["pubDate"])),
      }))
      .filter((item) => item.url.length > 0);
  }

  const atomEntries = get(doc, ["feed", "entry"]);
  if (atomEntries !== undefined) {
    return toArray(atomEntries)
      .map((entry) => ({
        title: textOf(get(entry, ["title"])),
        summary: textOf(get(entry, ["summary"]) ?? get(entry, ["content"])),
        url: linkHrefOf(get(entry, ["link"])),
        publishedAt: textOf(get(entry, ["updated"]) ?? get(entry, ["published"])),
      }))
      .filter((item) => item.url.length > 0);
  }

  return [];
}

// Une source qui ne répond jamais (trou réseau, TLS qui traîne) plutôt que de
// renvoyer une erreur HTTP bloquerait sinon Promise.allSettled indéfiniment
// dans findActualite() (actualiteWatch.ts) — Promise.allSettled protège
// contre un rejet, pas contre une promesse qui ne se résout jamais.
const FETCH_TIMEOUT_MS = 10_000;

// Un flux RSS/Atom sans réseau (mock en test), hors ligne ou trop lent ne
// doit pas planter/bloquer toute la génération hebdomadaire pour une seule
// source indisponible — findActualite() (actualiteWatch.ts) écarte cette
// source et continue avec les autres plutôt que de propager l'erreur.
export function createRssFeedFetcher(
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = FETCH_TIMEOUT_MS
): (sourceUrl: string) => Promise<FeedItem[]> {
  return async function fetchFeedItems(sourceUrl: string): Promise<FeedItem[]> {
    const response = await fetchImpl(sourceUrl, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
      throw new Error(`Impossible de récupérer le flux de veille ${sourceUrl} (${response.status})`);
    }
    return parseFeedXml(await response.text());
  };
}

function get(value: unknown, path: string[]): unknown {
  let current = value;
  for (const key of path) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"]).trim();
  }
  return "";
}

// Un <entry> Atom porte fréquemment plusieurs <link> (rel="self",
// rel="related"...) en plus du seul qui compte ici, rel="alternate" (ou sans
// rel, qui vaut "alternate" par défaut dans la spec Atom) — fast-xml-parser
// renvoie alors un tableau plutôt qu'un objet unique, sur lequel l'ancienne
// version ne trouvait jamais @_href et perdait l'entrée silencieusement.
function linkHrefOf(value: unknown): string {
  const links = Array.isArray(value) ? value : [value];
  const alternate = links.find((link) => hrefOf(link).length > 0 && isAlternateRel(link));
  // Pas de repli sur le premier href venu (ex. rel="self", rel="related") si
  // aucun lien "alternate" n'existe : ce serait l'URL du flux lui-même, pas
  // celle de l'article — mieux vaut perdre l'entrée (filtrée en aval par
  // `.filter((item) => item.url.length > 0)`) qu'une URL trompeuse.
  return alternate ? hrefOf(alternate) : textOf(value);
}

function hrefOf(link: unknown): string {
  if (typeof link === "object" && link !== null && "@_href" in (link as Record<string, unknown>)) {
    return String((link as Record<string, unknown>)["@_href"]).trim();
  }
  return "";
}

function isAlternateRel(link: unknown): boolean {
  if (typeof link !== "object" || link === null || !("@_rel" in (link as Record<string, unknown>))) {
    return true; // pas de rel explicite : "alternate" par défaut (spec Atom).
  }
  return (link as Record<string, unknown>)["@_rel"] === "alternate";
}
