/**
 * §5.5 — quiz, one question per screen. Phase 2 scaffolding only: this is a
 * placeholder that proves the state machine wiring (question set, progress,
 * submit -> Results) works. The three real question renderers (MC/TF/match)
 * replace this in Phase 4 — see components/questions/.
 *
 * Progress bar uses indigo fill (vs. Journey's teal) per §5.5's "visually
 * distinct from the journey progress bar" note.
 */
import type { QuizQuestion } from '../types';

interface QuizScreenProps {
  questions: QuizQuestion[];
  onSubmit: () => void;
}

export default function QuizScreen({ questions, onSubmit }: QuizScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-cg-cream px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-cg-lilac">
          <div className="h-full w-full rounded-full bg-cg-indigo" />
        </div>
        <p className="mt-2 text-right text-xs text-cg-navy/60">Quiz · {questions.length} questions</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-xl font-bold text-cg-navy">Quiz screen (Phase 4 builds this)</p>
        <p className="mt-2 max-w-sm text-sm text-cg-navy/70">
          {questions.length} questions assembled for your path. Question renderers land in Phase 4.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md pt-6">
        <button
          type="button"
          onClick={onSubmit}
          className="min-h-tap w-full rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg active:scale-95"
        >
          Submit (placeholder)
        </button>
      </div>
    </main>
  );
}
