import { useMemo } from "react";
import type { Note } from "@/types/domain";
import { dayFromKey, dayOffset, relativeDayLabel, todayDateKey } from "./calendar-grid";
import { groupDayItems, type DayItem } from "./day-items";
import { SOURCE_BADGE } from "./source-badge";
import {
  isDue,
  zoneForDays,
  type ZonedNotification,
} from "../notification-zones";

/**
 * The header bell's reminder rows and click targets — every client's reminders
 * and every dividend alert, tagged with the zone each one falls in. Lifted out
 * of the app-shell layout: this is a self-contained "day items in, notification
 * rows out" computation with no dependency on page chrome.
 *
 * Returns rows rather than groups. The shell merges them with the KYC feed and
 * groups the combined list once, so both sources share one ordering — see
 * `@/app/(dashboard)/notification-zones`.
 *
 * A reminder stays in whichever zone it currently falls in until it crosses
 * into the next one, so one that rang at 15 days out doesn't go quiet until 7
 * and read as though it had been dealt with in between.
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
    const rows: ZonedNotification[] = [];
    // `onItemClick` only gets back the `NotificationItem` it was handed, and
    // that shape has no room for the `DayItem`/day a reminder actually is —
    // so this is the side table that answers "which modal, opened on what"
    // once the click actually happens.
    const targets = new Map<string, { item: DayItem; day: Date }>();

    for (const [key, items] of dayMap) {
      const day = dayFromKey(key);
      const daysDiff = dayOffset(day, today);
      const zone = zoneForDays(daysDiff);
      if (!zone) continue; // more than 15 days out — hasn't rung yet
      for (const item of items) {
        if (item.done) continue;
        const names = item.clientIds
          .map((id) => clients.find((c) => c.id === id)?.name ?? id)
          .join(", ");
        rows.push({
          zone,
          daysLeft: daysDiff,
          item: {
            id: item.id,
            title: item.title,
            description: names || item.detail,
            // Which day inside the zone. The bell paints this only in its
            // "กำลังจะถึง" screen, where the heading is a range and the exact
            // day still tells the reader something; on the first screen the
            // heading is already the exact day and repeating it read as a
            // second, contradictory date.
            time: relativeDayLabel(daysDiff),
            unread: isDue(zone),
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
          },
        });
        targets.set(item.id, { item, day });
      }
    }

    return {
      notificationRows: rows,
      notificationTargets: targets,
    };
  }, [notes, clients, todayKey]);
}
