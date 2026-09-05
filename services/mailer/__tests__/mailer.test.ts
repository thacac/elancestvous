import nodemailer from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Mailer from '../mailer';

vi.mock('nodemailer', () => {
    return {
        default: {
            createTransport: vi.fn(() => ({
                sendMail: vi.fn(async (opts) => ({
                    accepted: [opts.to],
                    rejected: [],
                    response: '250 OK',
                }))
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
