import type { Note } from "@/types/domain";

const WEEKDAYS_PER_WEEK = 7;
/** Six rows covers every month (a 31-day month starting on Saturday needs it),
 * so paging between months always renders the same grid height. */
const WEEKS_SHOWN = 6;

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/**
 * The fixed 6×7 grid a month view shows: the tail of the previous month that
 * fills the first row, every day of `viewDate`'s own month, and enough of the
 * next month to fill six full weeks.
 */
export function monthGrid(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

  return Array.from({ length: WEEKS_SHOWN * WEEKDAYS_PER_WEEK }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

/** `monthGrid`'s flat 42 days, chunked into six 7-day weeks — one per grid row. */
export function weeksOf(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += WEEKDAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + WEEKDAYS_PER_WEEK));
  }
  return weeks;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** The heading a day's reminder popover reads — "Thursday, 27 Aug 2026". */
export function dayHeading(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Groups notes by the calendar day their reminder falls on — notes with no reminder are dropped. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function groupRemindersByDay(notes: Note[]): Map<string, Note[]> {
  const map = new Map<string, Note[]>();
  for (const note of notes) {
    if (!note.reminderAt) continue;
    const key = dayKey(new Date(note.reminderAt));
    const list = map.get(key);
    if (list) list.push(note);
    else map.set(key, [note]);
  }
  // Open reminders before done ones within a day, so a completed reminder
  // doesn't bump an active one out of the cell's visible pills.
  for (const list of map.values()) {
    list.sort((a, b) => Number(a.reminderDone) - Number(b.reminderDone));
  }
  return map;
}
