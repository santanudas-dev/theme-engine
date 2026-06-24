import { ColorUtils } from "./ColorUtils.js";
import { ContrastEngine } from "./ContrastEngine.js";
import { HarmonyEngine } from "./HarmonyEngine.js";
import { ShadeGenerator } from "./ShadeGenerator.js";
import { GradientEngine } from "./GradientEngine.js";
import { HistoryManager } from "./HistoryManager.js";

const COLOR_ROLES = ["background", "primary", "secondary", "accent"];
const ALL_ROLES = ["text", ...COLOR_ROLES];

/**
 * Per-role, per-theme S/L recipe. Hue is always the only variable —
 * S and L are always derived from this table so light↔dark is a pure
 * relight, never a re-roll.
 */
const THEME_TOKENS = {
  light: {
    text: { s: 20, l: 12 },
    background: { s: 18, l: 92 },
    primary: { s: 70, l: 46 },
    secondary: { s: 55, l: 54 },
    accent: { s: 78, l: 50 },
  },
  dark: {
    text: { s: 18, l: 90 },
    background: { s: 20, l: 10 },
    primary: { s: 58, l: 64 },
    secondary: { s: 48, l: 66 },
    accent: { s: 70, l: 60 },
  },
};

function freshIdentity() {
  return {
    background: { mode: "auto", hue: 0 },
    primary: { mode: "auto", hue: 0 },
    secondary: { mode: "auto", hue: 0 },
    accent: { mode: "auto", hue: 0 },
    text: { mode: "auto" },
  };
}

/**
 * Render a non-text color role.
 *
 * Manual identity:
 *   – In the theme it was picked in  → return the exact hex the user chose.
 *   – In the other theme             → relight using that theme's S/L recipe
 *                                      but the SAME hue, so the dark version
 *                                      is clearly "the same color, just adapted".
 *
 * Auto identity: always use the recipe.
 */
function renderColorRole(identity, role, theme) {
  const token = THEME_TOKENS[theme][role];

  if (identity.mode === "manual") {
    if (identity.setInTheme === theme) {
      // Exact pick — honour it.
      return identity.hex;
    }
    // Other theme: relight from the stored hue. This is what makes
    // "manually set primary in light → dark primary follows the same hue"
    // work correctly.
    return ColorUtils.hslToHex(identity.hue, token.s, token.l);
  }

  return ColorUtils.hslToHex(identity.hue, token.s, token.l);
}

/**
 * Text has no hue recipe — it's always "whatever is most readable" unless
 * the user explicitly picked a text color.
 */
function renderTextRole(identity, background, theme) {
  const token = THEME_TOKENS[theme].text;

  if (identity.mode === "manual" && identity.setInTheme === theme) {
    return identity.hex;
  }

  const hue =
    identity.mode === "manual"
      ? identity.hue
      : ColorUtils.rgbToHsl(background).h;

  const textColor = ColorUtils.hslToHex(hue, token.s, token.l);

  return ContrastEngine.ensureContrast(background, textColor, 7);
}

export class SmartPaletteEngine {
  constructor() {
    this.identities = freshIdentity();
    this.locks = {
      text: false,
      background: false,
      primary: false,
      secondary: false,
      accent: false,
    };
    this.scheme = "analogous";
    this.history = new HistoryManager();
  }

  /**
   * Shuffle — rerolls every *unlocked* role's hue.
   *
   * KEY FIX for the lock glitch:
   *
   * HarmonyEngine.generate(baseHue, scheme) returns THREE hues with offsets
   * [0, X, Y] — meaning index[0] is always identical to baseHue. The old
   * code assigned index[0] to BOTH background AND primary, so locking one
   * made the other look identical to it (same hue, same recipe → same colour).
   *
   * Fix: background gets its OWN independent small offset from the base hue
   * so it's always slightly different from primary. Primary still anchors the
   * palette; background is a near-neutral derivative.
   */
  shuffle({ scheme = this.scheme } = {}) {
    this.scheme = scheme;

    // Derive base hue from the highest-priority locked role.
    const lockedSource =
      (this.locks.primary && this.identities.primary) ||
      (this.locks.background && this.identities.background) ||
      (this.locks.secondary && this.identities.secondary) ||
      (this.locks.accent && this.identities.accent) ||
      null;

    const baseHue = Math.floor(Math.random() * 360);

    // Get the three harmony hues (primary / secondary / accent offsets).
    const [huePrimary, hueSecondary, hueAccent] = HarmonyEngine.generate(
      baseHue,
      scheme,
    );

    // Background gets a slight offset from primary so they're never identical.
    // We nudge it by +15° (arbitrary but consistent).
    const hueBackground = ColorUtils.normalizeHue(huePrimary + 15);

    if (!this.locks.background)
      this.identities.background = { mode: "auto", hue: hueBackground };

    if (!this.locks.primary)
      this.identities.primary = { mode: "auto", hue: huePrimary };

    if (!this.locks.secondary)
      this.identities.secondary = { mode: "auto", hue: hueSecondary };

    if (!this.locks.accent)
      this.identities.accent = { mode: "auto", hue: hueAccent };

    return this._commit();
  }

