// ExportModal.jsx - Fixed positioning
import { X } from "lucide-react";
import engine from "../color-engine";

export default function ExportModal({
  open,
  onClose,
  activeTab,
  setActiveTab,
  exportContent,
  generatedTheme,
  theme,
}) {
  if (!open) return null;

  const tabs = ["css", "tailwind", "gradients", "shades", "contrast"];

  const renderContent = () => {
    if (activeTab === "shades") {
      return (
        <div className="space-y-4 p-6">
          {Object.entries(generatedTheme[theme].shades).map(
            ([role, shades]) => (
              <div key={role} className="flex items-center gap-4">
                <p className="w-28 font-medium capitalize flex-shrink-0">
                  {role}
                </p>

                <div className="flex flex-1 overflow-hidden rounded-xl">
                  {Object.entries(shades).map(([step, hex]) => (
                    <button
                      key={step}
                      onClick={() => navigator.clipboard.writeText(hex)}
                      title={`Copy ${hex}`}
                      className="group relative h-14 flex-1 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: hex }}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                        style={{
                          color: engine.bestTextOn(hex),
                        }}
                      >
                        {hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      );
    }

    if (activeTab === "contrast") {
      const palette = generatedTheme[theme].palette;
      const colorKeys = Object.keys(palette);

      return (
        <div className="p-6 overflow-auto">
          <p className="text-sm mb-4 text-text/70">
            Rows = surface color, columns = color placed on top.
          </p>

          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-text/10 p-3 bg-background sticky left-0">
                    &nbsp;
                  </th>
                  {colorKeys.map((col) => (
                    <th
                      key={col}
                      className="border border-text/10 p-3 capitalize"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {colorKeys.map((rowKey) => {
                  const rowColor = palette[rowKey];
                  return (
                    <tr key={rowKey}>
                      <th className="border border-text/10 p-3 capitalize bg-background sticky left-0">
                        {rowKey}
                      </th>
                      {colorKeys.map((colKey) => {
                        const colColor = palette[colKey];
                        if (rowKey === colKey) {
                          return (
                            <td
                              key={colKey}
                              className="border border-text/10 p-3 text-center"
                              style={{
                                backgroundColor: palette.background,
                                color: palette.text,
                              }}
                            >
                              —
                            </td>
                          );
                        }

                        const ratio = engine.contrastRatio(rowColor, colColor);
                        const grade = engine.contrastGrade(ratio);

                        let bg, text, label;
                        if (grade === "AAA") {
                          bg = "#16a34a";
                          text = "#ffffff";
                          label = "Excellent";
                        } else if (grade === "AA") {
                          bg = "#eab308";
                          text = "#111111";
                          label = "Good";
                        } else {
                          bg = "#dc2626";
                          text = "#ffffff";
                          label = "Poor";
                        }

                        return (
                          <td
                            key={colKey}
                            className="border border-text/10 p-2 text-center font-medium"
                            style={{
                              backgroundColor: bg,
                              color: text,
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <span>{ratio.toFixed(2)}:1</span>
                              <span className="text-[10px] opacity-80">
                                {label}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-5 text-xs font-medium flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600" />
              Excellent (AAA)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              Good (AA)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              Poor (Fail)
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <button
          onClick={() => navigator.clipboard.writeText(exportContent)}
          className="absolute top-4 right-4 px-4 py-2 text-sm rounded-full bg-background border border-black/10 dark:border-white/10 hover:bg-primary/5 transition-colors z-20"
        >
          Copy
        </button>

        <pre className="h-full overflow-auto p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed">
          {exportContent}
        </pre>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
      />

      {/* Modal */}
      <div className="relative w-[850px] max-w-[95vw] h-[600px] max-h-[90vh] bg-background rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <h2 className="text-xl font-semibold">Export theme</h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/5"
              }`}
            >
              {tab === "css"
                ? "CSS variables"
                : tab === "tailwind"
                  ? "Tailwind v4"
                  : tab}
            </button>
          ))}
        </div>

        {/* Dynamic content */}
        <div className="flex-1 relative overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}
