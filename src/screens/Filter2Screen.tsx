/**
 * §5.3, Filter 2: gender, FTE only. Never shown to Interns (App.tsx skips
 * straight to Journey for role === 'intern').
 */
import type { Gender } from '../types';

interface Filter2ScreenProps {
  onSelect: (gender: Gender) => void;
}

// Display labels only, the underlying Gender union ('woman' | 'man') is the
// exact §3.1 type used throughout the data layer and is left unchanged.
const GENDER_OPTIONS: Array<{ gender: Gender; label: string }> = [
  { gender: 'woman', label: 'Female' },
  { gender: 'man', label: 'Male' },
];

export default function Filter2Screen({ onSelect }: Filter2ScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12">
      <h2 className="text-center font-display text-2xl font-bold text-cg-navy sm:text-3xl">
        One more thing
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-cg-navy/70 sm:text-base">
        So we show you the right parental leave info.
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-4">
        {GENDER_OPTIONS.map(({ gender, label }) => (
          <button
            key={gender}
            type="button"
            onClick={() => onSelect(gender)}
            className="min-h-tap rounded-3xl bg-cg-lilac px-6 py-5 text-center font-display text-lg font-semibold text-cg-indigo shadow-cg active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>
    </main>
  );
}
