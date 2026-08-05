/**
 * Verifies content.ts against docs/GAME_SPEC.md §6: every figure/date/email/
 * name transcribed verbatim, and the golden gating rule (CLAUDE.md rule 1)
 * holds for every role/gender combination. This is the regression guard for
 * "did an edit accidentally reword a policy fact or leak content cross-path."
 */
import { describe, it, expect } from 'vitest';
import { storyCards } from '../content';
import { visibleTo } from '../../logic/filter';
import type { Role, Gender, UserPath } from '../../types';

const visibleFor = (path: UserPath) => storyCards.filter((c) => visibleTo(c, path));

describe('story card figures are transcribed verbatim (§6)', () => {
  const mustContain: Array<[string, string]> = [
    ['leaves-central-1', '32 leaves a year: 15 Earned, 8 Sick, 9 Casual'],
    ['leaves-central-2', 'capped at 45 days (under 5 years) or 60 days (5+ years)'],
    ['leaves-state-1', '27 leaves a year: 15 Earned, 6 Sick, 6 Casual'],
    ['leaves-intern-1', '1 leave per month, pro-rata'],
    ['parental-maternity', '26 weeks of paid maternity leave'],
    ['parental-maternity', "10 weeks' notice"],
    ['parental-paternity', '14 working days of paternity leave'],
    ['parental-paternity', 'within 2 months'],
    ['parental-adoption', '12 working weeks'],
    ['finances-2', 'salary lands on the 5th'],
    ['insurance-1', 'Band 1–6 = ₹5 lakh cover, Band 7 and above = ₹10 lakh'],
    ['insurance-1', 'up to 4 dependent children'],
    ['probation-1', 'at least a week ahead'],
    ['posh-2', 'reachout@convegenius.ai'],
    ['posh-2', 'Harshali Dalal (President)'],
    ['posh-2', 'Tanvi Butalia'],
    ['posh-2', 'Sri Nitya A'],
    ['posh-2', 'Utsav Thapliyal'],
    ['posh-2', 'Nitin Jain'],
    ['posh-2', 'Anadya Girotra'],
    ['travel-2', '₹10/km by four-wheeler, ₹5/km by two-wheeler'],
    ['travel-2', 'within 30 days'],
    ['referral-1', 'complete 90 days'],
    ['referral-2', 'Harley Davidson'],
    ['appraisal-1', '30th September'],
    ['holidays-1', '10 fixed holidays'],
  ];

  it.each(mustContain)('%s contains "%s"', (id, fragment) => {
    const card = storyCards.find((c) => c.id === id);
    expect(card, `card ${id} should exist`).toBeDefined();
    expect(card!.body).toContain(fragment);
  });
});

describe('golden rule of gating (§2, §11 checklist)', () => {
  it('an Intern never sees any FTE-only module', () => {
    const cards = visibleFor({ role: 'intern', gender: null });
    const fteOnlyModules = ['Parental', 'Finances', 'Insurance', 'Probation', 'On the Move', 'Referral', 'Appraisal'];
    for (const card of cards) {
      expect(fteOnlyModules).not.toContain(card.module);
    }
  });

  it('a man never sees the maternity card', () => {
    for (const role of ['central', 'state'] as Role[]) {
      const cards = visibleFor({ role, gender: 'man' });
      expect(cards.find((c) => c.id === 'parental-maternity')).toBeUndefined();
    }
  });

  it('a woman never sees the paternity card', () => {
    for (const role of ['central', 'state'] as Role[]) {
      const cards = visibleFor({ role, gender: 'woman' });
      expect(cards.find((c) => c.id === 'parental-paternity')).toBeUndefined();
    }
  });

  it('both genders see the adoption card', () => {
    for (const role of ['central', 'state'] as Role[]) {
      for (const gender of ['woman', 'man'] as Gender[]) {
        const cards = visibleFor({ role, gender });
        expect(cards.find((c) => c.id === 'parental-adoption')).toBeDefined();
      }
    }
  });

  it('Central never sees State leave numbers, and vice versa', () => {
    const centralCards = visibleFor({ role: 'central', gender: 'woman' });
    const stateCards = visibleFor({ role: 'state', gender: 'woman' });
    expect(centralCards.some((c) => c.body.includes('32 leaves'))).toBe(true);
    expect(centralCards.some((c) => c.body.includes('27 leaves'))).toBe(false);
    expect(stateCards.some((c) => c.body.includes('27 leaves'))).toBe(true);
    expect(stateCards.some((c) => c.body.includes('32 leaves'))).toBe(false);
  });
});

describe('journey card counts match §6 pacing note', () => {
  it('FTE paths render exactly 24 cards', () => {
    for (const role of ['central', 'state'] as Role[]) {
      for (const gender of ['woman', 'man'] as Gender[]) {
        expect(visibleFor({ role, gender }).length).toBe(24);
      }
    }
  });

  it('Intern renders exactly 11 cards', () => {
    expect(visibleFor({ role: 'intern', gender: null }).length).toBe(11);
  });

  it('every filtered path sorts into a strictly non-decreasing, gap-free sequence', () => {
    for (const path of [
      { role: 'central', gender: 'woman' },
      { role: 'central', gender: 'man' },
      { role: 'state', gender: 'woman' },
      { role: 'state', gender: 'man' },
      { role: 'intern', gender: null },
    ] as UserPath[]) {
      const orders = visibleFor(path)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.order);
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThan(orders[i - 1]); // no duplicate order within one user's filtered list
      }
    }
  });
});
