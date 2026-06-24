import { ColorUtils } from "./ColorUtils.js";

/**
 * WCAG contrast math, plus a small "fixer" that nudges a foreground color
 * along its own lightness axis until it actually clears a target ratio,
 * instead of just picking pure black/white as a fallback.
 */
export class ContrastEngine {
  static luminance(hex) {
    const { r, g, b } = ColorUtils.hexToRgb(hex);

    const normalize = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    return (
      0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b)
    );
  }

  static ratio(c1, c2) {
    const l1 = this.luminance(c1);
    const l2 = this.luminance(c2);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  static bestText(bg) {
    const white = "#ffffff";
    const black = "#000000";

    return this.ratio(bg, white) > this.ratio(bg, black) ? white : black;
  }

  static grade(ratio) {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    if (ratio >= 3) return "AA (large text)";
    return "Fail";
  }

  /**
   * Walks `fg` lighter or darker (keeping its hue/saturation) until it clears
   * `minRatio` against `bg`. Falls back to pure black/white only if the hue
   * genuinely can't get there.
   */
  static ensureContrast(bg, fg, minRatio = 4.5) {
    if (this.ratio(bg, fg) >= minRatio) return fg;

    const { h, s, l } = ColorUtils.rgbToHsl(fg);
    const bgIsLight = ColorUtils.rgbToHsl(bg).l > 50;
    const step = bgIsLight ? -2 : 2;

    let lightness = l;

    for (let i = 0; i < 50; i++) {
      lightness = ColorUtils.clamp(lightness + step, 0, 100);
      const candidate = ColorUtils.hslToHex(h, s, lightness);

      if (this.ratio(bg, candidate) >= minRatio) return candidate;
      if (lightness === 0 || lightness === 100) break;
    }

    return this.bestText(bg);
  }

  /**
   * Every role compared against every other role — `matrix[a][b]` is the
   * ratio/grade you'd get using `a` as the surface and `b` on top of it.
   * Symmetric in value (ratio(a,b) === ratio(b,a)), kept as a full grid
   * anyway so the UI can label cells by "this on top of that".
   */
  static matrix(palette) {
    const roles = Object.keys(palette);
    const rows = {};

    for (const surface of roles) {
      rows[surface] = {};

      for (const onTop of roles) {
        if (surface === onTop) continue;

        const ratio = this.ratio(palette[surface], palette[onTop]);
        rows[surface][onTop] = {
          ratio: Number(ratio.toFixed(2)),
          grade: this.grade(ratio),
        };
      }
    }

    return rows;
  }
}
