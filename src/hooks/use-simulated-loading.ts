"use client";

import { useEffect, useState } from "react";

/**
 * Stand-in loading flag for pages with no backend yet (Product Catalog,
 * Insights). Starts `true` and flips to `false` after `delayMs`, purely so
 * the loading-skeleton pattern is in place and ready to swap for a real
 * `isLoading` from `use-api.ts` once these pages get an actual fetch.
 */
export function useSimulatedLoading(delayMs = 500): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  return isLoading;
}
