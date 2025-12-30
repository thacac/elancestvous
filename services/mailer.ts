import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import sanitizeHtml from "sanitize-html";

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
    // 1. Nettoyage des headers (Header Injection)
    const cleanFirstName = firstName.replace(/[\r\n]/g, "").trim();
    const cleanLastName = lastName.replace(/[\r\n]/g, "").trim();
    const cleanEmail = fromEmail.replace(/[\r\n]/g, "").trim();
    const cleanSubject = subject.replace(/[\r\n]/g, "").trim();

    // 2. Préparation du contenu sécurisé
    // On retire tout HTML du nom et du sujet pour plus de sécurité
    const safeFullName = sanitizeHtml(`${cleanFirstName} ${cleanLastName}`, { allowedTags: [], allowedAttributes: {} });
    const safeSubject = sanitizeHtml(cleanSubject, { allowedTags: [], allowedAttributes: {} });

    // On autorise un formatage minimal pour le message
    const sanitizedMessage = sanitizeHtml(message.trim(), {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {},
    });

    const safeHtml = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h3>Nouveau message de contact</h3>
      <p><b>Nom :</b> ${safeFullName}</p>
      <p><b>Email :</b> ${cleanEmail}</p>
      <p><b>Sujet :</b> ${safeSubject}</p>
      <hr />
      <p><b>Message :</b><br/>
      ${sanitizedMessage.replace(/\n/g, "<br>")}</p>
    </div>
  `;

    return await this.transporter.sendMail({
      // IMPORTANT : L'expéditeur 'from' doit être VOTRE adresse configurée sur o2switch
      // Sinon, le mail sera bloqué par les politiques SPF/Anti-Spam.
      from: `"${safeFullName}" <${process.env.SMTP_USR}>`,

      // C'est ici qu'on met l'adresse du client pour pouvoir lui répondre
      replyTo: cleanEmail,

      to: process.env.SMTP_USR,
      subject: `[Contact Site] ${safeSubject}`,
      text: message.trim(), // Version texte brut sans HTML
      html: safeHtml,
    });
  }
}
export default Mailer;
