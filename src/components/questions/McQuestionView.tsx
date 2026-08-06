/**
 * Multiple choice. Option ORDER is shuffled at render time on a copy (§7.1)
 *, the source array in quiz.ts is never mutated, and the stored answer
 * always references the option's original index so scoring.ts's
 * `selectedIndex === question.correctIndex` check needs no changes.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { McQuestion, McAnswer } from '../../types';

interface McQuestionViewProps {
  question: McQuestion;
  value?: McAnswer;
  onChange: (answer: McAnswer) => void;
}

function shuffledWithOriginalIndex(options: string[]): Array<{ text: string; originalIndex: number }> {
  const withIndex = options.map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = withIndex.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]];
  }
  return withIndex;
}

export default function McQuestionView({ question, value, onChange }: McQuestionViewProps) {
  // Shuffled once per question, not on every re-render (e.g. while the user
  // is still deciding), re-shuffling mid-question would be disorienting.
  const options = useMemo(() => shuffledWithOriginalIndex(question.options), [question.id]);

  return (
    <div className="w-full max-w-md">
      <p className="font-display text-xl font-bold text-cg-navy sm:text-2xl">{question.question}</p>
      <div className="mt-6 flex flex-col gap-3">
        {options.map(({ text, originalIndex }) => {
          const selected = value?.selectedIndex === originalIndex;
          return (
            <motion.button
              key={originalIndex}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ type: 'mc', selectedIndex: originalIndex })}
              className={`min-h-tap rounded-2xl border-2 px-5 py-4 text-left font-body text-base transition-colors ${
                selected
                  ? 'border-cg-indigo bg-cg-indigo text-cg-white'
                  : 'border-cg-lilac bg-cg-white text-cg-navy'
              }`}
            >
              {text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
