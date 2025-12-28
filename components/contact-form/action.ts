"use server";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import Mailer from "@/services/mailer";


import { ContactFormValues } from "./validation";

export async function submit_contact_form(
    data: ContactFormValues
): Promise<SMTPTransport.SentMessageInfo | { error: string } | undefined> {
    const mailer = new Mailer();


    console.log("ContactForm submit:", process.env.CONTACT_MAIL);

    try {
        if (!process.env.CONTACT_MAIL) {
            return { error: "Adresse e-mail destinataire manquante sur le serveur." };
        }

        return await mailer.sendMailToUs({
            from: `"${data.firstName} ${data.lastName}" <${data.email}>`,
            to: process.env.CONTACT_MAIL || "",
            text: data.message,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("ContactForm send error:", e);
        return { error: `Échec de l’envoi. Merci de réessayer. Détail: ${message}` };
    }
}
