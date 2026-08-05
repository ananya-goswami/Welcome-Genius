/** True / False. Two large tappable options, no trick wording (§7.1). */
import { motion } from 'framer-motion';
import type { TfQuestion, TfAnswer } from '../../types';

interface TfQuestionViewProps {
  question: TfQuestion;
  value?: TfAnswer;
  onChange: (answer: TfAnswer) => void;
}

export default function TfQuestionView({ question, value, onChange }: TfQuestionViewProps) {
  return (
    <div className="w-full max-w-md">
      <p className="font-display text-xl font-bold text-cg-navy sm:text-2xl">{question.statement}</p>
      <div className="mt-6 flex gap-4">
        {[true, false].map((option) => {
          const selected = value?.selectedAnswer === option;
          return (
            <motion.button
              key={String(option)}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ type: 'tf', selectedAnswer: option })}
              className={`min-h-tap flex-1 rounded-2xl border-2 py-5 font-display text-lg font-semibold transition-colors ${
                selected
                  ? 'border-cg-indigo bg-cg-indigo text-cg-white'
                  : 'border-cg-lilac bg-cg-white text-cg-navy'
              }`}
            >
              {option ? 'True' : 'False'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
