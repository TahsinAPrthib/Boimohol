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
    },
  },
  plugins: [],
};
export default config;
