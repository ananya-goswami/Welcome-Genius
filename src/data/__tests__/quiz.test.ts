/**
 * Verifies selectQuizForPath() against the exact §7.3 assembly table, and
 * that quiz content figures match §7.2 verbatim.
 */
import { describe, it, expect } from 'vitest';
import { selectQuizForPath, quizBank } from '../quiz';
import { visibleTo } from '../../logic/filter';
import type { Gender, UserPath } from '../../types';

const idsFor = (path: UserPath) => selectQuizForPath(path).map((q) => q.id);

describe('selectQuizForPath matches the §7.3 table exactly', () => {
  it('Central + Woman', () => {
    expect(idsFor({ role: 'central', gender: 'woman' })).toEqual([
      'mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-6', 'mc-7', 'mc-8a',
      'tf-1', 'tf-2', 'tf-3', 'tf-5a',
      'match-central',
    ]);
  });

  it('Central + Man', () => {
    expect(idsFor({ role: 'central', gender: 'man' })).toEqual([
      'mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-6', 'mc-7', 'mc-8a',
      'tf-1', 'tf-2', 'tf-3', 'tf-5b',
      'match-central',
    ]);
  });

  it('State + Woman', () => {
    expect(idsFor({ role: 'state', gender: 'woman' })).toEqual([
      'mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-6', 'mc-7', 'mc-8b',
      'tf-1', 'tf-2', 'tf-3', 'tf-5a',
      'match-state',
    ]);
  });

  it('State + Man', () => {
    expect(idsFor({ role: 'state', gender: 'man' })).toEqual([
      'mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-6', 'mc-7', 'mc-8b',
      'tf-1', 'tf-2', 'tf-3', 'tf-5b',
      'match-state',
    ]);
  });

  it('Intern', () => {
    expect(idsFor({ role: 'intern', gender: null })).toEqual([
      'mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-9',
      'tf-1', 'tf-6',
      'match-intern',
    ]);
  });
});

describe('quiz counts and exclusions (§7.3, §11 checklist)', () => {
  it('FTE quiz is exactly 12 questions, Intern exactly 8', () => {
    for (const gender of ['woman', 'man'] as Gender[]) {
      expect(selectQuizForPath({ role: 'central', gender }).length).toBe(12);
      expect(selectQuizForPath({ role: 'state', gender }).length).toBe(12);
    }
    expect(selectQuizForPath({ role: 'intern', gender: null }).length).toBe(8);
  });

  it('TF-4 (Adoption) and TF-7 (Intern attendance) are never assembled, per the §7.3 note', () => {
    const allAssembled = [
      ...idsFor({ role: 'central', gender: 'woman' }),
      ...idsFor({ role: 'central', gender: 'man' }),
      ...idsFor({ role: 'state', gender: 'woman' }),
      ...idsFor({ role: 'state', gender: 'man' }),
      ...idsFor({ role: 'intern', gender: null }),
    ];
    expect(allAssembled).not.toContain('tf-4');
    expect(allAssembled).not.toContain('tf-7');
  });

  it('every assembled question passes visibleTo() for its path (no cross-path leakage)', () => {
    for (const path of [
      { role: 'central', gender: 'woman' },
      { role: 'central', gender: 'man' },
      { role: 'state', gender: 'woman' },
      { role: 'state', gender: 'man' },
      { role: 'intern', gender: null },
    ] as UserPath[]) {
      for (const q of selectQuizForPath(path)) {
        expect(visibleTo(q, path), `${q.id} should be visible to ${path.role}-${path.gender}`).toBe(true);
      }
    }
  });

  it('a woman never gets tf-5b, a man never gets tf-5a', () => {
    for (const role of ['central', 'state'] as const) {
      expect(idsFor({ role, gender: 'woman' })).not.toContain('tf-5b');
      expect(idsFor({ role, gender: 'man' })).not.toContain('tf-5a');
    }
  });

  it('role-specific substitutions never cross over', () => {
    expect(idsFor({ role: 'central', gender: 'woman' })).not.toContain('mc-8b');
    expect(idsFor({ role: 'central', gender: 'woman' })).not.toContain('match-state');
    expect(idsFor({ role: 'state', gender: 'woman' })).not.toContain('mc-8a');
    expect(idsFor({ role: 'state', gender: 'woman' })).not.toContain('match-central');
  });
});

describe('question content matches §7.2 verbatim', () => {
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

  it('mc-6: ₹10 lakh for Band 7+', () => {
    const q = byId('mc-6');
    if (q.type !== 'mc') throw new Error('expected mc');
    expect(q.options[q.correctIndex]).toBe('₹10 lakh');
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

  it('tf-3: Casual/Sick leave lapse, so the statement is False', () => {
    expect(byId('tf-3').type).toBe('tf');
    expect((byId('tf-3') as { correctAnswer: boolean }).correctAnswer).toBe(false);
  });

  it('tf-5a is True, tf-5b is False, per §7.2', () => {
    expect((byId('tf-5a') as { correctAnswer: boolean }).correctAnswer).toBe(true);
    expect((byId('tf-5b') as { correctAnswer: boolean }).correctAnswer).toBe(false);
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
