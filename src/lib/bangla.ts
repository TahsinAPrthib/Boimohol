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
