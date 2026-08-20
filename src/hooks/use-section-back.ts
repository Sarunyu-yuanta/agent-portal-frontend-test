"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { catalogListUrl, parentTrailUrl, previousVisit } from "@/lib/nav-memory";
import {
  catalogCategoryForPath,
  catalogListHref,
  CATALOG_PATH,
} from "@/lib/product-catalog-routes";

/**
 * Where a page's back button lands when there's no trail behind it — a pasted
 * link, or a session restored straight onto a detail page.
 *
 * Derived from the route so no page has to declare it. Catalog routes that
 * belong to exactly one tab go back to that tab; the rest fall back to the
 * remembered list, which is the best available guess at where they came from.
 */
function sectionRoot(pathname: string): string {
  if (pathname.startsWith(`${CATALOG_PATH}/`)) {
    const category = catalogCategoryForPath(pathname);
    return category ? catalogListHref(category) : catalogListUrl();
  }
  if (pathname.startsWith("/insights/")) return "/insights";
  if (pathname.startsWith("/client/")) return "/client-hub";
  return "/";
}

/**
 * The handler for an in-page back button: goes **up one level** along the
 * breadcrumb trail, not back through browser history.
 *
 * The two differ whenever the user reached this page from outside its section —
 * opening a bond detail from Client 360, or resuming into one from the sidebar.
 * `router.back()` would leave the section entirely; the trail keeps them inside
 * it, which is what a breadcrumb-shaped back button promises.
 *
 * When history's previous entry happens to *be* that parent — the ordinary
 * list → detail → back path — we rewind instead of pushing, so the stack stays
 * clean and forward still works.
 *
 * @param getFallback Overrides {@link sectionRoot} for the cold-entry case.
 *   Called at click time, since resolving it may read storage.
 */
export function useSectionBack(getFallback?: (pathname: string) => string) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const fallback = (getFallback ?? sectionRoot)(pathname);
    const parent = parentTrailUrl(pathname, fallback);
    if (previousVisit() === parent) router.back();
    else router.push(parent);
  }, [router, pathname, getFallback]);
}
