import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import DOMPurify from "isomorphic-dompurify";
import readingTime from "reading-time";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { z } from "zod";

export const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "le slug doit être en kebab-case"),
  description: z.string().min(1),
  excerpt: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "publishedAt doit être au format AAAA-MM-JJ"),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "updatedAt doit être au format AAAA-MM-JJ")
    .optional(),
  coverImage: z.string().min(1),
  coverImageAlt: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export type PostMeta = z.infer<typeof frontmatterSchema> & {
  readingTime: string;
};

export type Post = PostMeta & { html: string };

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dir, file));
}

export function parsePostContent(
  raw: string,
  sourceLabel: string
): { frontmatter: z.infer<typeof frontmatterSchema>; content: string } {
  const { data, content } = matter(raw);
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Frontmatter invalide dans ${sourceLabel} — ${issues}`);
  }
  return { frontmatter: result.data, content };
}

function readAndValidate(filePath: string): {
  frontmatter: z.infer<typeof frontmatterSchema>;
  content: string;
} {
  const raw = fs.readFileSync(filePath, "utf8");
  return parsePostContent(raw, path.basename(filePath));
}

function loadAllMeta(dir: string): Array<PostMeta & { content: string }> {
  const files = listMarkdownFiles(dir);
  const seenSlugs = new Map<string, string>();
  const posts = files.map((filePath) => {
    const { frontmatter, content } = readAndValidate(filePath);
    const existing = seenSlugs.get(frontmatter.slug);
    if (existing) {
      throw new Error(
        `Slug dupliqué "${frontmatter.slug}" dans ${existing} et ${path.basename(
          filePath
        )}`
      );
    }
    seenSlugs.set(frontmatter.slug, path.basename(filePath));
    const stats = readingTime(content);
    return {
      ...frontmatter,
      readingTime: `${Math.max(1, Math.ceil(stats.minutes))} min de lecture`,
      content,
    };
  });
  return posts.sort(
    (a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0)
  );
}

export async function renderMarkdownToSafeHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);
  // Deuxième couche de nettoyage (défense en profondeur) : ce module lit
  // content/blog/*.md, dont le contenu peut provenir d'une génération IA
  // (services/blog/) promue depuis content/_drafts sans revue ligne à ligne.
  return DOMPurify.sanitize(String(file));
}

export function getPostSlugs(dir: string = BLOG_CONTENT_DIR): string[] {
  return loadAllMeta(dir).map((post) => post.slug);
}

export function getAllPostsMeta(dir: string = BLOG_CONTENT_DIR): PostMeta[] {
  return loadAllMeta(dir).map(({ content: _content, ...meta }) => meta);
}

export async function getPostBySlug(
  slug: string,
  dir: string = BLOG_CONTENT_DIR
): Promise<Post> {
  const post = loadAllMeta(dir).find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`Article introuvable pour le slug "${slug}"`);
  }
  const { content, ...meta } = post;
  const html = await renderMarkdownToSafeHtml(content);
  return { ...meta, html };
}
