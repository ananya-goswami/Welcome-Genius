/**
 * §5.6 / §5.5 fail branch — pass routes onward to Certificate, fail shows a
 * kind Swifty message with a single "Review and retry" CTA. Phase 2
 * scaffolding: correct branching and copy, minimal styling.
 */
import type { ScoreResult } from '../logic/scoring';
import { formatScore } from '../logic/scoring';

interface ResultsScreenProps {
  result: ScoreResult;
  onContinue: () => void; // pass -> certificate name capture
  onRetry: () => void; // fail -> reset journey/quiz, back to Journey
}

export default function ResultsScreen({ result, onContinue, onRetry }: ResultsScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12 text-center">
      <img
        src={`/swifty/swifty-${result.passed ? 'welcome' : 'thinking'}.png`}
        alt="Swifty"
        className="w-40 max-w-full sm:w-48"
      />

      {result.passed ? (
        <>
          <h2 className="mt-6 font-display text-2xl font-bold text-cg-navy sm:text-3xl">
            You passed! 🎉
          </h2>
          <p className="mt-2 text-cg-navy/70">{formatScore(result)}</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-8 min-h-tap rounded-full bg-cg-cta px-8 py-3 font-display text-lg font-semibold text-cg-white shadow-cg-lg active:scale-95"
          >
            Get your certificate →
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-6 font-display text-2xl font-bold text-cg-navy sm:text-3xl">
            So close!
          </h2>
          <p className="mt-2 max-w-sm text-cg-navy/70">
            Let's take another lap through the basics. {formatScore(result)}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-8 min-h-tap rounded-full bg-cg-cta px-8 py-3 font-display text-lg font-semibold text-cg-white shadow-cg-lg active:scale-95"
          >
            Review and retry
          </button>
        </>
      )}
    </main>
  );
}
