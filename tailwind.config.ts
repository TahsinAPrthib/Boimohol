import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "ink and old paper" palette — a secondhand-bookshop reading room,
        // not a generic SaaS palette.
        paper: "#EAE3D3", // aged paper background
        "paper-dark": "#DED4BC", // shelf / section divider tone
        ink: "#2A2420", // warm near-black for text (not pure #0B0B0B)
        cloth: "#253F54", // deep book-cloth blue — primary
        "cloth-light": "#3A5D78",
        oxblood: "#7C2D2D", // cloth-bound spine red — secondary
        turmeric: "#C68A1F", // accent — ratings, CTAs, highlights
        sage: "#5F7355", // available / success (exchange, in-stock)
      },
      fontFamily: {
        display: ["var(--font-tiro)", "serif"],
        body: ["var(--font-hind)", "sans-serif"],
      },
      borderRadius: {
        book: "3px", // book covers/spines: barely rounded, not "SaaS card" rounded
      },
      boxShadow: {
        shelf: "0 3px 0 0 rgba(42,36,32,0.15)", // a shelf-edge, not a soft ambient card shadow
        spine: "2px 0 4px rgba(42,36,32,0.25) inset",
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
