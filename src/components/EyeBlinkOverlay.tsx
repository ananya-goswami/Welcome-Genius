/**
 * A code-built (CSS/SVG, per CLAUDE.md rule 3, no new image assets) blink:
 * a small cream ellipse sits over each pupil, scaled almost flat (invisible)
 * at rest and briefly scaled up to fully cover the pupil, then back down,
 * i.e. animating scaleY between "sliver" and "closed", not editing the PNG.
 *
 * Positioned by percentage over SWIFTY_EYES' fractional coordinates; see
 * that file for why this maps 1:1 onto SwiftyAvatar's box with no offset
 * math. Renders nothing for poses without known eye coordinates (curious).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SwiftyPose } from '../types';
import { SWIFTY_EYES } from '../data/swiftyEyes';

interface EyeBlinkOverlayProps {
  pose: SwiftyPose;
}

export default function EyeBlinkOverlay({ pose }: EyeBlinkOverlayProps) {
  const eyes = SWIFTY_EYES[pose];
  // Randomized once per mount so multiple Swifty instances (or repeated
  // pose changes) don't all blink in lockstep, a small touch that reads
  // as more alive than a perfectly metronomic blink.
  const [delay] = useState(() => Math.random() * 2);

  if (!eyes) return null;

  return (
    <>
      {eyes.map((eye, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full bg-cg-cream"
          style={{
            left: `${(eye.cx - eye.r) * 100}%`,
            top: `${(eye.cy - eye.r) * 100}%`,
            width: `${eye.r * 2 * 100}%`,
            height: `${eye.r * 2 * 100}%`,
          }}
          initial={{ scaleY: 0.05 }}
          animate={{ scaleY: [0.05, 0.05, 1, 0.05] }}
          transition={{
            duration: 0.22,
            times: [0, 0.6, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 3.4,
            delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}
