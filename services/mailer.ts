import DOMPurify from "isomorphic-dompurify";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

class Mailer {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      // Conseil o2switch : force secure:true pour le port 465
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USR,
        pass: process.env.SMTP_PWD,
      },
      // Protection contre les certificats auto-signés si nécessaire
      tls: { rejectUnauthorized: true },
    } as SMTPTransport.Options);
  }

  // Nettoyage XSS pour le contenu HTML
  private sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html);
  }

  async sendMailToUs({
    firstName,
    lastName,
    fromEmail,
    subject,
    message,
  }: {
    firstName: string;
    lastName: string;
    fromEmail: string;
    subject: string;
    message: string;
  }): Promise<any> {
    // 1. Nettoyage des caractères de saut de ligne dans les headers (Header Injection)
    const cleanFirstName = firstName.replace(/[\r\n]/g, "");
    const cleanLastName = lastName.replace(/[\r\n]/g, "");
    const cleanEmail = fromEmail.replace(/[\r\n]/g, "");
    const cleanSubject = subject.replace(/[\r\n]/g, "");

    // 2. Construction sécurisée du corps (HTML échappé)
    const safeMessage = message.trim();
    const safeHtml = `
      <h3>Nouveau message de contact</h3>
      <p><b>Nom :</b> ${DOMPurify.sanitize(
      cleanFirstName
    )} ${DOMPurify.sanitize(cleanLastName)}</p>
      <p><b>Email :</b> ${DOMPurify.sanitize(cleanEmail)}</p>
      <p><b>Message :</b><br/>${DOMPurify.sanitize(safeMessage).replace(
      /\n/g,
      "<br>"
    )}</p>
    `;

    return await this.transporter.sendMail({
      from: `"${cleanFirstName} ${cleanLastName}" <${cleanEmail}>`, // On utilise l'email SMTP comme expéditeur réel pour éviter le flag spam
      replyTo: cleanEmail, // L'adresse de l'utilisateur va ici
      to: process.env.SMTP_USR,
      subject: DOMPurify.sanitize(cleanSubject),
      text: safeMessage,
      html: safeHtml,
    });
  }
}

export default Mailer;
