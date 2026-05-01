'use client';

// ── License key system ────────────────────────────────────────────────────────
//
// How it works:
//   Monthly key = first 12 hex chars of SHA-256(APP_SECRET + ":" + "YYYYMM")
//
// You generate the current month's key with this Node command:
//   node -e "require('crypto').createHash('sha256').update('CHANGE_THIS_SECRET:' + require('fs').readFileSync('/dev/stdin','utf8').trim()).digest('hex').slice(0,12).toUpperCase()"
//   (then type the YYYYMM value and press Enter+Ctrl-D)
//
// Or simpler — run the helper in src/lib/keygen.mjs (see README).
//
// IMPORTANT: Change APP_SECRET to something only you know before deploying.
// Keep it private — anyone who reads this file can generate keys.

const APP_SECRET = 'BREW_POS_SECRET_CHANGEME';

function toYYYYMM(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function sha256Hex(input: string): Promise<string> {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function expectedKeyForMonth(yearMonth: string): Promise<string> {
  return (await sha256Hex(`${APP_SECRET}:${yearMonth}`)).slice(0, 12).toUpperCase();
}

/** Returns 'valid' | 'grace' (prev month) | 'expired' */
export async function checkLicense(key: string): Promise<'valid' | 'grace' | 'expired'> {
  if (!key || key.trim() === '') return 'expired';
  const k = key.trim().toUpperCase();

  const now  = new Date();
  const cur  = await expectedKeyForMonth(toYYYYMM(now));
  if (k === cur) return 'valid';

  const prev = new Date(now); prev.setMonth(prev.getMonth() - 1);
  const prevK = await expectedKeyForMonth(toYYYYMM(prev));
  if (k === prevK) return 'grace'; // paid last month, 1 month grace

  return 'expired';
}
