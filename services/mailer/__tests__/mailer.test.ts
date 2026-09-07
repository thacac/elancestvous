import nodemailer from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Mailer from '../mailer';

const sendMailMock = vi.fn(async (opts) => ({
    accepted: [opts.to],
    rejected: [],
    response: '250 OK',
}));

vi.mock('nodemailer', () => {
    return {
        default: {
            createTransport: vi.fn(() => ({
                sendMail: sendMailMock,
            }))
        }
    };
});

describe('Mailer', () => {
    let mailer: Mailer;
    const envBackup = { ...process.env };

    beforeEach(() => {
        process.env.SMTP_HOST = 'smtp.example.com';
        process.env.SMTP_PORT = '465';
        process.env.SMTP_USR = 'test@example.com';
        process.env.SMTP_PWD = 'password';
        mailer = new Mailer();
        sendMailMock.mockClear();
    });

    afterEach(() => {
        process.env = { ...envBackup };
    });

    it('should send mail with sanitized input', async () => {
        const result = await mailer.sendMailToUs({
            firstName: 'John',
            lastName: 'Doe',
            fromEmail: 'john.doe@example.com',
            subject: 'Hello',
            message: '<b>Hello</b> world!'
        });
        expect(result.accepted).toContain('test@example.com');
        expect(result.response).toBe('250 OK');
    });

    it('should sanitize header fields and message', async () => {
        const result = await mailer.sendMailToUs({
            firstName: 'John\r\n<script>',
            lastName: 'Doe\n',
            fromEmail: 'john.doe@example.com\r',
            subject: 'Hello\n<script>',
            message: '<img src=x onerror=alert(1)>Hello <b>world</b>!'
        });
        expect(result.accepted).toContain('test@example.com');
        expect(result.response).toBe('250 OK');
    });

    // Contrairement à firstName/lastName/subject, fromEmail n'était que
    // débarrassé des \r\n (protection header injection) mais jamais passé
    // par sanitizeHtml avant d'être interpolé dans le HTML de l'email — un
    // Server Action Next.js étant un endpoint POST directement appelable, ce
    // champ n'est pas garanti d'être une adresse email valide côté serveur
    // (cf. issue #75).
    it('should sanitize HTML injected via fromEmail before embedding it in the email body', async () => {
        await mailer.sendMailToUs({
            firstName: 'John',
            lastName: 'Doe',
            fromEmail: '<img src=x onerror=alert(1)>evil@example.com',
            subject: 'Hello',
            message: 'Hi'
        });

        const sentOptions = sendMailMock.mock.calls[0][0];
        expect(sentOptions.html).not.toContain('<img');
        expect(sentOptions.html).not.toContain('onerror');
    });

    it('should use correct SMTP config', () => {
        expect(nodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                host: 'smtp.example.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'test@example.com',
                    pass: 'password',
                },
                tls: { rejectUnauthorized: true },
            })
        );
    });
});
