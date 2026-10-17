// Shared by the reader's server page and its client controls.

// Text sizes the reader offers, in px; the default is the second.
export const READER_SIZES = [16, 18, 20, 22, 25];
export const DEFAULT_SIZE_STEP = 1;
// A preference cookie (not a login or tracking cookie), so the page arrives
// at the chosen size instead of jumping to it after it loads.
export const READER_SIZE_COOKIE = "reader-size";

export function readSizeStep(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n < READER_SIZES.length ? n : DEFAULT_SIZE_STEP;
}

// Readers who aren't signed in keep their place in this browser.
export const positionStorageKey = (bookId: string) => `boimohol:reader:${bookId}`;
export type StoredPosition = { chapter: string; label: string; progress: number; at: number };

// The stored value as text: what useSyncExternalStore compares.
export function readStoredRaw(bookId: string): string | null {
  try {
    return window.localStorage.getItem(positionStorageKey(bookId));
  } catch {
    return null;
  }
}

export function readStoredPosition(bookId: string): StoredPosition | null {
  return parseStoredPosition(readStoredRaw(bookId));
}

export function parseStoredPosition(raw: string | null): StoredPosition | null {
  try {
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredPosition>;
    if (typeof p.chapter !== "string" || typeof p.progress !== "number" || typeof p.label !== "string") return null;
    return { chapter: p.chapter, label: p.label, progress: Math.min(1, Math.max(0, p.progress)), at: Number(p.at) || 0 };
  } catch {
    return null;
  }
}

export function writeStoredPosition(bookId: string, position: StoredPosition) {
  try {
    window.localStorage.setItem(positionStorageKey(bookId), JSON.stringify(position));
  } catch {
    // Storage full or blocked (a private window): the place just isn't kept.
  }
}
