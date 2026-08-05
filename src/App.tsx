/**
 * Phase 0 placeholder. This is intentionally just a branded title card that
 * proves the scaffold works: Tailwind tokens (§8), @fontsource faces, and the
 * supplied Swifty PNG all resolving. The Screen state machine (§4) arrives in
 * Phase 2 — nothing here should be treated as the real Splash screen.
 */
export default function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-splash px-6 py-12 text-center">
      {/* The canvas is larger than Swifty himself now that the former white
          matte is transparent padding, so a 192/224px canvas lands the mascot
          at roughly 159/189px — inside §8's 140-200px range. */}
      <img
        src="/swifty/swifty-welcome.png"
        alt="Swifty, the ConveGenius mascot, with wings spread in welcome"
        className="w-48 max-w-full sm:w-56"
      />

      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-cg-white sm:text-5xl">
        Welcome <span className="text-cg-teal">Genius</span>
      </h1>

      <p className="mt-3 max-w-xs text-base text-cg-lilac sm:max-w-sm sm:text-lg">
        Your ConveGenius journey begins here
      </p>

      <span className="mt-10 rounded-full bg-cg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-cg-teal">
        Phase 0 · scaffold
      </span>
    </main>
  );
}
