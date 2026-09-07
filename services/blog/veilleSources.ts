// Rend les sources de veille (#66) pilotables sans déploiement de code : une
// simple variable d'environnement (liste séparée par des virgules) plutôt
// qu'un fichier de config commité, tant que la décision définitive sur les
// sources (service-public.fr, légifrance.gouv.fr, ameli.fr...) reste ouverte.
export function parseVeilleSources(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((source) => source.trim())
    .filter((source) => source.length > 0);
}
