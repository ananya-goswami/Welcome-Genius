/**
 * Unit tests for §7.4 scoring and the §5.5 pass/fail threshold, including
 * the worked numbers the spec calls out explicitly (11/12 FTE, 7/8 Intern).
 */
import { describe, it, expect } from 'vitest';
import { isCorrect, scoreQuiz, passThreshold, formatScore } from '../scoring';
import type { McQuestion, TfQuestion, MatchQuestion, QuizAnswers } from '../../types';

const mc: McQuestion = {
  id: 'q-mc',
  type: 'mc',
  module: 'Test',
  appliesTo: { roles: ['central'] },
  question: '?',
  options: ['a', 'b', 'c', 'd'],
  correctIndex: 2,
};

const tf: TfQuestion = {
  id: 'q-tf',
  type: 'tf',
  module: 'Test',
  appliesTo: { roles: ['central'] },
  statement: '?',
  correctAnswer: true,
};

const match: MatchQuestion = {
  id: 'q-match',
  type: 'match',
  module: 'Test',
  appliesTo: { roles: ['central'] },
  prompt: '?',
  pairs: [
    { left: 'A', right: '1' },
    { left: 'B', right: '2' },
    { left: 'C', right: '3' },
  ],
};

describe('isCorrect', () => {
  it('MC: correct only when selectedIndex matches correctIndex', () => {
    expect(isCorrect(mc, { type: 'mc', selectedIndex: 2 })).toBe(true);
    expect(isCorrect(mc, { type: 'mc', selectedIndex: 0 })).toBe(false);
  });

  it('TF: correct only when selectedAnswer matches correctAnswer', () => {
    expect(isCorrect(tf, { type: 'tf', selectedAnswer: true })).toBe(true);
    expect(isCorrect(tf, { type: 'tf', selectedAnswer: false })).toBe(false);
  });

  it('Match: correct ONLY if every pair matches (all-or-nothing, §7.4)', () => {
    expect(isCorrect(match, { type: 'match', selected: { A: '1', B: '2', C: '3' } })).toBe(true);
    // two of three right is still a fail — no partial credit
    expect(isCorrect(match, { type: 'match', selected: { A: '1', B: '2', C: 'wrong' } })).toBe(false);
    expect(isCorrect(match, { type: 'match', selected: {} })).toBe(false);
  });

  it('an unanswered question counts as incorrect, not skipped', () => {
    expect(isCorrect(mc, undefined)).toBe(false);
  });

  it('a mismatched answer type never accidentally scores correct', () => {
    // e.g. leftover state from a previous question type — must not coerce
    expect(isCorrect(mc, { type: 'tf', selectedAnswer: true })).toBe(false);
    expect(isCorrect(tf, { type: 'mc', selectedIndex: 2 })).toBe(false);
  });
});

describe('pass threshold (§5.5 worked numbers)', () => {
  it('12-question FTE quiz needs >= 11 correct', () => {
    expect(passThreshold(12)).toBe(11);
  });

  it('8-question Intern quiz needs >= 7 correct', () => {
    expect(passThreshold(8)).toBe(7);
  });
});

describe('scoreQuiz end-to-end', () => {
  const questions = [mc, tf, match];

  it('all correct -> passes with 100%', () => {
    const answers: QuizAnswers = {
      'q-mc': { type: 'mc', selectedIndex: 2 },
      'q-tf': { type: 'tf', selectedAnswer: true },
      'q-match': { type: 'match', selected: { A: '1', B: '2', C: '3' } },
    };
    const result = scoreQuiz(questions, answers);
    expect(result).toEqual({ score: 3, total: 3, percentage: 100, passed: true });
  });

  it('exactly one wrong still passes (miss-at-most-one rule)', () => {
    const answers: QuizAnswers = {
      'q-mc': { type: 'mc', selectedIndex: 0 }, // wrong
      'q-tf': { type: 'tf', selectedAnswer: true },
      'q-match': { type: 'match', selected: { A: '1', B: '2', C: '3' } },
    };
    const result = scoreQuiz(questions, answers);
    expect(result.score).toBe(2);
    expect(result.passed).toBe(true); // 2 >= 3 - 1
  });

  it('two wrong fails', () => {
    const answers: QuizAnswers = {
      'q-mc': { type: 'mc', selectedIndex: 0 },
      'q-tf': { type: 'tf', selectedAnswer: false },
      'q-match': { type: 'match', selected: { A: '1', B: '2', C: '3' } },
    };
    const result = scoreQuiz(questions, answers);
    expect(result.score).toBe(1);
    expect(result.passed).toBe(false);
  });

  it('formatScore renders "X / Y correct (Z%)" per §7.5/§10.3', () => {
    const result = scoreQuiz(questions, {
      'q-mc': { type: 'mc', selectedIndex: 2 },
      'q-tf': { type: 'tf', selectedAnswer: true },
      'q-match': { type: 'match', selected: {} },
    });
    expect(formatScore(result)).toBe('2 / 3 correct (66.7%)');
  });
});
