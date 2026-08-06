/**
 * Certificate content helpers, §7.5. Per the user's explicit decision:
 * keep the SWFTY- ID format exactly as specced (HR may verify certificates
 * against it), only the visible footer text is rebranded to Welcome Genius.
 */
import type { Role } from '../types';

export const ROLE_LABEL: Record<Role, string> = {
  central: 'Central FTE',
  state: 'State FTE',
  intern: 'Intern',
};

// Role codes for the certificate ID, per §7.5.
const ROLE_CODE: Record<Role, string> = {
  central: 'CTL',
  state: 'STT',
  intern: 'INT',
};

function randomAlphanumeric(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function yyyymmdd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** e.g. "SWFTY-CTL-20260805-K3P9", generate once per certificate, not on
 * every render (the caller is responsible for holding it in state). */
export function generateCertificateId(role: Role, date: Date): string {
  return `SWFTY-${ROLE_CODE[role]}-${yyyymmdd(date)}-${randomAlphanumeric(4)}`;
}

/** e.g. "5 August 2026", matches the exact style in §7.5's example. */
export function formatCompletionDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
