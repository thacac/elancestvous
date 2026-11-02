import { z } from "zod";

export const contactFormSchema = z.object({
  // .trim() retire les espaces inutiles au début et à la fin
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .trim()
    .toLowerCase() // Important pour la cohérence
    .min(1, "L'email est requis")
    .email("L'email n'est pas valide"),
  message: z
    .string()
    .trim()
    .min(1, "Le message est requis")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  projectType: z.enum(
      [
        "institution",
        "particulier",
      ] as const
    ).refine(
      (val) => !!val,
      { message: "Le type de projet est requis" }
    )
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
