import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

class Mailer {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) == 465, // set to true if using port 465
      auth: {
        user: process.env.SMTP_USR,
        pass: process.env.SMTP_PWD,
      }
    } as SMTPTransport.Options);
  }

  async sendMailToUs({
    from,
    text,
    html,
  }: {
    from: string;
    to: string;
    subject?: string;
    text: string;
    html?: string;
  }): Promise<SMTPTransport.SentMessageInfo> {
    return await this.transporter.sendMail({
      from,
      to: process.env.CONTACT_MAIL,
      text,
      html,
    });
  }
}

export default Mailer;
