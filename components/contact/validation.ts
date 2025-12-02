import { z } from "zod";

export const schema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.email("Email invalide"),
  message: z.string().min(1, "Message requis"),
});

export type ContactFormValues = z.infer<typeof schema>;
