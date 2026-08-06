/**
 * §5.4, tap-through story journey, Phase 3: real 3D perspective card-flip
 * transitions (direction-aware, Next flips one way, Back the other),
 * Swifty pose crossfade (SwiftyAvatar), animated progress bar, and spring
 * tap feedback on the nav buttons.
 *
 * `cards` must already be filtered by visibleTo() and sorted by `order`;
 * this component does not filter. App.tsx is the single source of that
 * derivation so there is only one place the golden rule is enforced.
 */
import { useRef, useEffect } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { StoryCard } from '../types';
import SwiftyAvatar from '../components/SwiftyAvatar';
import ProgressBar from '../components/ProgressBar';
import StoryCardView from '../components/StoryCardView';

interface JourneyScreenProps {
  cards: StoryCard[];
  index: number;
  onNext: () => void;
  onBack: () => void;
}

// direction: 1 = advancing (Next), -1 = retreating (Back). The flip rotates
// around the Y axis away from the direction of travel, like a page turning.
const cardVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? 70 : -70,
    x: direction > 0 ? 60 : -60,
  }),
  center: { opacity: 1, rotateY: 0, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? -70 : 70,
    x: direction > 0 ? -60 : 60,
  }),
};

export default function JourneyScreen({ cards, index, onNext, onBack }: JourneyScreenProps) {
  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  // Tracks whether the most recent index change was a Next or a Back, purely
  // to pick which way the 3D flip rotates, compared during render, synced
  // after via effect (standard "previous value" pattern).
  const prevIndexRef = useRef(index);
  const direction = index >= prevIndexRef.current ? 1 : -1;
  useEffect(() => {
    prevIndexRef.current = index;
  }, [index]);

  if (!card) return null; // App.tsx transitions to 'quiz' once index passes the last card

  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-cg-cream px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        <ProgressBar value={(index + 1) / cards.length} color="teal" />
        <p className="mt-2 text-right text-xs text-cg-navy/60">
          {index + 1} / {cards.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <SwiftyAvatar pose={card.pose} />

        {/* perspective on the parent is what makes the child's rotateY read
            as a 3D flip rather than a flat squash */}
        <div className="relative mt-6 w-full max-w-md" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={card.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <StoryCardView card={card} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 pt-6">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          whileTap={isFirst ? undefined : { scale: 0.95 }}
          className="min-h-tap min-w-tap rounded-2xl px-6 py-3 font-display font-semibold text-cg-indigo disabled:opacity-30"
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          whileTap={{ scale: 0.95 }}
          className="min-h-tap min-w-tap rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg"
        >
          {isLast ? 'Start Quiz →' : 'Next'}
        </motion.button>
      </div>
    </main>
  );
}
