import { SmartPaletteEngine } from "./SmartPaletteEngine.js";
import { GradientEngine } from "./GradientEngine.js";
import { ExportEngine } from "./ExportEngine.js";
import { ContrastEngine } from "./ContrastEngine.js";
import { PRESETS } from "./PresetLibrary.js";

const engine = new SmartPaletteEngine();

const palette = {
  // generation
  shuffle: (options = {}) => engine.shuffle(options),
  setColor: (role, hex, theme, options = {}) =>
    engine.setColor(role, hex, theme, options),
  toggleLock: (role) => engine.toggleLock(role),
  getLocks: () => engine.getLocks(),

  // presets
  presets: PRESETS,
  applyPreset: (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) throw new Error(`Unknown preset: ${id}`);
    return engine.applyPreset(preset);
  },

  // history
  prev: () => engine.prev(),
  next: () => engine.next(),
  canPrev: () => engine.history.canPrev(),
  canNext: () => engine.history.canNext(),
  current: () => engine.history.current,

  // one-off helpers that don't touch history or the locked palette
  customGradient: (colorA, colorB, options = {}) =>
    GradientEngine.custom(colorA, colorB, options),
  contrastRatio: (a, b) => ContrastEngine.ratio(a, b),
  contrastGrade: (ratio) => ContrastEngine.grade(ratio),
  bestTextOn: (hex) => ContrastEngine.bestText(hex),

  // export — operates on the current light/dark pair
  exportCSS: () => ExportEngine.toCSSVariables(engine.history.current),
  exportTailwind: () => ExportEngine.toTailwindV4(engine.history.current),
  exportJSON: () => ExportEngine.toJSON(engine.history.current),
};

export default palette;