  /**
   * Manually sets one role's color in the given theme.
   *
   * Does NOT auto-lock — locking is always the user's explicit action.
   * This keeps the engine and UI lock states in perfect sync.
   *
   * autoHarmonize: rerolls all unlocked sibling roles to a harmony derived
   * from the picked hue. Works for every role (not just primary/background).
   */
  setColor(
    role,
    hex,
    theme,
    { autoHarmonize = false, skipHistory = false } = {},
  ) {
    const { h } = ColorUtils.rgbToHsl(hex);

    this.identities[role] = { mode: "manual", hex, setInTheme: theme, hue: h };

    if (autoHarmonize) {
      const [huePrimary, hueSecondary, hueAccent] = HarmonyEngine.generate(
        h,
        this.scheme,
      );
      const hueBackground = ColorUtils.normalizeHue(huePrimary + 15);

      if (!this.locks.background && role !== "background")
        this.identities.background = { mode: "auto", hue: hueBackground };
      if (!this.locks.primary && role !== "primary")
        this.identities.primary = { mode: "auto", hue: huePrimary };
      if (!this.locks.secondary && role !== "secondary")
        this.identities.secondary = { mode: "auto", hue: hueSecondary };
      if (!this.locks.accent && role !== "accent")
        this.identities.accent = { mode: "auto", hue: hueAccent };
      // text always re-derives from background — no hue to assign.
    }

    if (skipHistory) {
      return {
        light: this._renderTheme("light"),
        dark: this._renderTheme("dark"),
        meta: {
          scheme: this.scheme,
          locks: { ...this.locks },
        },
      };
    }

    return this._commit();
  }

  /** Explicit toggle — the ONLY place locks change. */
  toggleLock(role) {
    this.locks[role] = !this.locks[role];
    return this.locks;
  }

  /** Apply a preset — resets all locks first so the full palette is replaced. */
  applyPreset(preset) {
    for (const role of ALL_ROLES) this.locks[role] = false;

    for (const role of ALL_ROLES) {
      const hex = preset[role];
      if (!hex) continue;
      this.identities[role] = {
        mode: "manual",
        hex,
        setInTheme: "light",
        hue: ColorUtils.rgbToHsl(hex).h,
      };
    }

    return this._commit();
  }

  prev() {
    return this.history.canPrev() ? this.history.prev() : null;
  }
  next() {
    return this.history.canNext() ? this.history.next() : null;
  }
  getLocks() {
    return { ...this.locks };
  }

  _hueOf(identity) {
    return identity.mode === "manual"
      ? ColorUtils.rgbToHsl(identity.hex).h
      : (identity.hue ?? 0);
  }

  _renderTheme(theme) {
    const palette = {};

    for (const role of COLOR_ROLES) {
      palette[role] = renderColorRole(this.identities[role], role, theme);
    }
    palette.text = renderTextRole(
      this.identities.text,
      palette.background,
      theme,
    );

    const shades = {};
    for (const role of ALL_ROLES) {
      const { h, s } = ColorUtils.rgbToHsl(palette[role]);
      shades[role] = ShadeGenerator.generate(h, s);
    }

    const gradients = GradientEngine.generateAll(palette);

    const contrast = {
      textOnBackground: Number(
        ContrastEngine.ratio(palette.background, palette.text).toFixed(2),
      ),
      primaryOnBackground: Number(
        ContrastEngine.ratio(palette.background, palette.primary).toFixed(2),
      ),
      textGrade: ContrastEngine.grade(
        ContrastEngine.ratio(palette.background, palette.text),
      ),
      matrix: ContrastEngine.matrix(palette),
    };

    return { palette, shades, gradients, contrast };
  }

  _commit() {
    const result = {
      light: this._renderTheme("light"),
      dark: this._renderTheme("dark"),
      meta: { scheme: this.scheme, locks: { ...this.locks } },
    };
    this.history.save(result);
    return result;
  }
}
