import { ColorUtils } from "./ColorUtils.js";

/**
 * Turns any two colors into gradient CSS, and builds the standard
 * role-pair set (primary/secondary/accent, linear + radial) used by the
 * export panel and the gradient studio.
 */
export class GradientEngine {
  static linear(colorA, colorB, angle = 135) {
    return `linear-gradient(${angle}deg, ${colorA}, ${colorB})`;
  }

  static radial(colorA, colorB, shape = "circle") {
    return `radial-gradient(${shape}, ${colorA}, ${colorB})`;
  }

  static conic(colorA, colorB, angle = 0) {
    return `conic-gradient(from ${angle}deg, ${colorA}, ${colorB})`;
  }

  /** Three-stop version — blending through the midpoint avoids a hard seam
   *  when the two endpoints are far apart on the hue wheel. */
  static smoothLinear(colorA, colorB, angle = 135) {
    const mid = ColorUtils.mix(colorA, colorB, 0.5);
    return `linear-gradient(${angle}deg, ${colorA}, ${mid}, ${colorB})`;
  }

  static custom(
    colorA,
    colorB,
    { type = "linear", angle = 135, shape = "circle" } = {},
  ) {
    switch (type) {
      case "radial":
        return this.radial(colorA, colorB, shape);
      case "conic":
        return this.conic(colorA, colorB, angle);
      default:
        return this.linear(colorA, colorB, angle);
    }
  }

  /**
   * Builds linear + radial gradients for every primary/secondary/accent
   * pair, keyed the way the export panel and CSS output expect:
   * linearPrimarySecondary, radialPrimaryAccent, etc.
   */
  static generateAll(palette, angle = 135) {
    const pairs = [
      ["Primary", "Secondary", palette.primary, palette.secondary],
      ["Primary", "Accent", palette.primary, palette.accent],
      ["Secondary", "Accent", palette.secondary, palette.accent],
    ];

    const gradients = {};

    for (const [nameA, nameB, colorA, colorB] of pairs) {
      gradients[`linear${nameA}${nameB}`] = this.linear(colorA, colorB, angle);
      gradients[`radial${nameA}${nameB}`] = this.radial(colorA, colorB);
    }

    return gradients;
  }
}
