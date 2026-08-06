/**
 * §5.5, one question per screen, fixed order (never shuffled, only MC
 * option order shuffles, inside McQuestionView). Progress bar is indigo,
 * visually distinct from Journey's teal (§5.5). Forward-only: the spec is
 * silent on a Back button here (unlike Journey's explicit one in §5.4), and
 * requiring an answer before advancing keeps "unanswered" from silently
 * slipping through as a wrong answer.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion, QuizAnswer, QuizAnswers } from '../types';
import ProgressBar from '../components/ProgressBar';
import McQuestionView from '../components/questions/McQuestionView';
import TfQuestionView from '../components/questions/TfQuestionView';
import MatchQuestionView from '../components/questions/MatchQuestionView';

interface QuizScreenProps {
  questions: QuizQuestion[];
  answers: QuizAnswers;
  onAnswerChange: (questionId: string, answer: QuizAnswer) => void;
  onSubmit: () => void;
}

export default function QuizScreen({ questions, answers, onAnswerChange, onSubmit }: QuizScreenProps) {
  const [qIndex, setQIndex] = useState(0);
  const question = questions[qIndex];
  const isLast = qIndex === questions.length - 1;
  const answer = answers[question.id];

  // Match questions require every pair filled before advancing; MC/TF just
  // need any answer recorded.
  const isAnswered =
    question.type === 'match'
      ? question.pairs.every((p) => answer?.type === 'match' && Boolean(answer.selected[p.left]))
      : answer !== undefined;

  function handleAdvance() {
    if (isLast) {
      onSubmit();
    } else {
      setQIndex((i) => i + 1);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-cg-cream px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        <ProgressBar value={(qIndex + 1) / questions.length} color="indigo" />
        <p className="mt-2 text-right text-xs text-cg-navy/60">
          Question {qIndex + 1} / {questions.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex w-full justify-center"
        >
          {question.type === 'mc' && (
            <McQuestionView
              question={question}
              value={answer?.type === 'mc' ? answer : undefined}
              onChange={(a) => onAnswerChange(question.id, a)}
            />
          )}
          {question.type === 'tf' && (
            <TfQuestionView
              question={question}
              value={answer?.type === 'tf' ? answer : undefined}
              onChange={(a) => onAnswerChange(question.id, a)}
            />
          )}
          {question.type === 'match' && (
            <MatchQuestionView
              question={question}
              value={answer?.type === 'match' ? answer : undefined}
              onChange={(a) => onAnswerChange(question.id, a)}
            />
          )}
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-md pt-6">
        <motion.button
          type="button"
          onClick={handleAdvance}
          disabled={!isAnswered}
          whileTap={isAnswered ? { scale: 0.97 } : undefined}
          className="min-h-tap w-full rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg disabled:opacity-30"
        >
          {isLast ? 'Submit Quiz' : 'Next'}
        </motion.button>
      </div>
    </main>
  );
}
