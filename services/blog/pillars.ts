export type PillarId = "A" | "B" | "C" | "D";

export type Pillar = {
  id: PillarId;
  label: string;
  targetPage: string;
  theme: string;
  weight: number;
};

// Poids repris du ratio du plan éditorial initial (docs/blog-plan-editorial.md
// §3 : "GAPP ×3, coaching établissements ×2, coaching individuel ×2,
// formations QVCT/RPS ×4") — préserve la priorité métier du calendrier
// abandonné plutôt qu'un tourniquet équitable entre les 4 piliers.
export const PILLARS: Pillar[] = [
  {
    id: "A",
    label: "Coaching individuel (particuliers)",
    targetPage: "/particuliers/coaching-individuel",
    theme:
      "Stress personnel, charge émotionnelle, transitions de vie/carrière, fonctionnement concret d'un accompagnement individuel.",
    weight: 2,
  },
  {
    id: "B",
    label: "Coaching en établissement",
    targetPage: "/professionnels-etablissements-de-soins/coaching",
    theme:
      "Coaching individuel et collectif pour cadres de santé, managers et équipes ; dynamiques d'équipe, posture managériale.",
    weight: 2,
  },
  {
    id: "C",
    label: "Formations QVCT / RPS",
    targetPage: "/professionnels-etablissements-de-soins/formations-rps-qvct",
    theme:
      "Prévention des RPS, QVCT, gestion du stress/des émotions, usure professionnelle.",
    weight: 4,
  },
  {
    id: "D",
    label: "GAPP",
    targetPage:
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    theme:
      "Définition et fonctionnement du GAPP, différenciation avec des dispositifs voisins (supervision), bénéfices dans la durée.",
    weight: 3,
  },
];

// Tuple non vide dérivé de PILLARS — seule source de vérité des ids valides,
// partagée par draftSchema.ts (sortie structurée de la génération) et
// lib/blog.ts (frontmatter des articles publiés, réutilisé comme cocon
// sémantique, cf. issue #73) pour éviter que les deux dérivations divergent.
export const PILLAR_IDS = PILLARS.map((p) => p.id) as [PillarId, ...PillarId[]];

export type PillarSuggestion = {
  pillar: Pillar;
  recentTags: string[];
  injectLocalAngle: boolean;
  // Présent uniquement quand le sujet de la semaine vient de la veille
  // actualité (#66) plutôt que de la rotation pondérée — anthropicDraftGenerator.ts
  // injecte alors les faits vérifiables (résumé + source) à la place du thème
  // générique du pilier, et generateDraft.ts reporte sourceUrl dans le
  // frontmatter publié pour le dédoublonnage des sources déjà citées.
  actualite?: {
    title: string;
    summary: string;
    sourceUrl: string;
    // Texte intégral de la page source (best-effort, récupéré au clic
    // "Approuver" sur Discord — cf. services/blog/articleTextFetcher.ts),
    // pour un contexte bien plus riche que le seul résumé RSS/Atom.
    // Optionnel/null : anthropicDraftGenerator.ts retombe alors sur summary.
    articleText?: string | null;
  };
};

const TOTAL_WEIGHT = PILLARS.reduce((sum, p) => sum + p.weight, 0);

/**
 * Tourniquet pondéré (smooth weighted round-robin) : rejoue l'historique
 * réel des piliers déjà publiés pour reconstituer un "crédit courant" par
 * pilier, puis choisit celui qui a le plus de crédit — jamais le dernier
 * pilier utilisé (sauf s'il n'y a qu'un seul pilier). Piloté par
 * l'historique réel plutôt qu'un état persisté séparément : un sujet posté
 * manuellement (Discord/veille, futurs tickets) qui s'écarte du pilier
 * suggéré reste pris en compte dès qu'il est publié, sans logique de
 * synchronisation supplémentaire.
 */
export function pickNextPillar(recentPillars: PillarId[]): Pillar {
  const credit = new Map<PillarId, number>(PILLARS.map((p) => [p.id, 0]));

  for (const usedId of recentPillars) {
    for (const p of PILLARS) credit.set(p.id, credit.get(p.id)! + p.weight);
    credit.set(usedId, credit.get(usedId)! - TOTAL_WEIGHT);
  }
  for (const p of PILLARS) credit.set(p.id, credit.get(p.id)! + p.weight);

  const lastUsed = recentPillars[recentPillars.length - 1];
  const candidates = PILLARS.filter((p) => p.id !== lastUsed || PILLARS.length === 1);

  return candidates.reduce((best, p) =>
    credit.get(p.id)! > credit.get(best.id)! ? p : best
  );
}

// Nombre d'articles récents sur lesquels vérifier la présence de l'angle
// SEO local (pilier E, transversal — jamais un slot de rotation à part
// entière, cf. docs/blog-plan-editorial.md §1) avant de le ré-imposer.
const LOCAL_ANGLE_WINDOW = 4;

export function shouldInjectLocalAngle(recentLocalAngleFlags: boolean[]): boolean {
  const recent = recentLocalAngleFlags.slice(-LOCAL_ANGLE_WINDOW);
  return recent.every((flag) => flag === false);
}
