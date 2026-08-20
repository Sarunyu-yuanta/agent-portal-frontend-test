"use client";

/**
 * Web Storage access that never throws.
 *
 * `window.sessionStorage` / `localStorage` throw on access in private mode and
 * under some enterprise policies, and `setItem` throws on quota. Everything the
 * app keeps there — navigation memory, UI preferences — is a nicety, so the
 * whole surface degrades to "nothing stored" rather than taking a page down.
 *
 * `null` on the server, where neither exists.
 */
export function safeStorage(kind: "session" | "local"): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
