/**
 * Pure hue math: given a base hue and a scheme name, returns the hues for
 * [primary, secondary, accent]. Knows nothing about saturation, lightness,
 * or theme — that's SmartPaletteEngine's job.
 */
export class HarmonyEngine {
  static schemes = {
    monochromatic: [0, 0, 0],
    analogous: [0, 30, -30],
    // Accent sits 30° off the true complement so it reads as a distinct
    // color rather than a tinted twin of primary.
    complementary: [0, 180, 150],
    splitComplementary: [0, 150, 210],
    triadic: [0, 120, 240],
    tetradic: [0, 90, 180],
  };

  static getRandomScheme() {
    const keys = Object.keys(this.schemes);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  /**
   * @param {number} baseHue 0-360
   * @param {string} scheme one of `schemes`, or "all" for a random pick
   * @param {object} options
   * @param {number} options.jitter degrees of randomness to add per hue (0 = exact)
   */
  static generate(baseHue, scheme = "analogous", { jitter = 0 } = {}) {
    if (scheme === "all" || !scheme) {
      scheme = this.getRandomScheme();
    }

    const offsets = this.schemes[scheme];

    if (!offsets) {
      throw new Error(`Invalid scheme: ${scheme}`);
    }

    return offsets.map((offset) => {
      const wobble = jitter ? (Math.random() * 2 - 1) * jitter : 0;
      return (((baseHue + offset + wobble) % 360) + 360) % 360;
    });
  }
}
