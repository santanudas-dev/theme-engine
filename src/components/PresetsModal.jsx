// PresetsModal.jsx - Fixed positioning
import { X } from "lucide-react";
import engine from "../color-engine";

export default function PresetsModal({ open, onClose, onSelect }) {
  if (!open) return null;

  const presets = engine.presets || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
      />

      {/* Modal */}
      <div className="relative w-[850px] max-w-[95vw] max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Presets
          </h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6 overflow-y-auto flex-1">
          {presets.map((preset) => {
            const colors = [
              preset.background,
              preset.primary,
              preset.secondary,
              preset.accent,
              preset.text,
            ];

            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelect(preset.id);
                  onClose();
                }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-3 px-3 hover:scale-[1.02] hover:shadow-lg transition-all"
              >
                <div className="flex h-10 rounded-lg overflow-hidden mb-2">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
                <p className="font-semibold text-zinc-900 dark:text-white text-center text-sm">
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
