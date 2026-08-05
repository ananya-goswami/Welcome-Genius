import { describe, it, expect } from 'vitest';
import { generateCertificateId, formatCompletionDate, ROLE_LABEL } from '../certificate';

describe('generateCertificateId (§7.5)', () => {
  it('matches the exact SWFTY-{ROLE}-{YYYYMMDD}-{4 alphanumeric} format', () => {
    const date = new Date(2026, 7, 5); // 5 August 2026 (month is 0-indexed)
    expect(generateCertificateId('central', date)).toMatch(/^SWFTY-CTL-20260805-[A-Z0-9]{4}$/);
    expect(generateCertificateId('state', date)).toMatch(/^SWFTY-STT-20260805-[A-Z0-9]{4}$/);
    expect(generateCertificateId('intern', date)).toMatch(/^SWFTY-INT-20260805-[A-Z0-9]{4}$/);
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 0, 9); // 9 January 2026
    expect(generateCertificateId('central', date)).toMatch(/^SWFTY-CTL-20260109-[A-Z0-9]{4}$/);
  });

  it('generates a different random suffix each call', () => {
    const date = new Date(2026, 7, 5);
    const ids = new Set(Array.from({ length: 20 }, () => generateCertificateId('central', date)));
    expect(ids.size).toBeGreaterThan(1); // astronomically unlikely to collide 20x if truly random
  });
});

describe('formatCompletionDate (§7.5)', () => {
  it('renders "5 August 2026" style, matching the spec example exactly', () => {
    expect(formatCompletionDate(new Date(2026, 7, 5))).toBe('5 August 2026');
  });
});

describe('ROLE_LABEL', () => {
  it('matches the exact certificate labels from §7.5', () => {
    expect(ROLE_LABEL.central).toBe('Central FTE');
    expect(ROLE_LABEL.state).toBe('State FTE');
    expect(ROLE_LABEL.intern).toBe('Intern');
  });
});
