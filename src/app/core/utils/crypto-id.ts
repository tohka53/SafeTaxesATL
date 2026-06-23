import { environment } from '@env/environment';

/**
 * Lightweight reversible obfuscation for IDs placed in the URL so raw UUIDs are
 * not exposed in the address bar / browser history.
 *
 * NOTE: this is OBFUSCATION, not encryption — the key ships in the bundle. Real
 * data protection is enforced server-side by Supabase Row Level Security.
 */
const KEY = environment.idKey || 'safetaxesatl';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function xorStr(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    out += String.fromCharCode(s.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
  }
  return out;
}

export function encodeId(id: string | null | undefined): string {
  if (!id) {
    return '';
  }
  try {
    return btoa(xorStr(id))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return id;
  }
}

export function decodeId(token: string | null | undefined): string {
  if (!token) {
    return '';
  }
  // Tolerate raw UUIDs (older links / direct access).
  if (UUID_RE.test(token)) {
    return token;
  }
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    return xorStr(atob(b64));
  } catch {
    return token;
  }
}
