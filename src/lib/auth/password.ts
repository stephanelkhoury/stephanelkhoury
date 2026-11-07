import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  // A fixed dummy hash keeps timing similar when the account does not exist.
  const parts = (stored ?? '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    await derive(password, Buffer.alloc(16));
    return false;
  }
  const expected = Buffer.from(parts[5], 'base64url');
  const actual = await derive(password, Buffer.from(parts[4], 'base64url'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function passwordProblem(password: string, email?: string) {
  if (password.length < 10) return 'Use at least 10 characters.';
  if (password.length > 200) return 'Use at most 200 characters.';
  if (!/[a-z]/i.test(password) || !/[0-9]/.test(password)) return 'Include letters and at least one number.';
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase()) && email.split('@')[0].length > 3) return 'Do not include your email name in the password.';
  return null;
}
