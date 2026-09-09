"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BellIcon } from "@phosphor-icons/react";
import type { NotificationGroup, NotificationItem } from "@sarunyu/system-one";
import { useStoredIds } from "@/hooks/use-stored-ids";

/**
 * The header bell, in place of the DS `NavHeaderNotification`.
 *
 * Written here for one reason: the installed DS build declares
 * `NotificationGroup.label` but only ever uses it as a React key — it paints no
 * heading and no divider (checked its compiled source). Its panel is therefore
 * always one flat list, and the only way the app had to show which day a row
 * belongs to was to repeat the label inside every row's own `time` line, which
 * is where a timestamp goes and read as one.
 *
 * The trigger, panel and row shapes are kept to the DS's own measurements —
 * 24px glyph, 375px panel, 480px scroll cap, 40px icon column, `text-base`
 * title over `text-sm` description — so this reads as the same component with
 * the group headings the type always promised.
 *
 * Takes `NotificationGroup[]` unchanged, so both feeds (KYC expiries, and
 * reminders once that flag is back on) flow through it as they did.
 */
export function NotificationBell({
  groups,
  emptyText,
  onItemClick,
}: {
  groups: NotificationGroup[];
  emptyText: string;
  onItemClick?: (item: NotificationItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const liveIds = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups],
  );

  /**
   * Which rows have already been looked at, kept in `localStorage` so it
   * survives a reload rather than resetting the badge every visit.
   *
   * By id, not by count: if one alert clears the same day another arrives the
   * count is unchanged, and a count-based check would call that "nothing new".
   * Ids also let a seen row stay in the list without its unread dot, instead of
   * the whole panel reading as new forever.
   *
   * `isKnown` prunes ids that are no longer raised, so the entry can't grow
   * without bound — and a client who becomes due again after a renewal comes
   * back as genuinely new.
   */
  const isKnown = useCallback(
    (id: string) => liveIds.includes(id),
    [liveIds],
  );
  const [seen, setSeen] = useStoredIds("notifications:seen", isKnown);

  const unseenCount = liveIds.filter((id) => !seen.has(id)).length;
  const showBadge = unseenCount > 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasItems = groups.some((g) => g.items.length > 0);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => {
          // Opening is the acknowledgement — everything on screen at that
          // moment counts as seen, and only a row raised after this point
          // brings the badge back.
          if (!open) setSeen(new Set(liveIds));
          setOpen((v) => !v);
        }}
        className="relative flex size-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-icon-brand transition-colors hover:bg-hover-bg"
      >
        {/* Filled while something is waiting, outline once it isn't — the
            glyph and the count carry the same state, so they turn together
            rather than leaving a solid bell over an empty badge. */}
        <BellIcon size={24} weight={showBadge ? "fill" : "regular"} />
        {showBadge && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-0.5 -top-0.5 z-[1] flex h-3.5 min-h-3.5 min-w-3.5 items-center justify-center rounded-[60px] bg-visual-red-default px-[2.5px] text-on-visual-red"
          >
            <span className="text-xs leading-none font-normal tabular-nums">
              {unseenCount > 99 ? "99+" : unseenCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[375px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="max-h-[480px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!hasItems && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
            )}
            {groups.map((group, gi) => (
              <div key={group.label ?? gi}>
                {/* Sticky so the day a row belongs to stays readable while its
                    section scrolls past. `border-t` on every heading but the
                    first is what separates one day from the previous. */}
                <div
                  className={`sticky top-0 z-[1] border-b border-border bg-[var(--bg-default-secondary)] px-4 py-1.5 ${
                    gi > 0 ? "border-t" : ""
                  }`}
                >
                  <span className="text-xs leading-4 font-medium text-muted-foreground">
                    {group.label}
                  </span>
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onItemClick?.(item);
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-default-secondary)]"
                  >
                    <span className="flex w-10 shrink-0 items-start justify-center py-0.5">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="line-clamp-2 block text-base leading-6 font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="line-clamp-3 block text-sm leading-5 text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    {/* `item.time` is deliberately not drawn: it carries the
                        same day label the heading above already shows, and
                        printing it again under the description is exactly the
                        line that read as a second, contradictory date. */}
                    {!seen.has(item.id) && (
                      <span
                        aria-hidden="true"
                        className="mt-2 size-2 shrink-0 rounded-full bg-visual-red-default"
                      />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
