"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Row-reorder cue for `<table>`-based rows: when a row keyed by `id` lands in
 * a new vertical position — e.g. after a sort — it briefly dims instead of
 * silently snapping, using the browser's own current positions to detect
 * "did this row actually move" (new page, first mount, and unrelated
 * re-renders are no-ops).
 *
 * This is deliberately opacity-only, not a `transform: translateY(...)`
 * slide (classic FLIP). Confirmed via direct testing: an active `transform`
 * ANYWHERE inside a `<table>` — even on a plain `<div>` nested inside a
 * `<td>`, several levels away from the row/cell boxes themselves — makes
 * Chromium drop border-collapse painting for the *entire* table for as long
 * as that transform is active. `opacity` doesn't trigger this, so it's the
 * only safe way to animate a row inside `@sarunyu/system-one`'s `<Table>`.
 *
 * Attach the returned callback as `ref={flipRef(id)}` on each row's root node.
 */
export function useFlipRows<K extends string | number>() {
  const nodesRef = useRef(new Map<K, HTMLElement>());
  const prevRectsRef = useRef(new Map<K, DOMRect>());

  useLayoutEffect(() => {
    const prevRects = prevRectsRef.current;
    const nodes = nodesRef.current;

    nodes.forEach((node, id) => {
      const prev = prevRects.get(id);
      if (!prev) return;
      const next = node.getBoundingClientRect();
      const deltaY = prev.top - next.top;
      if (Math.abs(deltaY) < 1) return;

      node.style.transition = "none";
      node.style.opacity = "0.35";
      node.getBoundingClientRect(); // flush, so the reset below is a separate frame
      requestAnimationFrame(() => {
        node.style.transition = "opacity 200ms ease-out";
        node.style.opacity = "";
      });
    });

    nodes.forEach((node, id) => prevRects.set(id, node.getBoundingClientRect()));
  });

  return (id: K) => (node: HTMLElement | null) => {
    if (node) nodesRef.current.set(id, node);
    else nodesRef.current.delete(id);
  };
}
