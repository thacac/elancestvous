import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("L'email n'est pas valide"),
  message: z
    .string()
    .min(1, "Le message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
