/**
 * §5.6 / §7.5 — name capture, then the certificate. Phase 2 scaffolding:
 * the name-input gate and correct data are wired up; the actual printable
 * certificate design (§7.5's full layout) is built in Phase 6.
 */
import { useState } from 'react';
import type { UserPath } from '../types';
import type { ScoreResult } from '../logic/scoring';
import { formatScore } from '../logic/scoring';

interface CertificateScreenProps {
  path: UserPath;
  result: ScoreResult;
  name: string;
  onNameSubmit: (name: string) => void;
}

const ROLE_LABEL: Record<UserPath['role'], string> = {
  central: 'Central FTE',
  state: 'State FTE',
  intern: 'Intern',
};

export default function CertificateScreen({ path, result, name, onNameSubmit }: CertificateScreenProps) {
  const [draft, setDraft] = useState('');

  if (!name) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12">
        <h2 className="text-center font-display text-2xl font-bold text-cg-navy">
          What's your name for the certificate?
        </h2>
        <form
          className="mt-6 flex w-full max-w-sm flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            if (trimmed) onNameSubmit(trimmed);
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your full name"
            className="min-h-tap rounded-2xl border-2 border-cg-lilac bg-cg-white px-4 py-3 text-cg-navy outline-none focus:border-cg-indigo"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="min-h-tap rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg active:scale-95 disabled:opacity-40"
          >
            Generate certificate
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12 text-center">
      <div className="w-full max-w-md rounded-3xl bg-cg-white p-8 shadow-cg-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-cg-indigo/70">
          Certificate of Completion
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-cg-navy">{name}</h2>
        <p className="mt-1 text-cg-navy/70">{ROLE_LABEL[path.role]}</p>
        <p className="mt-4 text-cg-navy">{formatScore(result)}</p>
        <p className="mt-6 text-xs text-cg-navy/50">Full certificate design lands in Phase 6.</p>
      </div>
    </main>
  );
}
