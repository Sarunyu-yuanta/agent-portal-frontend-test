"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hover-and-click popover state with click-outside dismissal.
 *
 * Spread `hoverProps` onto the trigger wrapper and attach `ref` to the same
 * element; a short close delay lets the pointer travel into the popover.
 */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return {
    open,
    setOpen,
    ref,
    hoverProps: {
      onMouseEnter: () => {
        clearTimeout(timer.current);
        setOpen(true);
      },
      onMouseLeave: () => {
        timer.current = setTimeout(() => setOpen(false), 120);
      },
    },
  };
}
