/**
 * §5.6 / §5.5 fail branch — pass routes onward to Certificate, fail shows a
 * kind Swifty message with a single "Review and retry" CTA (no shaming
 * copy, per §5.5). Confetti-on-pass is Phase 7; this is the correct
 * branching, copy, and entrance motion.
 */
import { motion } from 'framer-motion';
import SwiftyAvatar from '../components/SwiftyAvatar';
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
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="flex flex-col items-center"
      >
        <SwiftyAvatar pose={result.passed ? 'welcome' : 'thinking'} />

        {result.passed ? (
          <>
            <h2 className="mt-4 font-display text-2xl font-bold text-cg-navy sm:text-3xl">
              You passed! 🎉
            </h2>
            <p className="mt-2 text-cg-navy/70">{formatScore(result)}</p>
            <motion.button
              type="button"
              onClick={onContinue}
              whileTap={{ scale: 0.95 }}
              className="mt-8 min-h-tap rounded-full bg-cg-cta px-8 py-3 font-display text-lg font-semibold text-cg-white shadow-cg-lg"
            >
              Get your certificate →
            </motion.button>
          </>
        ) : (
          <>
            <h2 className="mt-4 font-display text-2xl font-bold text-cg-navy sm:text-3xl">
              So close!
            </h2>
            <p className="mt-2 max-w-sm text-cg-navy/70">
              Let's take another lap through the basics. {formatScore(result)}
            </p>
            <motion.button
              type="button"
              onClick={onRetry}
              whileTap={{ scale: 0.95 }}
              className="mt-8 min-h-tap rounded-full bg-cg-cta px-8 py-3 font-display text-lg font-semibold text-cg-white shadow-cg-lg"
            >
              Review and retry
            </motion.button>
          </>
        )}
      </motion.div>
    </main>
  );
}
