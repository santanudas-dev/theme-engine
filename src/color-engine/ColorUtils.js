/**
 * Low-level color math. Every other engine builds on top of this — it never
 * makes design decisions, it just converts and combines colors correctly.
 */
export class ColorUtils {
  static clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  static normalizeHue(h) {
    return ((h % 360) + 360) % 360;
  }

  static isValidHex(hex) {
    return /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex);
  }

  static hexToRgb(hex) {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  static rgbToHex(r, g, b) {
    const toHex = (n) =>
      this.clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static hslToHex(h, s, l) {
    h = this.normalizeHue(h);
    s = this.clamp(s, 0, 100) / 100;
    l = this.clamp(l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return this.rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  static rgbToHsl(hex) {
    let { r, g, b } = this.hexToRgb(hex);

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;

      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  /** Linear RGB blend between two hex colors. weight=0 -> a, weight=1 -> b. */
  static mix(hexA, hexB, weight = 0.5) {
    const a = this.hexToRgb(hexA);
    const b = this.hexToRgb(hexB);
    const w = this.clamp(weight, 0, 1);

    return this.rgbToHex(
      a.r + (b.r - a.r) * w,
      a.g + (b.g - a.g) * w,
      a.b + (b.b - a.b) * w,
    );
  }

  static adjustLightness(hex, delta) {
    const { h, s, l } = this.rgbToHsl(hex);
    return this.hslToHex(h, s, this.clamp(l + delta, 0, 100));
  }

  static adjustSaturation(hex, delta) {
    const { h, s, l } = this.rgbToHsl(hex);
    return this.hslToHex(h, this.clamp(s + delta, 0, 100), l);
  }

  static withAlpha(hex, alpha) {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${this.clamp(alpha, 0, 1)})`;
  }
}
