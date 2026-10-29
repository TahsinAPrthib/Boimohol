import type { Config } from "tailwindcss";

// Each colour is a CSS variable (RGB channels) set in globals.css, once for
// the day palette and once for night, so every utility follows the theme and
// opacity modifiers (text-ink/70) keep working.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // The old text-opacity-*/bg-opacity-* utilities (unused here) make every
  // coloured element set its own --tw-*-opacity variable, which costs style
  // time on each page load now that the palette itself is variables.
  // Colour/alpha modifiers (text-ink/70) don't need them.
  corePlugins: {
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
  },
  theme: {
    extend: {
      colors: {
        // "ink and old paper" palette — a secondhand-bookshop reading room,
        // not a generic SaaS palette. Day values here; night in globals.css.
        paper: token("paper"), // aged paper background, #EAE3D3
        "paper-dark": token("paper-dark"), // shelf / section divider tone, #DED4BC
        ink: token("ink"), // warm near-black for text (not pure #0B0B0B), #2A2420
        cloth: token("cloth"), // deep book-cloth blue — primary, #253F54
        "cloth-light": token("cloth-light"), // #3A5D78
        oxblood: token("oxblood"), // cloth-bound spine red — secondary, #7C2D2D
        turmeric: token("turmeric"), // accent — ratings, CTAs, highlights, #C68A1F
        sage: token("sage"), // available / success (exchange, in-stock), #465A3E
        // Text on a turmeric ground. Turmeric stays light at night while ink
        // turns light, so this one stays dark in both palettes.
        "on-accent": token("on-accent"),
      },
      fontFamily: {
        display: ["var(--font-tiro)", "serif"],
        body: ["var(--font-hind)", "sans-serif"],
      },
      borderRadius: {
        book: "3px", // book covers/spines: barely rounded, not "SaaS card" rounded
      },
      boxShadow: {
        shelf: "0 3px 0 0 rgb(var(--c-shadow) / 0.15)", // a shelf-edge, not a soft ambient card shadow
        spine: "2px 0 4px rgb(var(--c-shadow) / 0.25) inset",
      },
      maxWidth: {
        prose: "68ch",
      },
      // Small, slow feedback -- a reading room, not an arcade. Apply these
      // with the motion-safe: variant so reduced-motion users never get them.
      keyframes: {
        settle: {
          "0%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)" },
        },
        "star-pop": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        "bookmark-drop": {
          "0%": { transform: "translateY(-4px)", opacity: "0.5" },
          "70%": { transform: "translateY(1px)", opacity: "1" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        settle: "settle 420ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        "star-pop": "star-pop 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "bookmark-drop": "bookmark-drop 480ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
