/**
 * §5.6 / §7.5 — name capture, then the printable completion certificate.
 * Certificate ID keeps the exact SWFTY- format per §7.5 (HR may verify
 * against it); only the visible footer text is rebranded to Welcome Genius
 * — this split was an explicit user decision, not a default.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserPath } from '../types';
import type { ScoreResult } from '../logic/scoring';
import { formatScore } from '../logic/scoring';
import { ROLE_LABEL, formatCompletionDate } from '../logic/certificate';
import SwiftyAvatar from '../components/SwiftyAvatar';

interface CertificateScreenProps {
  path: UserPath;
  result: ScoreResult;
  name: string;
  certificateId: string;
  completedDate: Date;
  onNameSubmit: (name: string) => void;
}

export default function CertificateScreen({
  path,
  result,
  name,
  certificateId,
  completedDate,
  onNameSubmit,
}: CertificateScreenProps) {
  const [draft, setDraft] = useState('');

  if (!name) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-cg-cream px-6 py-12">
        <SwiftyAvatar pose="welcome" size="sm" />
        <h2 className="mt-4 text-center font-display text-2xl font-bold text-cg-navy">
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
          <motion.button
            type="submit"
            disabled={!draft.trim()}
            whileTap={draft.trim() ? { scale: 0.97 } : undefined}
            className="min-h-tap rounded-2xl bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg disabled:opacity-40"
          >
            Generate certificate
          </motion.button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-cg-cream px-4 py-10 print:bg-white print:p-0 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-lg rounded-3xl border-4 border-cg-lilac bg-cg-white p-6 shadow-cg-lg print:max-w-full print:rounded-none print:border-2 print:border-cg-indigo print:shadow-none sm:p-10"
      >
        <div className="rounded-2xl bg-cg-cta px-4 py-3 text-center print:bg-white print:border print:border-cg-indigo">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cg-white print:text-cg-indigo sm:text-sm">
            Certificate of Completion
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <SwiftyAvatar pose="welcome" size="sm" />
        </div>

        <p className="mt-4 text-center text-sm text-cg-navy/60">This certifies that</p>
        <h1 className="mt-1 text-center font-display text-3xl font-bold text-cg-navy sm:text-4xl">{name}</h1>
        <p className="mt-3 text-center text-sm text-cg-navy/70 sm:text-base">has successfully completed the</p>
        <p className="mt-1 text-center font-display text-xl font-semibold text-cg-indigo sm:text-2xl">
          {ROLE_LABEL[path.role]} Induction Journey
        </p>

        <div className="mx-auto mt-8 h-px w-full max-w-xs bg-cg-lilac print:bg-cg-indigo/30" />

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:text-base">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-cg-navy/50">Score</dt>
            <dd className="font-semibold text-cg-navy">{formatScore(result)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-cg-navy/50">Date Completed</dt>
            <dd className="font-semibold text-cg-navy">{formatCompletionDate(completedDate)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-cg-navy/50">Certificate ID</dt>
            <dd className="font-mono text-cg-navy">{certificateId}</dd>
          </div>
        </dl>

        <p className="mt-8 text-center text-xs text-cg-navy/50">
          Completed via Welcome Genius · ConveGenius Induction
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => window.print()}
        whileTap={{ scale: 0.95 }}
        className="mt-6 min-h-tap rounded-full bg-cg-cta px-8 py-3 font-display font-semibold text-cg-white shadow-cg print:hidden"
      >
        Print / Save as PDF
      </motion.button>
    </main>
  );
}
