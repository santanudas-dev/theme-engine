import { ColorUtils } from "./ColorUtils.js";

/**
 * Builds a 50–950 shade ramp from a single hue/saturation pair.
 *
 * The original version held saturation constant and only swept lightness,
 * which clips out at the extremes — 50 and 950 end up either washed out or
 * muddy because a fully-saturated hue can't stay vivid at 97% or 8% lightness.
 * Tailwind's own palettes desaturate as they approach white/black; this curve
 * does the same, so `sat` is a *multiplier* on the base saturation, not the
 * saturation itself.
 */
export class ShadeGenerator {
  static curve = {
    50: { l: 97, sat: 0.35 },
    100: { l: 94, sat: 0.45 },
    200: { l: 87, sat: 0.6 },
    300: { l: 77, sat: 0.75 },
    400: { l: 66, sat: 0.9 },
    500: { l: 55, sat: 1 },
    600: { l: 46, sat: 0.95 },
    700: { l: 37, sat: 0.9 },
    800: { l: 27, sat: 0.85 },
    900: { l: 18, sat: 0.8 },
    950: { l: 10, sat: 0.7 },
  };

  static generate(h, s) {
    const shades = {};

    for (const key in this.curve) {
      const { l, sat } = this.curve[key];
      shades[key] = ColorUtils.hslToHex(
        h,
        ColorUtils.clamp(s * sat, 0, 100),
        l,
      );
    }

    return shades;
  }

  /** Snaps an arbitrary hex onto the nearest 50–950 key of a given ramp. */
  static closestKey(shades, hex) {
    const target = ColorUtils.rgbToHsl(hex).l;
    let best = "500";
    let bestDiff = Infinity;

    for (const key in shades) {
      const diff = Math.abs(ColorUtils.rgbToHsl(shades[key]).l - target);

      if (diff < bestDiff) {
        bestDiff = diff;
        best = key;
      }
    }

    return best;
  }
}
