"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Slide duration, matched to the list animations elsewhere in the app. */
const EXIT_MS = 200;

/** Drag further than this and letting go dismisses, rather than springing back. */
const DISMISS_PX = 90;

/**
 * The phone form of a popover: a panel on the bottom edge instead of one
 * pointing at its trigger.
 *
 * A popover has to point somewhere, and on a phone the triggers here are a
 * ~50px day cell and a month label with no room beside either — the panel
 * either covers the thing it came from or gets shoved somewhere unrelated by
 * collision handling. A sheet gives up the pointing and takes the bottom of the
 * screen, which is both bigger and where a thumb already is.
 *
 * Portalled to `document.body` rather than rendered in place. The dashboard
 * wraps page content in `FadeIn`, whose `animate-in` sets a `transform` — and a
 * transformed ancestor becomes the containing block for `position: fixed`, so a
 * sheet left inside the tree would be positioned against the page content
 * instead of the viewport.
 *
 * `children` is a function so the content can dismiss the sheet *through* it
 * and get the slide-out. Flipping the caller's own open flag instead would
 * unmount the sheet mid-animation, which is what tapping a month in the picker
 * would otherwise do.
 */
export function BottomSheet({
  onClose,
  children,
}: {
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  // `dragY` is what the sheet is rendered at; `dragFrom` is only ever read
  // inside the pointer handlers, which is the only place a ref belongs. The
  // in-progress flag is state rather than `dragFrom.current !== null` because
  // render reads it — a ref read during render is both a lint error and a real
  // hazard, since changing it wouldn't schedule the re-render that shows it.
  const [drag, setDrag] = useState<{ active: boolean; y: number }>({ active: false, y: 0 });
  const dragFrom = useRef<number | null>(null);
  const dragTravel = useRef(0);

  /** Plays the slide-out before telling the parent to unmount us. */
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, EXIT_MS);
  };

  // No dep array: `close` reads `closing`, and re-subscribing each render is
  // cheaper than the ref plumbing that would keep one listener current.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        aria-hidden
        onClick={close}
        className={`absolute inset-0 bg-black/40 transition-opacity ease-out starting:opacity-0 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${EXIT_MS}ms` }}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[75vh] flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl transition-transform ease-out starting:translate-y-full ${
          closing ? "translate-y-full" : ""
        }`}
        style={{
          // Inline transform only while a drag is in progress, so the classes
          // above own the entry and exit and the two never fight.
          transform: drag.y ? `translateY(${drag.y}px)` : undefined,
          // Following the finger has to be instant; everything else eases.
          transitionDuration: drag.active ? "0ms" : `${EXIT_MS}ms`,
        }}
      >
        {/* Only the handle strip is draggable, never the content — a drag
            starting on a scrollable list would be competing with its scroll.
            `touch-none` stops the browser claiming the gesture first. */}
        <div
          onPointerDown={(e) => {
            dragFrom.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag({ active: true, y: 0 });
          }}
          onPointerMove={(e) => {
            if (dragFrom.current === null) return;
            // Downward only: dragging up would lift the sheet off the bottom
            // edge and expose the page behind it.
            const y = Math.max(0, e.clientY - dragFrom.current);
            // Mirrored into a ref as well as state so `pointerup` can read the
            // final travel immediately. Reading it from the `drag` closure would
            // risk a value one move behind, and reading it inside a state
            // updater would mean calling `close()` from one — which React may
            // invoke twice.
            dragTravel.current = y;
            setDrag({ active: true, y });
          }}
          onPointerUp={() => {
            const travelled = dragTravel.current;
            dragFrom.current = null;
            dragTravel.current = 0;
            setDrag({ active: false, y: 0 });
            if (travelled > DISMISS_PX) close();
          }}
          onPointerCancel={() => {
            dragFrom.current = null;
            dragTravel.current = 0;
            setDrag({ active: false, y: 0 });
          }}
          className="shrink-0 cursor-grab touch-none active:cursor-grabbing"
        >
          {/* A handle that did nothing would be a promise the sheet doesn't
              keep, which is why the drag above exists rather than just this. */}
          <div className="flex justify-center pt-3 pb-2">
            <span className="h-1 w-9 rounded-full bg-[var(--fill-gray-300)]" />
          </div>
        </div>

        {children(close)}
      </div>
    </div>,
    document.body,
  );
}
