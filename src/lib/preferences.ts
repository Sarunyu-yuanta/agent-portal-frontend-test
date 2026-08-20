"use client";

/**
 * Lasting user preferences — which table columns are hidden, and anything else
 * of that shape. Stored as a JSON array of ids under a `pref:` key.
 *
 * localStorage, deliberately: a preference outlives a reload and reopening the
 * tab. That is the opposite of {@link ./nav-session}, which wipes its keys on
 * every fresh load — but the two hold different things. That one remembers
 * *where the user was*, which should start clean; this one remembers *how they
 * set the UI up*, which should not have to be redone every visit.
 */

import { safeStorage } from "./web-storage";

const PREFIX = "pref:";

/** Shared empty result, so "nothing stored" is reference-stable too. */
export const NO_IDS: readonly string[] = [];

/**
 * `readIds` must return the same reference until the stored value really
 * changes, or the `useSyncExternalStore` reading it re-renders forever. Parsed
 * values are cached against the raw string they came from.
 */
const cache = new Map<string, { raw: string | null; parsed: readonly string[] }>();
const listeners = new Map<string, Set<() => void>>();

export const preferenceKey = (name: string) => PREFIX + name;

export function readIds(key: string): readonly string[] {
  let raw: string | null = null;
  try {
    raw = safeStorage("local")?.getItem(key) ?? null;
  } catch {
    /* see safeStorage */
  }

  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.parsed;

  let parsed: readonly string[] = NO_IDS;
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(value)) {
      parsed = value.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // Corrupt entry — fall back to the default rather than breaking the page.
  }
  cache.set(key, { raw, parsed });
  return parsed;
}

export function writeIds(key: string, ids: Iterable<string>) {
  try {
    safeStorage("local")?.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* quota — the UI still updates, it just won't be remembered */
  }
  listeners.get(key)?.forEach((notify) => notify());
}

export function subscribeIds(key: string, onChange: () => void) {
  let group = listeners.get(key);
  if (!group) {
    group = new Set();
    listeners.set(key, group);
  }
  group.add(onChange);

  // `storage` fires in *other* tabs, so a change here shows up there too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === key) onChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    group.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}
