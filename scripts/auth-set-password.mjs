// Sets an account password directly in the database (bootstrap or recovery when email is not set up).
// Usage: node scripts/auth-set-password.mjs <email> [--production]
// A random password is written to .owner-credentials.txt (git-ignored); it is never printed.
import { randomBytes, scryptSync } from 'node:crypto';
import { chmodSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error('Usage: node scripts/auth-set-password.mjs <email>'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set.'); process.exit(1); }

const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const password = process.env.NEW_PASSWORD || Array.from(randomBytes(16), byte => alphabet[byte % alphabet.length]).join('') + '7';
const salt = randomBytes(16);
const key = scryptSync(password.normalize('NFKC'), salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const passwordHash = `scrypt$16384$8$1$${salt.toString('base64url')}$${key.toString('base64url')}`;

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.error(`No account for ${email}. Run the operations seed or invite the person first.`); process.exit(1); }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null, disabledAt: null } });
  await prisma.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!process.env.NEW_PASSWORD) {
    writeFileSync('.owner-credentials.txt', `email: ${email}\npassword: ${password}\n`, { mode: 0o600 });
    chmodSync('.owner-credentials.txt', 0o600);
    console.log(`Password set for ${email}. Read it from .owner-credentials.txt, sign in, change it on the Account page, then delete the file.`);
  } else {
    console.log(`Password set for ${email}.`);
  }
} finally {
  await prisma.$disconnect();
}
