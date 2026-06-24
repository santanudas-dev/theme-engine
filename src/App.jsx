// App.jsx - Fixed landing page rendering
import { useEffect } from "react";
import engine from "./color-engine/index";
import { useTheme } from "tailwind-theme-provider";
import { useState } from "react";
import {
  Dices,
  MoonStar,
  Redo,
  Sun,
  Undo,
  ChevronDown,
  Lock,
  LockOpen,
  CircleCheck,
  CircleAlert,
  CircleX,
  Download,
  Palette,
  Contrast,
  Menu,
  X,
} from "lucide-react";
import { useRef } from "react";
import ExportModal from "./components/ExportModal";
import ContrastModal from "./components/ContrastModal";
import PresetsModal from "./components/PresetsModal";
import LandingPage from "./LandingPage";

export default function App() {
  const { theme, setTheme } = useTheme();
  const [generatedTheme, setGeneratedTheme] = useState(() => engine.shuffle());
  const [scheme, setScheme] = useState("all");
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [autoHarmonize] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [activeExportTab, setActiveExportTab] = useState("css");
  const [showPresets, setShowPresets] = useState(false);
  const [showContrast, setShowContrast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const schemes = [
    "all",
    "monochromatic",
    "analogous",
    "complementary",
    "splitComplementary",
    "triadic",
    "tetradic",
  ];

  const canUndo = engine.canPrev();
  const canRedo = engine.canNext();

  const changeColor = (role, color) => {
    const updated = engine.setColor(role, color, theme, {
      autoHarmonize,
    });
    setGeneratedTheme(updated);
  };

  const getContrastMeta = (key, value) => {
    let ratio;
    if (key === "text") {
      ratio = engine.contrastRatio(
        generatedTheme[theme].palette.background,
        value,
      );
    } else {
      ratio = engine.contrastRatio(generatedTheme[theme].palette.text, value);
    }
    const grade = engine.contrastGrade(ratio);
    if (grade === "AAA") {
      return {
        ratio,
        grade,
        icon: CircleCheck,
        color: "#22c55e",
      };
    }
    if (grade === "AA") {
      return {
        ratio,
        grade,
        icon: CircleAlert,
        color: "#eab308",
      };
    }
    return {
      ratio,
      grade,
      icon: CircleX,
      color: "#ef4444",
    };
  };

  const getExportContent = () => {
    if (activeExportTab === "css") return engine.exportCSS();
    if (activeExportTab === "tailwind") return engine.exportTailwind();
    if (activeExportTab === "gradients")
      return JSON.stringify(generatedTheme[theme].gradients, null, 2);
    if (activeExportTab === "shades")
      return JSON.stringify(generatedTheme[theme].shades, null, 2);
    if (activeExportTab === "contrast")
      return JSON.stringify(generatedTheme[theme].contrast, null, 2);
    return "";
  };

  const toggleLock = (role) => {
    engine.toggleLock(role);
    setGeneratedTheme((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        locks: engine.getLocks(),
      },
    }));
  };

  const applyTheme = (themeObject) => {
    const current = theme === "dark" ? themeObject.dark : themeObject.light;
    Object.entries(current.palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    Object.entries(current.gradients).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  };

  const generateTheme = () => {
    const newTheme = engine.shuffle({ scheme });
    setGeneratedTheme(newTheme);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (generatedTheme) {
      applyTheme(generatedTheme);
    }
  }, [theme, generatedTheme]);

  const undoTheme = () => {
    const prevTheme = engine.prev();
    if (prevTheme) {
      setGeneratedTheme(prevTheme);
    }
    setMobileMenuOpen(false);
  };

  const redoTheme = () => {
    const nextTheme = engine.next();
    if (nextTheme) {
      setGeneratedTheme(nextTheme);
    }
    setMobileMenuOpen(false);
  };

  // Mobile action buttons (for the dropdown menu)
  const MobileActions = () => (
    <div className="flex flex-col gap-2 p-4 bg-background/95 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl min-w-[200px]">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={undoTheme}
          disabled={!canUndo}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-background/80 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
        >
          <Undo size={20} />
          <span className="text-[10px] font-medium">Undo</span>
        </button>
        <button
          onClick={redoTheme}
          disabled={!canRedo}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-background/80 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
        >
          <Redo size={20} />
          <span className="text-[10px] font-medium">Redo</span>
        </button>
        <button
          className="flex flex-col items-center justify-center gap-1 p-3 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => setTheme(theme == "light" ? "dark" : "light")}
        >
          {theme == "light" ? <Sun size={20} /> : <MoonStar size={20} />}
          <span className="text-[10px] font-medium">
            {theme == "light" ? "Dark" : "Light"}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            setShowExport(true);
            setMobileMenuOpen(false);
          }}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-accent rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            color: engine.bestTextOn(generatedTheme[theme].palette.accent),
          }}
        >
          <Download size={20} />
          <span className="text-[10px] font-medium">Export</span>
        </button>
        <button
          onClick={() => {
            setShowPresets(true);
            setMobileMenuOpen(false);
          }}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <Palette size={20} />
          <span className="text-[10px] font-medium">Palette</span>
        </button>
        <button
          onClick={() => {
            setShowContrast(true);
            setMobileMenuOpen(false);
          }}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <Contrast size={20} />
          <span className="text-[10px] font-medium">Contrast</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background text-text font-inter relative">
      {/* Landing Page - full width */}
      <LandingPage />

      {/* ─── RESPONSIVE TOOLBAR ────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-[9998]">
        <div className="bg-white/95 dark:bg-black/80 backdrop-blur-lg shadow-2xl border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5">
          {/* Color chips - clean grid on mobile, flex on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {Object.entries(generatedTheme[theme].palette).map(
              ([key, value]) => {
                const textColor = engine.bestTextOn(value);
                const locked = generatedTheme.meta?.locks?.[key];
                const pickerRef = useRef(null);
                const contrastMeta = getContrastMeta(key, value);
                const ContrastIcon = contrastMeta.icon;

                return (
                  <div
                    key={key}
                    onClick={() => pickerRef.current?.showPicker?.()}
                    className="relative group flex flex-col rounded-xl gap-1 items-center justify-center px-2 py-3 sm:py-4 text-xs font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: value,
                      color: textColor,
                    }}
                  >
                    <input
                      ref={pickerRef}
                      type="color"
                      value={value}
                      onChange={(e) => changeColor(key, e.target.value)}
                      className="sr-only"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(key);
                      }}
                      className="absolute -top-1.5 -right-1.5 z-20 p-1 rounded-full shadow-sm"
                      style={{
                        backgroundColor: textColor,
                        color: value,
                      }}
                    >
                      {locked ? <Lock size={12} /> : <LockOpen size={12} />}
                    </button>
                    <div className="absolute -top-1.5 -left-1.5 z-20 group/status">
                      <div
                        className="p-1 rounded-full shadow-sm"
                        style={{ backgroundColor: contrastMeta.color }}
                      >
                        <ContrastIcon size={10} color="white" />
                      </div>
                      <div
                        className="absolute top-[-300%] left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded-md opacity-0 scale-90 group-hover/status:opacity-100 group-hover/status:scale-100 transition-all text-white flex text-nowrap pointer-events-none"
                        style={{ backgroundColor: contrastMeta.color }}
                      >
                        {contrastMeta.ratio.toFixed(2)}:1
                      </div>
                    </div>
                    <p className="capitalize text-[10px] sm:text-xs font-bold tracking-wide">
                      {key}
                    </p>
                    <p className="font-mono text-[8px] sm:text-[10px] opacity-80">
                      {value}
                    </p>
                  </div>
                );
              },
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-black/10 dark:border-white/10 mb-3 sm:mb-4" />

          {/* Toolbar actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Generate + scheme picker */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <button
                  className="p-2.5 sm:p-3 cursor-pointer rounded-l-xl bg-primary hover:opacity-90 transition-opacity flex items-center gap-1"
                  onClick={generateTheme}
                  style={{
                    color: engine.bestTextOn(
                      generatedTheme[theme].palette.primary,
                    ),
                  }}
                >
                  <Dices size={18} />
                  <span className="hidden sm:inline text-xs font-medium ml-1">
                    Generate
                  </span>
                </button>
                <button
                  onClick={() => setShowSchemeModal((prev) => !prev)}
                  className="p-2.5 sm:p-3 px-2 h-full border-l border-white/20 rounded-r-xl cursor-pointer bg-primary hover:opacity-90 transition-opacity relative z-20"
                  style={{
                    color: engine.bestTextOn(
                      generatedTheme[theme].palette.primary,
                    ),
                  }}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      showSchemeModal ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showSchemeModal && (
                  <div className="absolute bottom-full mb-2 left-0 min-w-44 z-50 rounded-xl border border-black/10 dark:border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {schemes.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setScheme(item);
                          setShowSchemeModal(false);
                          generateTheme();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-primary/10 transition-colors ${
                          scheme === item ? "bg-primary/10 font-semibold" : ""
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-text/50 font-medium hidden md:inline capitalize">
                {scheme}
              </span>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={undoTheme}
                disabled={!canUndo}
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Undo size={18} />
              </button>
              <button
                onClick={redoTheme}
                disabled={!canRedo}
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Redo size={18} />
              </button>
              <button
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setTheme(theme == "light" ? "dark" : "light")}
              >
                {theme == "light" ? <Sun size={18} /> : <MoonStar size={18} />}
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="p-2.5 bg-accent rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  color: engine.bestTextOn(
                    generatedTheme[theme].palette.accent,
                  ),
                }}
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowPresets(true)}
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <Palette size={18} />
              </button>
              <button
                onClick={() => setShowContrast(true)}
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <Contrast size={18} />
              </button>
            </div>

            {/* Mobile: Generate text + menu toggle */}
            <div className="flex items-center gap-2 sm:hidden">
              <span className="text-xs font-medium text-primary/80">
                {scheme}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 bg-background/80 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute bottom-full mb-3 right-0 z-50">
            <MobileActions />
          </div>
        )}
      </div>

      {/* Modals */}
      <PresetsModal
        open={showPresets}
        onClose={() => setShowPresets(false)}
        onSelect={(presetId) => {
          const result = engine.applyPreset(presetId);
          setGeneratedTheme(result);
        }}
      />

      <ContrastModal
        open={showContrast}
        onClose={() => setShowContrast(false)}
        generatedTheme={generatedTheme}
        theme={theme}
      />
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        activeTab={activeExportTab}
        setActiveTab={setActiveExportTab}
        exportContent={getExportContent()}
        generatedTheme={generatedTheme}
        theme={theme}
      />
    </div>
  );
}
