/**
 * §5.4 — tap-through story journey. Phase 2 scaffolding: layout and
 * navigation only (progress bar, avatar, Back/Next). Card transition
 * animation and pose crossfade arrive in Phase 3.
 *
 * `cards` must already be filtered by visibleTo() and sorted by `order` —
 * this component does not filter; App.tsx is the single source of that
 * derivation so there is only one place the golden rule is enforced.
 */
import type { StoryCard } from '../types';

interface JourneyScreenProps {
  cards: StoryCard[];
  index: number;
  onNext: () => void;
  onBack: () => void;
}

export default function JourneyScreen({ cards, index, onNext, onBack }: JourneyScreenProps) {
  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  if (!card) return null; // App.tsx transitions to 'quiz' once index passes the last card

  return (
    <main className="flex min-h-dvh flex-col bg-cg-cream px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Journey progress bar — teal fill on lilac track (§8) */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-cg-lilac">
          <div
            className="h-full rounded-full bg-cg-teal"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-cg-navy/60">
          {index + 1} / {cards.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <img
          src={`/swifty/swifty-${card.pose}.png`}
          alt={`Swifty, ${card.pose}`}
          className="w-40 max-w-full sm:w-48"
        />

        <div className="mt-6 w-full max-w-md rounded-3xl bg-cg-lilac p-6 shadow-cg">
          <p className="text-xs font-semibold uppercase tracking-widest text-cg-indigo/70">
            {card.module}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-cg-navy sm:text-2xl">
            {card.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-cg-navy sm:text-lg">{card.body}</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="min-h-tap min-w-tap rounded-2xl px-6 py-3 font-display font-semibold text-cg-indigo disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="min-h-tap min-w-tap rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg active:scale-95"
        >
          {isLast ? 'Start Quiz →' : 'Next'}
        </button>
      </div>
    </main>
  );
}
