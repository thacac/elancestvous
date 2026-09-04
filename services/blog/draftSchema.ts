import { z } from "zod";

export const BlogDraftSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "le slug doit être en kebab-case"),
  description: z.string().min(1),
  excerpt: z.string().min(1),
  tags: z.array(z.string()).min(1).max(6),
  bodyMarkdown: z.string().min(1),
  imagePrompts: z
    .array(
      z.object({
        purpose: z.literal("cover"),
        prompt: z.string().min(1),
        altText: z.string().min(1),
      })
    )
    .min(1),
});

export type BlogDraft = z.infer<typeof BlogDraftSchema>;
