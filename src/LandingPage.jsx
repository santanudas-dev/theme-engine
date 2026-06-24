// LandingPage.jsx - Correct landing page component
import React from "react";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background text-text font-inter antialiased selection:bg-accent selection:text-background flex flex-col">
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20 md:py-28 overflow-hidden">
        {/* subtle glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 blur-3xl rounded-full"
          style={{
            background: "var(--radialSecondaryAccent)",
            transform: "translate(10%, -10%) scale(1.4)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Live palette preview
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
            Visualize{" "}
            <span
              className="gradient-text"
              style={{
                background: "var(--linearPrimarySecondary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              colors
            </span>
            ,{" "}
            <span
              className="gradient-text"
              style={{
                background: "var(--radialPrimaryAccent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              gradients
            </span>{" "}
            &amp; fonts on a real page
          </h1>

          <p className="mt-5 text-base md:text-lg text-text/70 max-w-xl mx-auto">
            Generate a full theme — base colors, 50–950 shade ramps and paired
            gradients — then export it straight to CSS or Tailwind v4.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              className="px-6 py-3 rounded-lg font-medium text-white shadow-md transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--primary)",
                backgroundImage: "var(--linearPrimarySecondary)",
              }}
            >
              Get started
            </button>
            <button
              className="px-6 py-3 rounded-lg font-medium border transition-all hover:bg-primary/10"
              style={{
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* ─── FEATURE GRID ──────────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20 bg-background/60 backdrop-blur-sm border-y border-primary/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Color harmony",
                desc: "Analogous, complementary, triadic – all generated from a single hue.",
                gradient: "var(--linearPrimarySecondary)",
              },
              {
                title: "Shade ramps",
                desc: "50–950 scales for every role, perfect for UI components.",
                gradient: "var(--radialPrimaryAccent)",
              },
              {
                title: "Gradients paired",
                desc: "Six curated gradients that match your palette out of the box.",
                gradient: "var(--linearSecondaryAccent)",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-background/80 shadow-sm border border-primary/5 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className="w-10 h-10 rounded-lg mb-4"
                  style={{ background: feat.gradient }}
                />
                <h3 className="text-lg font-semibold text-text">
                  {feat.title}
                </h3>
                <p className="text-sm text-text/70 mt-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PALETTE SHOWCASE ────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">
            <span
              className="gradient-text"
              style={{
                background: "var(--linearPrimaryAccent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your palette
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {["background", "primary", "secondary", "accent", "text"].map(
              (role) => {
                const colorValue =
                  getComputedStyle(document.documentElement)
                    .getPropertyValue(`--${role}`)
                    .trim() || "#888";

                const isLight = (hex) => {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
                };
                const textColor = isLight(colorValue) ? "#000" : "#fff";

                return (
                  <div
                    key={role}
                    className="rounded-xl p-4 text-center shadow-sm border border-white/10 transition-all hover:scale-105"
                    style={{
                      backgroundColor: colorValue,
                      color: textColor,
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                      {role}
                    </p>
                    <p className="font-mono text-sm mt-1">{colorValue}</p>
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "linearPrimarySecondary",
              "radialPrimaryAccent",
              "linearSecondaryAccent",
            ].map((name) => (
              <div
                key={name}
                className="h-20 rounded-xl shadow-sm border border-primary/5"
                style={{
                  background: `var(--${name})`,
                }}
              >
                <div className="flex items-center justify-end h-full px-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/80 drop-shadow">
                    {name.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-primary/10 py-6 px-6 text-center text-sm text-text/50">
        <p>
          Built with{" "}
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            SmartPaletteEngine
          </span>{" "}
          · live theme from your color engine
        </p>
      </footer>
    </div>
  );
}
