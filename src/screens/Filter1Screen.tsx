/**
 * §5.2, Filter 1: role selection. Three large tappable cards.
 * Selecting Intern skips Filter 2 entirely (handled by the caller, App.tsx;
 * this component only reports the choice upward).
 */
import type { Role } from '../types';

interface Filter1ScreenProps {
  onSelect: (role: Role) => void;
}

const ROLE_OPTIONS: Array<{ role: Role; label: string; blurb: string }> = [
  { role: 'central', label: 'Central FTE', blurb: 'Full-time, Central team' },
  { role: 'state', label: 'State FTE', blurb: 'Full-time, State team' },
  { role: 'intern', label: 'Intern', blurb: 'Internship program' },
];

export default function Filter1Screen({ onSelect }: Filter1ScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12">
      <h2 className="text-center font-display text-2xl font-bold text-cg-navy sm:text-3xl">
        Which team are you joining?
      </h2>
      <p className="mt-2 text-center text-sm text-cg-navy/70 sm:text-base">
        This tells us what to show you next.
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-4">
        {ROLE_OPTIONS.map(({ role, label, blurb }) => (
          <button
            key={role}
            type="button"
            onClick={() => onSelect(role)}
            className="min-h-tap rounded-3xl bg-cg-lilac px-6 py-5 text-left shadow-cg active:scale-95"
          >
            <span className="block font-display text-lg font-semibold text-cg-indigo">{label}</span>
            <span className="block text-sm text-cg-navy/70">{blurb}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
