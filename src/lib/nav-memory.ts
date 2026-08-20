"use client";

/**
 * Session-scoped "where the user left off" memory, keyed by sidebar section.
 *
 * A sidebar entry is a section *entry point*, not a fixed destination: coming
 * back to Client 360 from another section should land on the client the user
 * was reading — the same place browser-back goes. Storing the full URL (path +
 * query) is what makes tab / filter / panel state come back with it, since all
 * of those now live in the query string.
 *
 * Session-scoped and cleared on every fresh document load — see
 * {@link ./nav-session} for why refresh counts as "start over".
 */

import { navRead, navWrite } from "./nav-session";

export type NavSectionKey = "client-hub" | "product-catalog" | "insights";

type NavSection = {
  key: NavSectionKey;
  /** The section's list page — the floor of its trail. */
  root: string;
  /** Every path prefix that counts as "inside" this section. */
  prefixes: string[];
};

const SECTIONS: NavSection[] = [
  // Full Profile (/client/:id) is Client 360's deepest level, not its own section.
  { key: "client-hub", root: "/client-hub", prefixes: ["/client-hub", "/client"] },
  { key: "product-catalog", root: "/product-catalog", prefixes: ["/product-catalog"] },
  { key: "insights", root: "/insights", prefixes: ["/insights"] },
];

const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

function sectionFor(pathname: string): NavSection | undefined {
  return SECTIONS.find((s) => s.prefixes.some((p) => isUnder(pathname, p)));
}

export function sectionForPath(pathname: string): NavSectionKey | null {
  return sectionFor(pathname)?.key ?? null;
}

const storageKey = (key: NavSectionKey) => `nav:last:${key}`;

export function lastSectionPath(key: NavSectionKey): string | null {
  return navRead(storageKey(key));
}

// ── Breadcrumb trail ────────────────────────────────────────────────────────
// An in-app "back" button means *up one level*, not *whatever I looked at
// last*. Browser history can't express that: arrive at a bond detail from
// Client 360 (or from a session restore) and history's previous entry is
// Client 360, so `router.back()` walks out of the page the user is reading.
//
// So we keep the trail ourselves: the chain of pages that led to the current
// one, within this section. Revisiting a pathname truncates the trail back to
// it, which is what keeps drill-across chains (bond → company → bond) honest
// instead of growing forever.

const trailKey = (key: NavSectionKey) => `nav:trail:${key}`;
const PREV_URL_KEY = "nav:prev-url";
const CURRENT_URL_KEY = "nav:current-url";
const TRAIL_LIMIT = 20;

/** Path part of a stored trail entry — the query never makes its own rung. */
export const urlPathname = (url: string) => url.split("?")[0];

function readTrail(key: NavSectionKey): string[] {
  const raw = navRead(trailKey(key));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * The trail *including* `url` — every page walked through to reach it.
 *
 * Deliberately independent of whether {@link recordVisit} has run yet: it
 * derives the trail rather than reading a recorded one, so the header can build
 * a breadcrumb during render without depending on effect ordering.
 */
export function sectionTrail(pathname: string, url: string): string[] {
  const section = sectionFor(pathname);
  if (!section) return [];

  // The section's list page is the floor: landing on it is starting over, never
  // nesting under whatever was open. Without this, arriving at a deep page
  // first (a refresh, a restored sidebar link) and then walking up would append
  // the list *below* that page and the breadcrumb would name it twice.
  if (pathname === section.root) return [url];

  const trail = readTrail(section.key);
  const append = (rungs: string[]) => rungs.concat(url).slice(-TRAIL_LIMIT);

  // Already on the trail — the user walked back up, so drop everything below
  // it. Query strings don't create levels either: `?category=fixed-income` is
  // the same rung as `?category=global-bond`, so match on pathname and let the
  // newer URL replace the older one in place.
  const existing = trail.findIndex((entry) => urlPathname(entry) === pathname);
  if (existing >= 0) return append(trail.slice(0, existing));

  // A sibling of the current page — a "Recommended Bonds" card, a related
  // insight, another client — swaps the leaf instead of nesting under it, the
  // same way the URL swaps one id rather than growing a level.
  const last = trail[trail.length - 1];
  if (last && parentPath(urlPathname(last)) === parentPath(pathname)) {
    return append(trail.slice(0, -1));
  }

  return append(trail);
}

/** Everything above the last path segment — two paths sharing it are siblings. */
const parentPath = (pathname: string) =>
  pathname.slice(0, pathname.lastIndexOf("/"));

/** Records a navigation: section memory, breadcrumb trail and previous URL. */
export function recordVisit(pathname: string, url: string) {
  const current = navRead(CURRENT_URL_KEY);
  if (current === url) return; // re-render, or a reload of the same URL
  if (current) navWrite(PREV_URL_KEY, current);
  navWrite(CURRENT_URL_KEY, url);

  const section = sectionForPath(pathname);
  if (!section) return;
  navWrite(storageKey(section), url);
  navWrite(trailKey(section), JSON.stringify(sectionTrail(pathname, url)));
}

/** URL the user was on immediately before the current one, across sections. */
export function previousVisit(): string | null {
  return navRead(PREV_URL_KEY);
}

/** The trail entry one rung above `pathname`, or `fallback` if it has none. */
export function parentTrailUrl(pathname: string, fallback: string): string {
  const section = sectionForPath(pathname);
  if (!section) return fallback;
  const trail = readTrail(section);
  const idx = trail.findIndex((entry) => urlPathname(entry) === pathname);
  return idx > 0 ? trail[idx - 1] : fallback;
}

// ── Product Catalog list URL ────────────────────────────────────────────────
// Tracked separately from the section path: the section path may point at a
// detail page, but a detail page's "back" needs the *list* it belongs to,
// with the category tab the user had open.

const CATALOG_LIST_KEY = "nav:last:product-catalog-list";

export function rememberCatalogList(url: string) {
  navWrite(CATALOG_LIST_KEY, url);
}

export function catalogListUrl(): string {
  return navRead(CATALOG_LIST_KEY) ?? "/product-catalog";
}
