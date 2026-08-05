/**
 * The card face content (module label, title, body). Purely presentational —
 * the 3D flip transform and AnimatePresence mounting live in JourneyScreen,
 * which owns the transition; this component just renders one card's content.
 */
import type { StoryCard } from '../types';

interface StoryCardViewProps {
  card: StoryCard;
}

export default function StoryCardView({ card }: StoryCardViewProps) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-cg-lilac p-6 shadow-cg sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-cg-indigo/70">
        {card.module}
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-cg-navy sm:text-2xl">{card.title}</h2>
      <p className="mt-3 text-base leading-relaxed text-cg-navy sm:text-lg">{card.body}</p>
    </div>
  );
}
