import { pickNextPillar, type Pillar, type PillarId } from "./pillars";

import type { FeedItem } from "./rssFeedFetcher";

export type ActualiteCandidate = {
  title: string;
  summary: string;
  sourceUrl: string;
  pillar: Pillar;
};

// Clause obligatoire (mitigation 4, #66) : le contenu réglementaire/légal n'a
// pas d'équivalent au renvoi santé déjà imposé par SYSTEM_PROMPT — une
// interprétation erronée présentée avec assurance est un risque réputationnel
// direct. Verbatim, injectée par anthropicDraftGenerator.ts.
export const LEGAL_DISCLAIMER =
  "Ceci n'est pas un conseil juridique : vérifiez les informations auprès de la source officielle citée ou d'un professionnel du droit.";

export function createActualiteWatch(options: {
  sources: string[];
  fetchFeedItems: (sourceUrl: string) => Promise<FeedItem[]>;
}) {
  return {
    async findActualite(
      alreadyCitedUrls: string[],
      recentPillars: PillarId[]
    ): Promise<ActualiteCandidate | null> {
      if (options.sources.length === 0) return null;

      // Une source en panne (réseau, flux mal formé côté fournisseur) ne doit
      // pas faire échouer toute la génération hebdomadaire — on l'écarte et
      // on continue avec les autres, plutôt que de propager l'erreur.
      const results = await Promise.allSettled(
        options.sources.map((source) => options.fetchFeedItems(source))
      );
      const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

      const excluded = new Set(alreadyCitedUrls);
      const eligible = items.filter((candidateItem) => !excluded.has(candidateItem.url));
      if (eligible.length === 0) return null;

      const mostRecent = eligible.reduce((best, current) =>
        timestampOf(current.publishedAt) > timestampOf(best.publishedAt) ? current : best
      );

      return {
        title: mostRecent.title,
        summary: mostRecent.summary,
        sourceUrl: mostRecent.url,
        // Un sujet d'actualité reste rattaché au même tourniquet pondéré que
        // #52 (mitigation 3, #66) : sans ça, la veille annulerait
        // silencieusement le ratio métier entre piliers dès qu'elle trouve
        // "quelque chose" la plupart des semaines.
        pillar: pickNextPillar(recentPillars),
      };
    },
  };
}

function timestampOf(publishedAt: string): number {
  const parsed = Date.parse(publishedAt);
  // Une date manquante/invalide ne doit jamais gagner par défaut face à une
  // date valide — traitée comme "la plus ancienne possible" plutôt que NaN
  // (qui rendrait toute comparaison fausse).
  return Number.isNaN(parsed) ? -Infinity : parsed;
}
