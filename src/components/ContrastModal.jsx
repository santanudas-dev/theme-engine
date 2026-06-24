// ContrastModal.jsx - Fixed positioning
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import engine from "../color-engine";

function ColorDropdown({ label, value, setValue, base, shades }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </label>

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-11 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between w-full"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className="flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-[100]">
          {Object.entries(shades).map(([role, steps]) => (
            <div key={role}>
              <p className="px-3 py-2 text-xs font-bold uppercase text-zinc-400 bg-zinc-50 dark:bg-zinc-800 sticky top-0">
                {role}
              </p>

              <button
                onClick={() => {
                  setValue(base[role]);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
              >
                {role} (base) — {base[role]}
              </button>

              {Object.values(steps).map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    setValue(hex);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3 text-sm"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  {hex}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContrastModal({
  open,
  onClose,
  generatedTheme,
  theme,
}) {
  if (!open || !generatedTheme?.[theme]) return null;

  const palette = generatedTheme[theme];
  const base = palette.palette;
  const shades = palette.shades;

  const [bg, setBg] = useState(base.background);
  const [fg, setFg] = useState(base.text);

  const ratio = engine.contrastRatio(bg, fg);
  const grade = engine.contrastGrade(ratio);

  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;
  const passesLarge = ratio >= 3;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
      />

      {/* Modal */}
      <div className="relative w-[540px] max-w-[95vw] max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Contrast checker
          </h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <ColorDropdown
              label="Background"
              value={bg}
              setValue={setBg}
              base={base}
              shades={shades}
            />

            <ColorDropdown
              label="Text / Foreground"
              value={fg}
              setValue={setFg}
              base={base}
              shades={shades}
            />
          </div>

          <div
            className="mt-5 h-28 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl font-bold"
            style={{
              backgroundColor: bg,
              color: fg,
            }}
          >
            The quick brown fox
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <p className="font-mono text-lg font-semibold text-zinc-900 dark:text-white">
              {ratio.toFixed(2)}:1
            </p>

            <div className="flex gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  passesLarge
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                Large text · {passesLarge ? "AA" : "Fail"} (3:1)
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  passesAA
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                Normal text · {passesAA ? "AA" : "Fail"} (4.5:1)
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  passesAAA
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                AAA ({grade})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
