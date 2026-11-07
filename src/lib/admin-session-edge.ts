const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function verifyAdminSessionEdge(value: string | undefined, token: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!value || !token) return false;
  const [version, expiryText, suppliedSignature, extra] = value.split('.');
  if (version !== 'v1' || !expiryText || !suppliedSignature || extra !== undefined) return false;
  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + SESSION_TTL_SECONDS) return false;

  try {
    const key = await crypto.subtle.importKey('raw', encoder.encode(token), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('HMAC', key, decodeBase64Url(suppliedSignature), encoder.encode(`${version}.${expiryText}`));
  } catch {
    return false;
  }
}

// Signature and expiry only; revoked sessions are rejected by the server-side checks.
export async function verifyAdminSessionV2Edge(value: string | undefined, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!value || !secret) return false;
  const [version, token, expiryText, suppliedSignature, extra] = value.split('.');
  if (version !== 'v2' || !token || !expiryText || !suppliedSignature || extra !== undefined) return false;
  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + SESSION_TTL_SECONDS) return false;
  try {
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('HMAC', key, decodeBase64Url(suppliedSignature), encoder.encode(`${version}.${token}.${expiryText}`));
  } catch {
    return false;
  }
}
