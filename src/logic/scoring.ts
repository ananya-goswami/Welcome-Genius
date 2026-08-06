/**
 * Quiz scoring, implemented exactly per docs/GAME_SPEC.md §7.4 and §5.5.
 *
 * - Each MC/TF question = 1 point if correct.
 * - Each Match question = 1 point only if ALL pairs are correct, else 0.
 * - Pass rule: score >= questions.length - 1 (miss at most one).
 *   FTE: 12 questions -> need >= 11 (91.7%). Intern: 8 -> need >= 7 (87.5%).
 */
import type { QuizQuestion, QuizAnswer, QuizAnswers } from '../types';

/** Whether a single answered question is correct. Missing/undefined answers
 * (e.g. an unanswered question at submit time) count as incorrect. */
export function isCorrect(question: QuizQuestion, answer: QuizAnswer | undefined): boolean {
  if (!answer) return false;

  switch (question.type) {
    case 'mc':
      return answer.type === 'mc' && answer.selectedIndex === question.correctIndex;

    case 'tf':
      return answer.type === 'tf' && answer.selectedAnswer === question.correctAnswer;

    case 'match':
      if (answer.type !== 'match') return false;
      return question.pairs.every((pair) => answer.selected[pair.left] === pair.right);
  }
}

export interface ScoreResult {
  score: number;
  total: number;
  percentage: number; // 0-100, one decimal place, e.g. 91.7
  passed: boolean;
}

/** Pass threshold per §5.5: at most one question may be wrong. */
export function passThreshold(total: number): number {
  return total - 1;
}

export function scoreQuiz(questions: QuizQuestion[], answers: QuizAnswers): ScoreResult {
  const total = questions.length;
  const score = questions.reduce((sum, q) => sum + (isCorrect(q, answers[q.id]) ? 1 : 0), 0);
  const percentage = Math.round((score / total) * 1000) / 10; // one decimal place
  const passed = score >= passThreshold(total);
  return { score, total, percentage, passed };
}

/** "X / Y correct (Z%)", the exact certificate/log format from §7.5/§10.3. */
export function formatScore(result: ScoreResult): string {
  return `${result.score} / ${result.total} correct (${result.percentage}%)`;
}
