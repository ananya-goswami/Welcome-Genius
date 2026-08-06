/**
 * Verifies selectQuizForPath()'s randomized draw: exact counts, every
 * gating guarantee from §3.4/§7.3 holds under randomization (not just for
 * one fixed list), and that repeat calls actually vary, since that variation
 * is the entire point of the redesign (fixes "same questions every attempt").
 */
import { describe, it, expect } from 'vitest';
import { selectQuizForPath, quizBank } from '../quiz';
import { visibleTo } from '../../logic/filter';
import type { UserPath } from '../../types';

const idsFor = (path: UserPath) => selectQuizForPath(path).map((q) => q.id);

const ALL_FTE_PATHS: UserPath[] = [
  { role: 'central', gender: 'woman' },
  { role: 'central', gender: 'man' },
  { role: 'state', gender: 'woman' },
  { role: 'state', gender: 'man' },
];
const INTERN_PATH: UserPath = { role: 'intern', gender: null };
const ALL_PATHS: UserPath[] = [...ALL_FTE_PATHS, INTERN_PATH];

// How many draws to sample when asserting something holds "always" or
// "eventually" under randomization. High enough that a real regression
// can't hide behind bad luck, cheap enough to run on every test invocation.
const SAMPLES = 200;

describe('selectQuizForPath: counts (§7.3, §11 checklist)', () => {
  it('FTE quiz is always exactly 12 questions, Intern always exactly 8', () => {
    for (let i = 0; i < SAMPLES; i++) {
      for (const path of ALL_FTE_PATHS) expect(selectQuizForPath(path)).toHaveLength(12);
      expect(selectQuizForPath(INTERN_PATH)).toHaveLength(8);
    }
  });

  it('never draws a duplicate question within one quiz', () => {
    for (let i = 0; i < SAMPLES; i++) {
      for (const path of ALL_PATHS) {
        const ids = idsFor(path);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });
});

describe('selectQuizForPath: gating holds under randomization (§3.4)', () => {
  it('every drawn question passes visibleTo() for its path, across many draws', () => {
    for (let i = 0; i < SAMPLES; i++) {
      for (const path of ALL_PATHS) {
        for (const q of selectQuizForPath(path)) {
          expect(visibleTo(q, path), `${q.id} should be visible to ${path.role}-${path.gender}`).toBe(true);
        }
      }
    }
  });

  it('a woman never draws tf-5b, a man never draws tf-5a, across many draws', () => {
    for (let i = 0; i < SAMPLES; i++) {
      for (const role of ['central', 'state'] as const) {
        expect(idsFor({ role, gender: 'woman' })).not.toContain('tf-5b');
        expect(idsFor({ role, gender: 'man' })).not.toContain('tf-5a');
      }
    }
  });

  it('role-specific substitutions never cross over, across many draws', () => {
    for (let i = 0; i < SAMPLES; i++) {
      expect(idsFor({ role: 'central', gender: 'woman' })).not.toContain('mc-8b');
      expect(idsFor({ role: 'central', gender: 'woman' })).not.toContain('match-state');
      expect(idsFor({ role: 'central', gender: 'woman' })).not.toContain('match-intern');
      expect(idsFor({ role: 'state', gender: 'woman' })).not.toContain('mc-8a');
      expect(idsFor({ role: 'state', gender: 'woman' })).not.toContain('match-central');
      expect(idsFor(INTERN_PATH)).not.toContain('mc-8a');
      expect(idsFor(INTERN_PATH)).not.toContain('mc-8b');
      // Central-only fact (leave encashment was only taught on the Central
      // journey card, §7.1): must never reach a State quiz.
      expect(idsFor({ role: 'state', gender: 'woman' })).not.toContain('mc-15');
      expect(idsFor({ role: 'state', gender: 'man' })).not.toContain('mc-15');
    }
  });

  it('the mandatory role/gender-locked question is present in every single draw', () => {
    for (let i = 0; i < SAMPLES; i++) {
      expect(idsFor({ role: 'central', gender: 'woman' })).toEqual(
        expect.arrayContaining(['mc-8a', 'tf-5a', 'match-central'])
      );
      expect(idsFor({ role: 'central', gender: 'man' })).toEqual(
        expect.arrayContaining(['mc-8a', 'tf-5b', 'match-central'])
      );
      expect(idsFor({ role: 'state', gender: 'woman' })).toEqual(
        expect.arrayContaining(['mc-8b', 'tf-5a', 'match-state'])
      );
      expect(idsFor({ role: 'state', gender: 'man' })).toEqual(
        expect.arrayContaining(['mc-8b', 'tf-5b', 'match-state'])
      );
      expect(idsFor(INTERN_PATH)).toEqual(expect.arrayContaining(['mc-9', 'match-intern']));
    }
  });
});

describe('selectQuizForPath: draws actually vary (the point of this redesign)', () => {
  it('repeated draws for the same FTE path are not always identical', () => {
    for (const path of ALL_FTE_PATHS) {
      const draws = Array.from({ length: SAMPLES }, () => idsFor(path).join(','));
      expect(new Set(draws).size, `path ${path.role}-${path.gender} never varied across ${SAMPLES} draws`).toBeGreaterThan(1);
    }
  });

  it('repeated draws for Intern are not always identical', () => {
    const draws = Array.from({ length: SAMPLES }, () => idsFor(INTERN_PATH).join(','));
    expect(new Set(draws).size).toBeGreaterThan(1);
  });

  it('questions that were previously excluded (tf-4, tf-7) are now reachable', () => {
    const centralDraws = new Set<string>();
    for (let i = 0; i < SAMPLES; i++) idsFor({ role: 'central', gender: 'woman' }).forEach((id) => centralDraws.add(id));
    expect(centralDraws.has('tf-4')).toBe(true);

    const internDraws = new Set<string>();
    for (let i = 0; i < SAMPLES; i++) idsFor(INTERN_PATH).forEach((id) => internDraws.add(id));
    expect(internDraws.has('tf-7')).toBe(true);
  });

  it('newly added FTE-only questions (mc-10..14, tf-8..11) are reachable for FTE paths', () => {
    const draws = new Set<string>();
    for (let i = 0; i < SAMPLES; i++) idsFor({ role: 'central', gender: 'woman' }).forEach((id) => draws.add(id));
    for (const id of ['mc-10', 'mc-11', 'mc-12', 'mc-13', 'mc-14', 'tf-8', 'tf-9', 'tf-10', 'tf-11']) {
      expect(draws.has(id), `${id} never appeared across ${SAMPLES} draws`).toBe(true);
    }
  });
});

describe('question content matches source verbatim', () => {
  const byId = (id: string) => quizBank.find((q) => q.id === id)!;

  it('every MC question has exactly 4 options', () => {
    for (const q of quizBank) {
      if (q.type === 'mc') expect(q.options).toHaveLength(4);
    }
  });

  it('mc-1: Keka is the correct clock-in app', () => {
    const q = byId('mc-1');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('Keka');
  });

  it('mc-3: 10 fixed holidays', () => {
    const q = byId('mc-3');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('10');
  });

  it('mc-6: ₹10 lakh for Band 7+, mc-11: ₹5 lakh for Band 1-6', () => {
    const q6 = byId('mc-6');
    const q11 = byId('mc-11');
    if (q6.type !== 'mc' || q11.type !== 'mc') throw new Error('expected mc');
    expect(q6.options[q6.correctIndex]).toBe('₹10 lakh');
    expect(q11.options[q11.correctIndex]).toBe('₹5 lakh');
  });

  it('mc-7: 30th September appraisal cutoff', () => {
    const q = byId('mc-7');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('30th September');
  });

  it('mc-8a: Central = 32, mc-8b: State = 27', () => {
    const a = byId('mc-8a');
    const b = byId('mc-8b');
    if (a.type !== 'mc' || b.type !== 'mc') throw new Error('expected mc');
    expect(a.options[a.correctIndex]).toBe('32');
    expect(b.options[b.correctIndex]).toBe('27');
  });

  it('mc-9: Intern gets 1 leave/month', () => {
    const q = byId('mc-9');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('1');
  });

  it('mc-13: ₹5/km two-wheeler local conveyance', () => {
    const q = byId('mc-13');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('₹5');
  });

  it('mc-14: Harley Davidson Bike is the CG Hire Champs top prize', () => {
    const q = byId('mc-14');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('Harley Davidson Bike');
  });

  it('mc-15: encashment at last drawn basic pay, Central-only', () => {
    const q = byId('mc-15');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('At your last drawn basic pay');
    expect(q.appliesTo.roles).toEqual(['central']);
  });

  it('tf-3: Casual/Sick leave lapse, so the statement is False', () => {
    expect(byId('tf-3').type).toBe('tf');
    expect((byId('tf-3') as { correctAnswer: boolean }).correctAnswer).toBe(false);
  });

  it('tf-5a is True, tf-5b is False, per §7.2', () => {
    expect((byId('tf-5a') as { correctAnswer: boolean }).correctAnswer).toBe(true);
    expect((byId('tf-5b') as { correctAnswer: boolean }).correctAnswer).toBe(false);
  });

  it('tf-10: travel food allowance does not cover alcohol/tobacco, so False', () => {
    expect((byId('tf-10') as { correctAnswer: boolean }).correctAnswer).toBe(false);
  });

  it('tf-6 (Helpdesk) is now visible to every role, not just Intern', () => {
    const q = byId('tf-6');
    expect(q.appliesTo.roles).toEqual(expect.arrayContaining(['central', 'state', 'intern']));
  });

  it('match-central pairs: 15/8/9 days', () => {
    const q = byId('match-central');
    if (q.type !== 'match') throw new Error('expected match');
    expect(q.pairs).toEqual([
      { left: 'Earned Leave', right: '15 days' },
      { left: 'Sick Leave', right: '8 days' },
      { left: 'Casual Leave', right: '9 days' },
    ]);
  });

  it('match-state pairs: 15/6/6 days', () => {
    const q = byId('match-state');
    if (q.type !== 'match') throw new Error('expected match');
    expect(q.pairs).toEqual([
      { left: 'Earned Leave', right: '15 days' },
      { left: 'Sick Leave', right: '6 days' },
      { left: 'Casual Leave', right: '6 days' },
    ]);
  });
});
