// Bangla numeral formatting.
//
// The app is Bangla-first, so any number rendered next to Bangla text should be
// in Bangla digits. Interpolating a raw JS number produces Latin digits, which
// reads as a typo beside hand-written numerals -- "৫.০ (1টি পর্যালোচনা)".
//
// Kept in one place because the same local helper had already been rewritten in
// two components before this was centralised. Pure and dependency-free, so it
// is safe to import from client and server components alike.

/** Integer or whole number, e.g. 1234 -> "১,২৩৪". */
export function bn(value: number): string {
  if (!Number.isFinite(value)) return "০";
  return value.toLocaleString("bn-BD", { maximumFractionDigits: 0 });
}

/** A calendar year, e.g. 2026 -> "২০২৬". bn() would group it as "২,০২৬". */
export function bnYear(value: number): string {
  if (!Number.isFinite(value)) return bn(0);
  return value.toLocaleString("bn-BD", { useGrouping: false, maximumFractionDigits: 0 });
}

/** A number written as is, without grouping, e.g. an ebook's 1342 -> "১৩৪২". */
export function bnPlain(value: number): string {
  return bnYear(value);
}

/** Fixed decimals, e.g. bnFixed(4.5) -> "৪.৫". Used for ratings. */
export function bnFixed(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return bn(0);
  return value.toLocaleString("bn-BD", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Money. Prices are whole taka in this app, so trailing ".00" is dropped, but a
 * fractional price still renders rather than being silently rounded away.
 */
export function bnTaka(value: number): string {
  if (!Number.isFinite(value)) return `৳${bn(0)}`;
  const formatted = Number.isInteger(value)
    ? bn(value)
    : value.toLocaleString("bn-BD", { maximumFractionDigits: 2 });
  return `৳${formatted}`;
}

// Dates are shown in Bangladesh time wherever the server happens to run.
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Dhaka",
};

/** A date, e.g. "১২ অক্টো, ২০২৬". */
export function bnDate(value: Date): string {
  return value.toLocaleDateString("bn-BD", DATE_OPTIONS);
}

/** Date and 24-hour time, e.g. "১২ অক্টো, ২০২৬, ০২:৩০" -- no Latin "AM". */
export function bnDateTime(value: Date): string {
  return value.toLocaleString("bn-BD", { ...DATE_OPTIONS, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}
