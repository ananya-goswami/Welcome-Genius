/**
 * Swifty, rendered at a consistent on-screen size across all four poses and
 * crossfaded between them (§8 — "swap pose via crossfade... never a hard
 * cut"). The four PNGs have different natural canvases (welcome is
 * 1036x1036, the rest 504x504) with different padding, so sizing is fixed
 * by the wrapping box + object-contain rather than the image's own pixels,
 * and bottom-anchored so Swifty's feet don't jump between poses.
 */
import { AnimatePresence, motion } from 'framer-motion';
import type { SwiftyPose } from '../types';

interface SwiftyAvatarProps {
  pose: SwiftyPose;
  className?: string;
}

const POSE_LABEL: Record<SwiftyPose, string> = {
  welcome: 'Swifty, waving hello',
  default: 'Swifty',
  thinking: 'Swifty, thinking',
  curious: 'Swifty, looking through a magnifying glass',
};

export default function SwiftyAvatar({ pose, className = '' }: SwiftyAvatarProps) {
  return (
    <div className={`relative flex h-40 w-40 items-end justify-center sm:h-48 sm:w-48 ${className}`}>
      <AnimatePresence mode="sync">
        <motion.img
          key={pose}
          src={`/swifty/swifty-${pose}.png`}
          alt={POSE_LABEL[pose]}
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
}
