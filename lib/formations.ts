import path from "node:path";

import { z } from "zod";

import { renderMarkdownToSafeHtml } from "@/lib/blog";
import { loadMarkdownCollection, parseFrontmatter } from "@/lib/markdownCollection";

export const FORMATIONS_CONTENT_DIR = path.join(process.cwd(), "content", "formations");

export type FormationFamilleId =
  | "cadre-legal-etablissements-sante"
  | "prevention-rps-qvct-etablissements-sante"
  | "accompagnement-professionnel-etablissements-sante"
  | "dynamique-equipe-etablissements-sante";

export type FormationFamilleInfo = { id: FormationFamilleId; label: string };

// Miroir de PILLARS/PILLAR_IDS (services/blog/pillars.ts) : un seul tableau
// source (id + label), jamais deux structures séparées qui pourraient
// diverger. Indépendant de PILLAR_IDS — AD-1 : la classification du
// catalogue (Famille) et la rotation éditoriale du blog (Pilier) sont deux
// axes distincts, jamais synchronisés. Une Fiche formation ne référence
// jamais un Pilier blog. Labels repris tels quels du Glossary du PRD.
export const FORMATION_FAMILLES: FormationFamilleInfo[] = [
  {
    id: "cadre-legal-etablissements-sante",
    label: "Cadre légal, droits et éthique",
  },
  {
    id: "prevention-rps-qvct-etablissements-sante",
    label: "Prévention des RPS et QVCT",
  },
  {
    id: "accompagnement-professionnel-etablissements-sante",
    label: "Accompagnement et pratiques professionnelles",
  },
  {
    id: "dynamique-equipe-etablissements-sante",
    label: "Dynamique d'équipe et développement professionnel",
  },
];

// Tuple non vide dérivé de FORMATION_FAMILLES — seule source de vérité des
// ids valides, consommée par le schéma zod ci-dessous.
export const FORMATION_FAMILLE_IDS = FORMATION_FAMILLES.map((f) => f.id) as [
  FormationFamilleId,
  ...FormationFamilleId[],
];

const frontmatterSchema = z.object({
  titre: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "le slug doit être en kebab-case"),
  famille: z.enum(FORMATION_FAMILLE_IDS),
  objectifsPedagogiques: z.array(z.string().min(1)).min(1),
  prerequis: z.string().min(1),
  publicVise: z.array(z.string().min(1)).min(1),
  // Modules numérotés (rattrapage design Chantier C, cf. canevas Artifact
  // "Home Élan C'est Vous — refonte piliers", artboards Fiche-Formation*) :
  // un tableau structuré plutôt qu'un seul champ texte libre, pour éviter
  // de reconstituer la structure via un parsing fragile du contenu.
  programme: z
    .array(
      z.object({
        titre: z.string().min(1),
        texte: z.string().min(1),
      })
    )
    .min(1),
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
