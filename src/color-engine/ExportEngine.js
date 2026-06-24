/**
 * Turns an engine result ({ light, dark }) into copy-pasteable output.
 * Every export defines the light theme in `:root` and only the *dark*
 * overrides in `.dark` — so flipping themes in a real project is just
 * toggling that class, the same way the toolbar's theme switch works here.
 */
export class ExportEngine {
  static _varLines({ palette, shades, gradients }, { comments = true } = {}) {
    const lines = [];

    if (comments) lines.push("  /* Base colors */");
    for (const role in palette) {
      lines.push(`  --${role}: ${palette[role]};`);
    }

    if (comments) lines.push("", "  /* Shade ramps */");
    for (const role in shades) {
      for (const key in shades[role]) {
        lines.push(`  --${role}-${key}: ${shades[role][key]};`);
      }
    }

    if (comments) lines.push("", "  /* Gradients */");
    for (const name in gradients) {
      lines.push(`  --${name}: ${gradients[name]};`);
    }

    return lines;
  }

  static toCSSVariables({ light, dark }) {
    return [
      ":root {",
      ...this._varLines(light),
      "}",
      "",
      "/* Dark mode — add the .dark class anywhere above this subtree */",
      ".dark {",
      ...this._varLines(dark, { comments: false }),
      "}",
    ].join("\n");
  }

  /**
   * Tailwind v4 keeps theme tokens in `@theme`, but `@theme` variables must
   * be defined top-level (not inside a class selector) — so dark-mode
   * overrides can't live there directly. The documented workaround is to
   * keep the actual values as plain CSS variables in `:root` / `.dark`,
   * then point `@theme inline` at them with `var(...)`. That's what this
   * generates, plus the one-line `@custom-variant` needed for `dark:`
   * utilities to follow a class instead of the OS preference.
   */
  static toTailwindV4({ light, dark }) {
    const toKebab = (name) =>
      name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    const themeLines = ["@theme inline {"];
    for (const role in light.palette) {
      themeLines.push(`  --color-${role}: var(--${role});`);
    }
    for (const role in light.shades) {
      for (const key in light.shades[role]) {
        themeLines.push(`  --color-${role}-${key}: var(--${role}-${key});`);
      }
    }
    for (const name in light.gradients) {
      themeLines.push(`  --background-image-${toKebab(name)}: var(--${name});`);
    }
    themeLines.push("}");

    return [
      '@import "tailwindcss";',
      "@custom-variant dark (&:where(.dark, .dark *));",
      "",
      ":root {",
      ...this._varLines(light),
      "}",
      "",
      ".dark {",
      ...this._varLines(dark, { comments: false }),
      "}",
      "",
      ...themeLines,
    ].join("\n");
  }

  static toJSON(result) {
    return JSON.stringify(result, null, 2);
  }
}
