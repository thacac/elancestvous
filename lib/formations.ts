import path from "node:path";

import { z } from "zod";

import { renderMarkdownToSafeHtml } from "@/lib/blog";
import { loadMarkdownCollection, parseFrontmatter } from "@/lib/markdownCollection";

export const FORMATIONS_CONTENT_DIR = path.join(process.cwd(), "content", "formations");

// Enum local, indépendant de PILLAR_IDS (services/blog/pillars.ts) — AD-1 :
// la classification du catalogue (Famille) et la rotation éditoriale du blog
// (Pilier) sont deux axes distincts, jamais synchronisés. Une Fiche formation
// ne référence jamais un Pilier blog.
export const FORMATION_FAMILLES = [
  "cadre-legal-etablissements-sante",
  "prevention-rps-qvct-etablissements-sante",
  "accompagnement-professionnel-etablissements-sante",
  "dynamique-equipe-etablissements-sante",
] as const;

export type FormationFamille = (typeof FORMATION_FAMILLES)[number];

// Libellés lisibles, repris tels quels du Glossary du PRD — source unique
// pour toute page qui affiche une Famille (fil d'Ariane, tuiles, pastilles
// de filtre).
export const FORMATION_FAMILLE_LABELS: Record<FormationFamille, string> = {
  "cadre-legal-etablissements-sante": "Cadre légal, droits et éthique",
  "prevention-rps-qvct-etablissements-sante": "Prévention des RPS et QVCT",
  "accompagnement-professionnel-etablissements-sante":
    "Accompagnement et pratiques professionnelles",
  "dynamique-equipe-etablissements-sante":
    "Dynamique d'équipe et développement professionnel",
};

const frontmatterSchema = z.object({
  titre: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "le slug doit être en kebab-case"),
  famille: z.enum(FORMATION_FAMILLES),
  objectifsPedagogiques: z.array(z.string().min(1)).min(1),
  prerequis: z.string().min(1),
  publicVise: z.array(z.string().min(1)).min(1),
  programme: z.string().min(1),
  duree: z.string().min(1),
  format: z.string().min(1),
  delaiAcces: z.string().min(1),
  modalitesEvaluation: z.string().min(1),
  accessibilite: z.string().min(1),
  // Données Qualiopi tant que non fournies par la cliente : jamais
  // inventées, exposées comme placeholder explicite (null) côté affichage.
  tarif: z.string().nullable().default(null),
  referentHandicap: z.string().nullable().default(null),
  indicateursResultats: z.string().nullable().default(null),
});

export type FormationMeta = z.infer<typeof frontmatterSchema>;

export type Formation = FormationMeta & { html: string };

export function parseFormationContent(
  raw: string,
  sourceLabel: string
): { frontmatter: FormationMeta; content: string } {
  return parseFrontmatter(frontmatterSchema, raw, sourceLabel);
}

export function getFormationSlugs(dir: string = FORMATIONS_CONTENT_DIR): string[] {
  return loadMarkdownCollection(dir, frontmatterSchema).map((formation) => formation.slug);
}

export function getAllFormationsMeta(
  dir: string = FORMATIONS_CONTENT_DIR
): FormationMeta[] {
  return loadMarkdownCollection(dir, frontmatterSchema).map(({ content, ...meta }) => meta);
}

export async function getFormationBySlug(
  slug: string,
  dir: string = FORMATIONS_CONTENT_DIR
): Promise<Formation> {
  const allFormations = loadMarkdownCollection(dir, frontmatterSchema);
  const formation = allFormations.find((f) => f.slug === slug);
  if (!formation) {
    throw new Error(`Formation introuvable pour le slug "${slug}"`);
  }
  const { content, ...meta } = formation;
  const html = await renderMarkdownToSafeHtml(content);
  return { ...meta, html };
}
