import type { Note } from "@/types/domain";
import { dayKey } from "./calendar-grid";
import { dividendAlerts, type CalendarAlert } from "./mock-alerts";

/**
 * What put a row on a day.
 *
 * The Calendar started out showing one thing — reminders the user wrote on their
 * own notes — and its components took `Note[]` straight through. That stops
 * working the moment anything else lands on a date, which is what the
 * rule-based alerts raised by the backend will be. So a day holds `DayItem`s:
 * whatever they came from, they are the same shape by the time a cell or a sheet
 * sees them, and adding a source is a matter of writing one more adapter into
 * this file rather than teaching the UI a second data shape.
 */
export type DayItemSource = "note" | "dividend";

export type DayItem = {
  /** Unique across sources — the React key for a row and a pill. */
  id: string;
  source: DayItemSource;
  title: string;
  /** The row's second line. Empty is allowed; the row falls back to a placeholder. */
  detail: string;
  /** Resolved to avatars by the caller, which is the one holding the client list. */
  clientIds: string[];
  /** Settled and no longer asking for anything. Only a note can be. */
  done: boolean;
  /**
   * The note this row opens, or `null` for an item with nothing behind it yet.
   *
   * A `null` here is what makes a row inert rather than a button — an alert that
   * looked clickable and did nothing would be a worse lie than one that plainly
   * isn't.
   */
  noteId: string | null;
};

function fromNote(note: Note): DayItem {
  return {
    id: `note:${note.id}`,
    source: "note",
    title: note.title || "Untitled note",
    detail: note.body,
    clientIds: note.clientIds,
    done: note.reminderDone,
    noteId: note.id,
  };
}

function fromAlert(alert: CalendarAlert): DayItem {
  return {
    id: `dividend:${alert.id}`,
    source: "dividend",
    title: alert.title,
    detail: alert.detail,
    clientIds: alert.clientIds,
    done: false,
    noteId: null,
  };
}

/**
 * Everything that falls on a day, keyed by that day.
 *
 * Notes with no reminder are dropped — an undated note isn't on the calendar at
 * all.
 *
 * @param today anchors the mock alerts to the month being looked at. Passed in
 * rather than read here so the whole view agrees on what "now" is; see
 * `mock-alerts`.
 */
export function groupDayItems(notes: Note[], today: Date): Map<string, DayItem[]> {
  const map = new Map<string, DayItem[]>();

  const push = (when: Date, item: DayItem) => {
    const key = dayKey(when);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  };

  for (const note of notes) {
    if (!note.reminderAt) continue;
    push(new Date(note.reminderAt), fromNote(note));
  }
  for (const alert of dividendAlerts(today)) {
    push(alert.date, fromAlert(alert));
  }

  for (const list of map.values()) {
    // Two rules, in order. Open before settled, so a ticked-off reminder can't
    // push a live one out of a cell's visible pills. Then alerts before notes:
    // an alert is a deadline someone else set and the note is the user's own
    // handwriting, so the one they can't reschedule reads first.
    list.sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        Number(a.source === "note") - Number(b.source === "note"),
    );
  }
  return map;
}
