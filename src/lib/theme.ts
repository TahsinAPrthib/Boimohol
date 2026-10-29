// Day or night colours. By default the site follows the device (the
// prefers-color-scheme media query in globals.css); a reader can also pick
// day or night for this browser, in settings or in the reader. The choice is
// a cookie, read by THEME_SCRIPT in <head> before the first paint, so a page
// never flashes the other palette first. No cookie means "follow the device".

export const THEME_COOKIE = "bm-theme";
export const THEME_CHOICES = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export function parseThemeChoice(value: string | null | undefined): ThemeChoice {
  return value === "light" || value === "dark" ? value : "system";
}

// The browser's own bar: the cloth blue by day, the bars' brown at night.
export const THEME_COLOR = { light: "#253F54", dark: "#241D17" } as const;

export function themeCookie(choice: ThemeChoice): string {
  return choice === "system"
    ? `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`
    : `${THEME_COOKIE}=${choice}; path=/; max-age=31536000; samesite=lax`;
}

// Inlined in <head> (layout.tsx). Kept tiny and free of anything that could
// throw before the page is drawn; the browser bar's colour can wait for the
// metadata tags to be parsed.
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)(?:;|$)/);if(!m)return;document.documentElement.setAttribute("data-theme",m[1]);var c=m[1]==="dark"?"${THEME_COLOR.dark}":"${THEME_COLOR.light}";document.addEventListener("DOMContentLoaded",function(){var t=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<t.length;i++)t[i].setAttribute("content",c)})}catch(e){}})()`;

// Switches the palette at once, for this browser, and remembers it.
export function applyTheme(choice: ThemeChoice) {
  document.cookie = themeCookie(choice);
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const forDark = choice === "system" ? meta.media.includes("dark") : choice === "dark";
    meta.content = forDark ? THEME_COLOR.dark : THEME_COLOR.light;
  }
}

// Whether the night palette is showing now (chosen, or the device's).
export function nightShowing(): boolean {
  const chosen = document.documentElement.getAttribute("data-theme");
  if (chosen) return chosen === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
