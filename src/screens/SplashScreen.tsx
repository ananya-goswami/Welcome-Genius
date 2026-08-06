/**
 * §5.1, full-bleed gradient, Swifty in "welcome" pose, title, subtitle,
 * single CTA. Uses the shared SwiftyAvatar (default 'md' size) rather than
 * its own <img>, so Swifty renders at the same size here as on every other
 * screen, per §8's "consistent size across screens" rule.
 */
import SwiftyAvatar from '../components/SwiftyAvatar';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-splash px-6 py-12 text-center">
      <SwiftyAvatar pose="welcome" />

      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-cg-white sm:text-5xl">
        Welcome <span className="text-cg-teal">Genius</span>
      </h1>

      <p className="mt-3 max-w-xs text-base text-cg-lilac sm:max-w-sm sm:text-lg">
        Your ConveGenius journey begins here
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 min-h-tap min-w-tap rounded-full bg-cg-cta px-8 py-3 font-display text-lg font-semibold text-cg-white shadow-cg-lg active:scale-95"
      >
        Let's go →
      </button>
    </main>
  );
}
