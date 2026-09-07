import { z } from "zod";

export const BlogDraftSchema = z.object({
  title: z.string().min(1),
  // Pilier réellement couvert par l'article, déclaré par le modèle lui-même
  // (jamais déduit après coup) : même en cas d'écart par rapport au pilier
  // suggéré (cf. services/blog/pillars.ts), le suivi de la rotation doit
  // rester fiable plutôt que dépendre d'une inférence fragile sur le contenu.
  pillar: z.enum(["A", "B", "C", "D"]),
  // Vrai si l'article intègre explicitement l'ancrage local (Toulouse /
  // Haute-Garonne / Occitanie) — pilier E, transversal, jamais un slot de
  // rotation à part entière (docs/blog-plan-editorial.md §1).
  localAngle: z.boolean(),
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
