/**
 * Pupil coordinates for each Swifty pose, as fractions (0-1) of the source
 * PNG's own width/height. Measured directly from the pixel data (connected-
 * component detection on near-black pupils, cross-checked against zoomed
 * crops), not eyeballed.
 *
 * All four source PNGs are square canvases (1036x1036 / 504x504), and
 * SwiftyAvatar renders them with object-contain inside an equally square
 * box, so these fractions map 1:1 onto the rendered box with no letterbox
 * offset math needed.
 *
 * `curious` is intentionally omitted: Swifty holds a magnifying glass up to
 * one eye in that pose, and only one clean pupil blob could be reliably
 * detected, a symmetric two-eye blink can't be positioned with confidence,
 * so EyeBlinkOverlay renders nothing for that pose rather than guess.
 */
import type { SwiftyPose } from '../types';

export interface EyeCoord {
  cx: number;
  cy: number;
  r: number;
}

export const SWIFTY_EYES: Partial<Record<SwiftyPose, [EyeCoord, EyeCoord]>> = {
  welcome: [
    { cx: 0.441, cy: 0.402, r: 0.058 },
    { cx: 0.65, cy: 0.4, r: 0.058 },
  ],
  default: [
    { cx: 0.51, cy: 0.429, r: 0.064 },
    { cx: 0.703, cy: 0.425, r: 0.058 },
  ],
  thinking: [
    { cx: 0.425, cy: 0.385, r: 0.058 },
    { cx: 0.651, cy: 0.381, r: 0.056 },
  ],
};
