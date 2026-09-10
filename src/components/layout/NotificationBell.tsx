"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BellIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
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
 * ## Three screens, one body
 *
 * The panel opens on **today** and nothing else. What is overdue and what is
 * coming each sit behind a counted row above the list, and each opens a screen
 * of its own.
 *
 * It used to be one long list, and because a KYC starts ringing 30 days out,
 * most rows in it were future — so the two or three things actually due today
 * were pushed below the fold. Collapsing both of the other directions to a
 * single row each makes that impossible: today's work is always the whole body,
 * whatever is queued on either side of it.
 *
 * Chosen over a tab strip for the empty day: with tabs, a day with nothing due
 * opens on a tab reading "no items" while a badge advertises seven, which reads
 * as a bug. Here the same day shows "วันนี้ไม่มีอะไรครบกำหนด" *and* both counts
 * still waiting, in one view.
 */
type Screen = "today" | "overdue" | "upcoming";

export function NotificationBell({
  todayGroups,
  overdueGroups,
  upcomingGroups,
  emptyText,
  onItemClick,
  onOpenCalendar,
}: {
  todayGroups: NotificationGroup[];
  overdueGroups: NotificationGroup[];
  upcomingGroups: NotificationGroup[];
  emptyText: string;
  onItemClick?: (item: NotificationItem) => void;
  /** Omitted when the Calendar is out of phase — the footer link hides with it. */
  onOpenCalendar?: () => void;
}) {
  const [open, setOpen] = useState(false);
  /** Which screen the panel is on. Resets to "today" every time it closes. */
  const [screen, setScreen] = useState<Screen>("today");
  const rootRef = useRef<HTMLDivElement>(null);

  const idsOf = (groups: NotificationGroup[]) =>
    groups.flatMap((g) => g.items.map((i) => i.id));

  /** Overdue and today both count as due — see the badge note below. */
  const dueIds = useMemo(
    () => [...idsOf(overdueGroups), ...idsOf(todayGroups)],
    [overdueGroups, todayGroups],
  );
  const liveIds = useMemo(
    () => [...dueIds, ...idsOf(upcomingGroups)],
    [dueIds, upcomingGroups],
  );
  const overdueCount = overdueGroups.reduce((n, g) => n + g.items.length, 0);
  const upcomingCount = liveIds.length - dueIds.length;

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

  /**
   * The badge counts unseen rows that are **already due**, not every unseen
   * row. A KYC starts ringing 30 days out, so counting the future too would
   * leave the badge permanently lit at seven-or-so and stop meaning anything —
   * the number has to be able to reach zero for a non-zero one to be worth
   * looking at. What is still ahead is carried by the "กำลังจะถึง" row inside.
   */
  const unseenCount = dueIds.filter((id) => !seen.has(id)).length;
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

  const hasToday = todayGroups.some((g) => g.items.length > 0);
  const closePanel = () => {
    setOpen(false);
    setScreen("today");
  };

  /**
   * One of the two counted rows above the list — overdue and upcoming both use
   * it, so the only thing separating them is the tone and the glyph.
   *
   * Doubles as its own back button: on the screen it leads to it keeps the same
   * position and label and just turns its caret around, so the two states read
   * as one control flipping rather than as two different rows.
   */
  const doorRow = (target: Exclude<Screen, "today">, count: number) => {
    if (count === 0 && screen !== target) return null;
    const here = screen === target;
    const overdue = target === "overdue";
    return (
      <button
        type="button"
        onClick={() => setScreen(here ? "today" : target)}
        aria-label={`${overdue ? "เลยกำหนด" : "กำลังจะถึง"} ${count} รายการ`}
        className={`flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-[var(--bg-default-secondary)] ${
          overdue ? "text-destructive" : "text-foreground"
        }`}
      >
        <span
          className={`flex w-10 shrink-0 items-center justify-center ${
            overdue ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {here ? (
            <CaretLeftIcon size={18} />
          ) : overdue ? (
            <WarningCircleIcon size={18} weight="fill" />
          ) : (
            <ClockIcon size={18} />
          )}
        </span>
        <span className="flex-1 text-sm leading-5 font-medium">
          {overdue ? "เลยกำหนด" : "กำลังจะถึง"}
        </span>
        <span
          className={`text-sm leading-5 tabular-nums ${
            overdue ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {count}
        </span>
        {!here && (
          <CaretRightIcon
            size={16}
            className={`shrink-0 ${overdue ? "text-destructive" : "text-muted-foreground"}`}
          />
        )}
      </button>
    );
  };

  /**
   * One screen's worth of grouped rows. `showTime` is the only difference
   * between the two: on the due screen the heading is already the exact day,
   * so printing it again per row read as a second, contradictory date; on the
   * upcoming screen the heading is a range and the day is worth having.
   */
  const renderGroups = (groups: NotificationGroup[], showTime: boolean) =>
    groups.map((group, gi) => (
      <div key={group.label ?? gi}>
        {/* Sticky so the zone a row belongs to stays readable while its
            section scrolls past. `border-t` on every heading but the
            first is what separates one zone from the previous. */}
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
              closePanel();
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
              {showTime && item.time && (
                <span className="block text-xs leading-4 text-muted-foreground">
                  {item.time}
                </span>
              )}
            </span>
            {!seen.has(item.id) && (
              <span
                aria-hidden="true"
                className="mt-2 size-2 shrink-0 rounded-full bg-visual-red-default"
              />
            )}
          </button>
        ))}
      </div>
    ));

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
          {/* One control, one position, both screens — it opens the upcoming
              list and it comes back. Above the rows rather than below them so
              it can't be scrolled away, and so the caret is the only thing
              that changes between the two states: a row that moved would read
              as two separate buttons instead of one that flips. */}
          {/* Upcoming first, then overdue. Not urgency order — the two are a
              fixed pair of controls, and keeping them in one place means the
              row a reader reached for last time is where they left it. On the
              screen either one leads to, only that row renders. */}
          {(screen === "today" || screen === "upcoming") &&
            doorRow("upcoming", upcomingCount)}
          {(screen === "today" || screen === "overdue") &&
            doorRow("overdue", overdueCount)}

          <div className="max-h-[480px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {screen === "today" && (
              <>
                {/* Not the same thing as an empty bell. There may be nothing
                    due today while both other directions hold items, so this
                    line reports the clear day and the rows above still show
                    what is waiting — rather than the panel reading as though
                    it had failed to load. */}
                {!hasToday && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {overdueCount + upcomingCount > 0
                      ? "วันนี้ไม่มีอะไรครบกำหนด"
                      : emptyText}
                  </p>
                )}
                {renderGroups(todayGroups, false)}
              </>
            )}
            {screen === "overdue" && renderGroups(overdueGroups, true)}
            {screen === "upcoming" && renderGroups(upcomingGroups, true)}
          </div>

          {screen === "upcoming" && onOpenCalendar && (
            <button
              type="button"
              onClick={() => {
                onOpenCalendar();
                closePanel();
              }}
              className="w-full cursor-pointer border-t border-border px-4 py-3 text-center text-sm leading-5 font-medium text-primary-action transition-colors hover:bg-[var(--bg-default-secondary)]"
            >
              เปิดปฏิทิน →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
