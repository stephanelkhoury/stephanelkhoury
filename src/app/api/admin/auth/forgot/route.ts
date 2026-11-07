import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fail, readAuthBody } from '@/lib/auth/http';
import { appBaseUrl, mailConfigured, sendMail } from '@/lib/auth/mailer';
import { randomToken, sha256 } from '@/lib/auth/crypto';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200) }).strict();

// Always answers the same way so the form cannot be used to discover which emails have accounts.
export async function POST(request: NextRequest) {
  const input = await readAuthBody(request, schema, { scope: 'auth-forgot', max: 5, windowMs: 60 * 60 * 1000 });
  if ('error' in input) return input.error;
  try {
    const user = await prisma.user.findUnique({ where: { email: input.data.email } });
    if (user && !user.disabledAt) {
      const token = randomToken(32);
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), purpose: 'RESET', expiresAt: new Date(Date.now() + 60 * 60_000) } });
      const link = `${appBaseUrl(request)}/admin/reset-password?token=${token}`;
      await sendMail({ to: user.email, subject: 'Reset your Multigraphic AI password', text: `Open this link within one hour to choose a new password:\n\n${link}\n\nIf you did not ask for this, ignore this email.` });
    }
  } catch {
    return fail('Password reset is temporarily unavailable.', 503);
  }
  return NextResponse.json({ ok: true, emailEnabled: mailConfigured() });
}
