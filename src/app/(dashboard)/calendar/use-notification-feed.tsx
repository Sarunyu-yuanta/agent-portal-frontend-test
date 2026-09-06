import { useMemo } from "react";
import type { NotificationGroup, NotificationItem } from "@sarunyu/system-one";
import type { Note } from "@/types/domain";
import { dayFromKey, dayOffset, relativeDayLabel, todayDateKey } from "./calendar-grid";
import { groupDayItems, type DayItem } from "./day-items";
import { SOURCE_BADGE } from "./source-badge";

/**
 * Five zones a reminder passes through on its way to its due date, in the
 * order they matter — most urgent first. Not four single checkpoint days: a
 * reminder that rang once at 15 days out and then went quiet until 7 would
 * read as though it had been dealt with in between. Once it crosses into a
 * zone it stays in the bell — grouped under that zone — until it crosses
 * into the next one, so "already warned about" keeps showing rather than
 * disappearing the day after the checkpoint.
 *
 * Overdue and Today are each exactly one day; the zones widen further out,
 * since a reminder 15 days away doesn't need daily separation the way one
 * due tomorrow does.
 */
const NOTIFICATION_ZONES = ["Overdue", "Today", "Tomorrow", "This week", "Next 2 weeks"] as const;

/** Which zone a reminder's day-offset currently falls in, or `null` once it's
 *  more than 15 days out — the point it hasn't rung a first checkpoint yet. */
function notificationZone(daysDiff: number): (typeof NOTIFICATION_ZONES)[number] | null {
  if (daysDiff < 0) return "Overdue";
  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Tomorrow";
  if (daysDiff <= 7) return "This week";
  if (daysDiff <= 15) return "Next 2 weeks";
  return null;
}

/**
 * The header bell's notification groups, badge count, and click targets —
 * every client's reminders and every dividend alert, zoned by how close each
 * one is to due. Lifted out of the app-shell layout: this is a self-contained
 * "day items in, notification rows out" computation with no dependency on
 * page chrome, so it doesn't need to live there.
 */
export function useNotificationFeed(notes: Note[], clients: { id: string; name: string }[]) {
  // `todayKey` rather than the `Date`: a fresh object every render would make
  // the memo useless, and only the day is what either source is measured
  // against. Same trick the Reminders tab uses.
  const todayKey = todayDateKey();

  return useMemo(() => {
    const today = new Date(todayKey);
    // No `clientId` — every client's reminders and every dividend alert, not
    // one client's. This is the same map `ClientRemindersTab` builds, just
    // unfiltered, because the bell is the one surface that isn't already
    // standing on a client's own page.
    const dayMap = groupDayItems(notes, today);
    const buckets: Record<(typeof NOTIFICATION_ZONES)[number], NotificationItem[]> = {
      Overdue: [],
      Today: [],
      Tomorrow: [],
      "This week": [],
      "Next 2 weeks": [],
    };
    // `onItemClick` only gets back the `NotificationItem` it was handed, and
    // that shape has no room for the `DayItem`/day a reminder actually is —
    // so this is the side table that answers "which modal, opened on what"
    // once the click actually happens.
    const targets = new Map<string, { item: DayItem; day: Date }>();

    for (const [key, items] of dayMap) {
      const day = dayFromKey(key);
      const daysDiff = dayOffset(day, today);
      const zone = notificationZone(daysDiff);
      if (!zone) continue; // more than 15 days out — hasn't rung yet
      for (const item of items) {
        if (item.done) continue;
        const names = item.clientIds
          .map((id) => clients.find((c) => c.id === id)?.name ?? id)
          .join(", ");
        buckets[zone].push({
          id: item.id,
          title: item.title,
          description: names || item.detail,
          // The library's own group divider — `NotificationGroup.label` — is
          // declared in its types but never actually rendered by the
          // installed build (checked its compiled source: `group.label` is
          // only ever used as a React key, not painted anywhere). This is
          // the fallback: fold the zone into the one field guaranteed to
          // show, rather than a heading nothing draws.
          time:
            zone === "Overdue" || zone === "Today"
              ? relativeDayLabel(daysDiff)
              : zone === "Tomorrow"
                ? "Tomorrow"
                : `${zone} · ${relativeDayLabel(daysDiff)}`,
          unread: zone === "Overdue" || zone === "Today",
          // Same note-vs-system badge every other reminder surface in the
          // app uses — colour and circle both, not just the glyph — so a
          // row reads as "someone's own note" vs "the system raised this"
          // before the title is even read.
          icon: (
            <span
              role="img"
              aria-label={item.source === "note" ? "Note" : "System"}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                SOURCE_BADGE[item.source].tone
              }`}
            >
              {SOURCE_BADGE[item.source].icon}
            </span>
          ),
        });
        targets.set(item.id, { item, day });
      }
    }

    const groups: NotificationGroup[] = NOTIFICATION_ZONES.filter(
      (label) => buckets[label].length > 0,
    ).map((label) => ({ label, items: buckets[label] }));

    return {
      notificationGroups: groups,
      notificationBadgeCount: buckets.Overdue.length + buckets.Today.length,
      notificationTargets: targets,
    };
  }, [notes, clients, todayKey]);
}
