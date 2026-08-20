"use client";

import { useEffect, useRef } from "react";
import { navRead, navWrite } from "@/lib/nav-session";

/**
 * Remembers the dashboard `main` scroll offset per URL and puts it back when
 * the user returns to that URL.
 *
 * Next's built-in scroll restoration only knows about the window, and the
 * window never scrolls here — `main` is the scroll container — so restoring is
 * ours to do.
 *
 * Restore runs only when the *pathname* changes. A query-only change (category
 * tab, filter chip, quick-view panel) is a change of view inside the page the
 * user is already looking at; yanking the scroll position there would be worse
 * than leaving it where they put it.
 */
export function useScrollMemory(url: string, pathname: string) {
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const key = `nav:scroll:${url}`;
    const enteredPage = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    let restoring = false;
    let restoreFrame = 0;
    let saveFrame = 0;

    const stopRestoring = () => {
      restoring = false;
      if (restoreFrame) {
        cancelAnimationFrame(restoreFrame);
        restoreFrame = 0;
      }
    };

    if (enteredPage) {
      // No memory (a fresh load clears it all) means target 0.
      const target = Number(navRead(key)) || 0;
      // Covers the common cases outright: no memory (target 0, so a fresh page
      // starts at the top instead of inheriting the previous page's offset) and
      // a page that is already tall enough to seek into.
      main.scrollTop = target;

      if (target > 0 && main.scrollTop < target) {
        restoring = true;
        const deadline = performance.now() + 600;
        const apply = () => {
          main.scrollTop = target;
          if (main.scrollTop >= target || performance.now() > deadline) {
            stopRestoring();
            return;
          }
          // Content below the fold is still laying out — keep chasing until the
          // container is tall enough to actually reach `target`.
          restoreFrame = requestAnimationFrame(apply);
        };
        restoreFrame = requestAnimationFrame(apply);
      }
    }

    const save = () => {
      if (restoring || saveFrame) return;
      saveFrame = requestAnimationFrame(() => {
        saveFrame = 0;
        navWrite(key, String(Math.round(main.scrollTop)));
      });
    };

    // A deliberate scroll always beats a restore still chasing a growing page.
    main.addEventListener("scroll", save, { passive: true });
    main.addEventListener("wheel", stopRestoring, { passive: true });
    main.addEventListener("touchstart", stopRestoring, { passive: true });

    return () => {
      stopRestoring();
      if (saveFrame) cancelAnimationFrame(saveFrame);
      main.removeEventListener("scroll", save);
      main.removeEventListener("wheel", stopRestoring);
      main.removeEventListener("touchstart", stopRestoring);
      navWrite(key, String(Math.round(main.scrollTop)));
    };
  }, [url, pathname]);
}
