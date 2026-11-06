import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function signature(payload: string, token: string) {
  return createHmac('sha256', token).update(payload).digest('base64url');
}

export function createAdminSession(token: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  const expiresAt = nowSeconds + ADMIN_SESSION_TTL_SECONDS;
  const payload = `v1.${expiresAt}`;
  return { value: `${payload}.${signature(payload, token)}`, expiresAt };
}

export function verifyAdminSession(value: string | undefined, token: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!value || !token) return false;
  const [version, expiryText, suppliedSignature, extra] = value.split('.');
  if (version !== 'v1' || !expiryText || !suppliedSignature || extra !== undefined) return false;
  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + ADMIN_SESSION_TTL_SECONDS) return false;

  const expected = Buffer.from(signature(`${version}.${expiryText}`, token));
  const supplied = Buffer.from(suppliedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function constantTimeStringEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export function isAllowedAdminMutationOrigin(input: {
  origin: string | null;
  requestHost: string | null;
  requestProtocol: string | null;
  fetchSite: string | null;
}) {
  if (input.fetchSite === 'cross-site' || !input.origin || !input.requestHost || !input.requestProtocol) return false;
  try {
    const origin = new URL(input.origin);
    return origin.host === input.requestHost && origin.protocol === input.requestProtocol;
  } catch {
    return false;
  }
}

export function isAdminRequestAllowed(input: {
  token: string;
  authorization: string | null;
  cookieSession: string | undefined;
  method: string;
  origin: string | null;
  requestHost: string | null;
  requestProtocol: string | null;
  fetchSite: string | null;
}) {
  if (!input.token) return false;
  if (input.authorization?.startsWith('Bearer ') && constantTimeStringEqual(input.authorization.slice(7), input.token)) return true;
  if (!verifyAdminSession(input.cookieSession, input.token)) return false;
  if (['GET', 'HEAD', 'OPTIONS'].includes(input.method.toUpperCase())) return true;
  return isAllowedAdminMutationOrigin(input);
}
