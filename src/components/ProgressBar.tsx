/**
 * Teal fill on a lilac track (§8), animated width transition. Journey uses
 * teal; Quiz (Phase 4) uses indigo so the two progress bars read as visually
 * distinct phases per §5.5.
 */
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-1
  color?: 'teal' | 'indigo';
}

export default function ProgressBar({ value, color = 'teal' }: ProgressBarProps) {
  const fillClass = color === 'teal' ? 'bg-cg-teal' : 'bg-cg-indigo';
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cg-lilac" role="progressbar" aria-valuenow={Math.round(pct)}>
      <motion.div
        className={`h-full rounded-full ${fillClass}`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      />
    </div>
  );
}
