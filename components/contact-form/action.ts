"use server";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import Mailer from "@/services/mailer";

import { ContactFormValues } from "./validation";

export async function submit_contact_form(
  data: ContactFormValues
): Promise<SMTPTransport.SentMessageInfo | { error: string } | undefined> {
  const mailer = new Mailer();

  try {
    if (!process.env.SMTP_USR) {
      return { error: "Adresse e-mail destinataire manquante sur le serveur." };
    }

    const fullMessage = `Message de ${data.firstName} ${data.lastName} (${data.email}) :
                Type de projet : ${data.projectType}
                ${data.message}
        `;

    return await mailer.sendMailToUs({
      firstName: data.firstName,
      lastName: data.lastName,
      fromEmail: data.email,
      subject: "Prise de contact via le formulaire",
      message: data.message,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("ContactForm send error:", e);
    return {
      error: `Échec de l’envoi. Merci de réessayer. Détail: ${message}`,
    };
  }
}
