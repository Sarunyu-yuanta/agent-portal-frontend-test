"use client";

import { usePathname } from "next/navigation";
import { useClients } from "@/hooks/use-api";
import { usePrivacy } from "@/contexts/privacy-context";
import { usePageBreadcrumb, type Crumb } from "./page-breadcrumbs";

/**
 * Everything the dashboard shell needs to know about the page inside it, all
 * derived from the route.
 *
 * Kept out of `layout.tsx` so that file stays structure — these are facts about
 * pages, and they grow every time a page is added.
 */
export type PageChrome = {
  /** Header title, or `null` when a breadcrumb takes its place. */
  title: string | null;
  breadcrumb: Crumb[] | null;
  isCommandCenter: boolean;
  isHouseView: boolean;
  isPerformance: boolean;
  /** Page paints its own padding and bleeds to the edges. */
  isFullWidth: boolean;
  /** Page renders its own mobile breadcrumb; the layout must not add another. */
  ownsMobileBreadcrumb: boolean;
  /** Page content starts on white rather than `main`'s gray-50. */
  contentTopIsWhite: boolean;
};

const PAGE_TITLES: Record<string, string> = {
  "/command-center": "Command Center",
  "/client-hub": "Client 360",
  "/pipeline": "Pipeline",
  "/ai-insights": "AI Insights",
  "/performance": "Performance & Targets",
  "/compliance": "Compliance & Risk",
  "/house-view": "House View & Strategy",
  "/insights": "Insights",
  "/product-catalog": "Product Catalog",
};

/**
 * Routes whose content starts on white instead of `main`'s own gray-50.
 *
 * The mobile breadcrumb leads straight into that content, so it takes the same
 * surface rather than showing up as a band above it. Everything not listed here
 * already starts on gray-50 (`--bg-default-secondary`), which is exactly what
 * `main` paints — so the strip needs no background of its own there.
 *
 * Each entry mirrors the top-level background of the component that renders the
 * route; keep them in step.
 */
const WHITE_CONTENT_TOP = [
  /^\/product-catalog\/top-idea(\/|$)/, // TopIdeaAllPage, TopIdeaDetail
  /^\/product-catalog\/investment-solution\//, // InvestmentSolutionDetail
  /^\/product-catalog\/global-bond(\/|$)/, // GlobalBondAllPage, GlobalBondDetail
  /^\/product-catalog\/product$/, // StructuredProductAllPage
];

export function usePageChrome(): PageChrome {
  const pathname = usePathname();
  const clients = useClients();
  const { isPrivate } = usePrivacy();

  const breadcrumb = usePageBreadcrumb(pathname, { clients, isPrivate });
  // Longest prefix wins, so `/client-hub` doesn't shadow a deeper entry.
  const titleKey = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k));

  return {
    // A breadcrumb replaces the title — its leaf already names the page, and
    // the section name is the rung above it.
    title: breadcrumb ? null : titleKey ? PAGE_TITLES[titleKey] : "",
    breadcrumb,
    isCommandCenter: pathname.startsWith("/command-center"),
    isHouseView: pathname.startsWith("/house-view"),
    isPerformance: pathname.startsWith("/performance"),
    isFullWidth:
      pathname.startsWith("/product-catalog") ||
      pathname.startsWith("/client-hub"),
    // Full Profile puts the breadcrumb inside its own sticky identity bar (and
    // pulls itself up over the layout's padding to do it), so a second one
    // above would overlap.
    ownsMobileBreadcrumb: pathname.startsWith("/client/"),
    contentTopIsWhite: WHITE_CONTENT_TOP.some((re) => re.test(pathname)),
  };
}
