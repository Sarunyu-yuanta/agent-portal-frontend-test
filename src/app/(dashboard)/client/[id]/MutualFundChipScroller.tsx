"use client";

import type { ReactNode } from "react";
import { useDragScroll } from "./use-drag-scroll";

/** Horizontal chip strip — drag scroll only, matches catalog search chips. */
export function MutualFundChipScroller({
  children,
  leadInset = false,
}: {
  children: ReactNode;
  /** Scrollable inset so chips align with page padding at rest, but can bleed both edges when scrolled. */
  leadInset?: boolean;
}) {
  const drag = useDragScroll();
  return (
    <div
      ref={drag.ref}
      className="flex gap-2 overflow-x-auto hide-scrollbar"
      style={{ scrollbarWidth: "none", cursor: "grab" }}
      onMouseDown={drag.onMouseDown}
      onMouseMove={drag.onMouseMove}
      onMouseUp={drag.onMouseUp}
      onMouseLeave={drag.onMouseLeave}
    >
      {leadInset && <span aria-hidden className="w-4 shrink-0 md:w-8 lg:w-0" />}
      {children}
      {leadInset && <span aria-hidden className="w-4 shrink-0 md:w-8 lg:w-0" />}
    </div>
  );
}
