import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { z } from "zod";

// Pipeline de chargement partagé par lib/blog.ts et lib/formations.ts : les
// deux collections de contenu (articles, formations) sont des répertoires de
// fichiers .md validés par un schéma zod propre à chacune, avec la même
// détection de slug dupliqué et le même format d'erreur. Ce module factorise
// ce qui est identique ; chaque appelant garde son propre schéma et ses
// propres enrichissements (ex. readingTime côté blog).

export function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dir, file));
}

export function parseFrontmatter<T>(
  schema: z.ZodType<T>,
  raw: string,
  sourceLabel: string
): { frontmatter: T; content: string } {
  const { data, content } = matter(raw);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Frontmatter invalide dans ${sourceLabel} — ${issues}`);
  }
  return { frontmatter: result.data, content };
}

export function loadMarkdownCollection<T extends { slug: string }>(
  dir: string,
  schema: z.ZodType<T>
): Array<T & { content: string }> {
  const files = listMarkdownFiles(dir);
  const seenSlugs = new Map<string, string>();
  return files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const { frontmatter, content } = parseFrontmatter(
      schema,
      raw,
      path.basename(filePath)
    );
    const existing = seenSlugs.get(frontmatter.slug);
    if (existing) {
      throw new Error(
        `Slug dupliqué "${frontmatter.slug}" dans ${existing} et ${path.basename(
          filePath
        )}`
      );
    }
    seenSlugs.set(frontmatter.slug, path.basename(filePath));
    return { ...frontmatter, content };
  });
}
