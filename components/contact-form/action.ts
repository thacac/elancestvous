"use server";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import Mailer from "@/services/mailer/mailer";

import { contactFormSchema, ContactFormValues } from "./validation";

export async function submit_contact_form(
  data: ContactFormValues
): Promise<SMTPTransport.SentMessageInfo | { error: string } | undefined> {
  // Une Server Action Next.js reste un endpoint POST directement appelable,
  // en contournant le formulaire et la validation zod côté client
  // (zodResolver dans ContactForm.tsx) — sans revalidation ici, un "email"
  // arbitraire atteindrait Mailer.sendMailToUs (issue #75).
  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Formulaire invalide." };
  }
  data = parsed.data;

  const mailer = new Mailer();

  try {
    if (!process.env.SMTP_USR) {
      return { error: "Adresse e-mail destinataire manquante sur le serveur." };
    }

    const fullMessage = [
      `Message de ${data.firstName} ${data.lastName} (${data.email}) :`,
      `Type de projet : ${data.projectType}`,
      data.message,
    ].join("\n");

    return await mailer.sendMailToUs({
      firstName: data.firstName,
      lastName: data.lastName,
      fromEmail: data.email,
      subject: "Prise de contact via le formulaire",
      message: fullMessage,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("ContactForm send error:", e);
    return {
      error: `Échec de l’envoi. Merci de réessayer. Détail: ${message}`,
    };
  }
}
