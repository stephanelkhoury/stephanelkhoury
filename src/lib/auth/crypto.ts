import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function authSecret() {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.ADMIN_DASHBOARD_TOKEN?.trim().replace(/^["']|["']$/g, '') || '';
  if (!secret) throw new Error('AUTH_SECRET or ADMIN_DASHBOARD_TOKEN must be set.');
  return secret;
}

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');

export function hmac(payload: string) {
  return createHmac('sha256', authSecret()).update(payload).digest('base64url');
}

export function safeEqual(first: string, second: string) {
  const a = Buffer.from(first);
  const b = Buffer.from(second);
  return a.length === b.length && timingSafeEqual(a, b);
}

function secretKey() {
  return scryptSync(authSecret(), 'multigraphic-auth-secretbox', 32);
}

// AES-256-GCM so the TOTP secret is never stored in readable form.
export function seal(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', secretKey(), iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.');
}

export function unseal(sealed: string) {
  const [version, iv, tag, body] = sealed.split('.');
  if (version !== 'v1' || !iv || !tag || !body) throw new Error('Invalid sealed value.');
  const decipher = createDecipheriv('aes-256-gcm', secretKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8');
}
