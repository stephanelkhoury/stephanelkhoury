import nodemailer from 'nodemailer';

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export async function sendMail(input: { to: string; subject: string; text: string; html?: string }) {
  if (!mailConfigured()) return { sent: false as const, reason: 'Email sending is not configured.' };
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, ...input });
    return { sent: true as const };
  } catch {
    return { sent: false as const, reason: 'The email provider rejected the message.' };
  }
}

export function appBaseUrl(request: Request) {
  const configured = process.env.APP_BASE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'http';
  return `${proto}://${host}`;
}
