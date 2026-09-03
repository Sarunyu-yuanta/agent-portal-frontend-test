"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarBlankIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { setQueryState, withQuery } from "@/lib/query-state";
import { AlertOverlay, type AlertTarget } from "../../calendar/AlertOverlay";
import { dayFromKey, dayRelation, weekdayLabel } from "../../calendar/calendar-grid";
import { groupDayItems, type DayItem } from "../../calendar/day-items";
import { DONE_BADGE_TONE, SOURCE_BADGE } from "../../calendar/source-badge";
import { formatDayOnly } from "../../notes/note-format";
import { snippet } from "../../notes/notes-grouping";

/** One row: an item plus the day it was read off. */
type Row = { item: DayItem; day: Date };

/**
 * The four buckets, in the order they matter.
 *
 * Not one flat chronological list. A reminder's date only means something
 * relative to today, and the thing you open this tab to find out is what has
 * slipped — which a single run of dates ordered by day buries in the middle. So
 * the sections carry the urgency and the dates inside them only have to say
 * "when", which is why no row needs a status word of its own.
 *
 * Done sits at the bottom in reverse: it is finished business, kept so a ticked
 * reminder can still be found, and the one you finished last is the one you are
 * most likely looking for.
 */
const SECTIONS = ["Overdue", "Today", "Upcoming", "Done"] as const;

/**
 * A client's reminders, on their own tab.
 *
 * The same rows the Calendar's day panel draws, for the same reason they look
 * that way there — but gathered by client instead of by day, and carrying both
 * sources: the reminders the user wrote on their own notes, and the alerts the
 * backend raised that name this client. Until now those two only met on the
 * Calendar, where finding one client's meant reading every day of the month.
 *
 * A note row hands off to the Notes tab with that note open rather than growing
 * a second editor here — one place notes are written, whichever list you found
 * one from. An alert row opens the read-only panel, since there is nothing on it
 * for the desk to edit.
 */
export function ClientRemindersTab({ clientId }: { clientId: string }) {
  const searchParams = useSearchParams();
  const clients = useClients();
  const { notes, isLoading } = useNotes();
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);

  // `todayKey` rather than the `Date`: a fresh object every render would make
  // the memo useless, and only the day is what either source is measured
  // against. Same trick `CalendarView` uses.
  const todayKey = new Date().toDateString();

  const sections = useMemo(() => {
    const today = new Date(todayKey);
    const rows: Row[] = [];
    for (const [key, items] of groupDayItems(notes, today, clientId)) {
      // `dayFromKey`, not `new Date(key)` — see the note on it. A key's month is
      // zero-based and the string parser isn't.
      const day = dayFromKey(key);
      for (const item of items) rows.push({ item, day });
    }

    const bucket = (row: Row) =>
      row.item.done ? "Done" : ({ past: "Overdue", today: "Today", future: "Upcoming" } as const)[
        dayRelation(row.day, today)
      ];

    return SECTIONS.map((label) => {
      const group = rows.filter((row) => bucket(row) === label);
      // Ascending everywhere but Done — oldest first means most overdue first,
      // and soonest first for what's ahead.
      group.sort((a, b) =>
        label === "Done"
          ? b.day.getTime() - a.day.getTime()
          : a.day.getTime() - b.day.getTime(),
      );
      return { label, rows: group };
    }).filter((section) => section.rows.length > 0);
  }, [notes, clientId, todayKey]);

  const openNote = (noteId: string) =>
    setQueryState(
      withQuery(`/client/${clientId}`, searchParams, { tab: "notes", note: noteId }),
      "push",
    );

  if (isLoading) {
    return (
      <p className="type-body-2 text-muted-foreground text-center py-10">Loading reminders…</p>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12 text-center">
        <CalendarBlankIcon size={32} className="text-muted-foreground/40" />
        <p className="type-body-2 text-muted-foreground">No reminders</p>
        {/* Says where they come from, because there is nothing on this tab that
            makes one — a reminder is an attribute of a note. */}
        <p className="type-caption text-muted-foreground/60">
          Set one from a note on the Notes tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-2">
            <p className="type-caption font-medium uppercase tracking-wide text-muted-foreground">
              {section.label} · {section.rows.length}
            </p>
            {/* `overflow-hidden` so the first and last row's hover fill clips to
                the card's rounded corners instead of squaring them off — the
                same reason the Calendar's popover turns off its own padding. */}
            <ul className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
              {section.rows.map((row) => (
                <ReminderRow
                  key={row.item.id}
                  row={row}
                  onOpen={() =>
                    row.item.noteId
                      ? openNote(row.item.noteId)
                      : setAlertTarget({ item: row.item, day: row.day })
                  }
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* No holder list: this whole page is one client, so the panel would be
          listing the person whose profile you are standing in — see
          `AlertDetail`. */}
      <AlertOverlay
        target={alertTarget}
        clients={clients}
        showHolders={false}
        onClose={() => setAlertTarget(null)}
      />
    </>
  );
}

function ReminderRow({ row, onOpen }: { row: Row; onOpen: () => void }) {
  const { item, day } = row;
  const badge = SOURCE_BADGE[item.source];

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)]!"
      >
        {/* The circle carries where the row came from — primary for the user's
            own handwriting, orange for anything the system raised. Read from the
            shared lookup rather than restated here; a local copy is how the
            alert panel stayed green after the Calendar's pills turned orange. */}
        <span
          role="img"
          aria-label={badge.label}
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
            item.done ? DONE_BADGE_TONE : badge.tone
          }`}
        >
          {badge.icon}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={`type-body-2 font-medium truncate ${
              item.done ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {item.title}
          </span>
          <span className="type-caption text-muted-foreground truncate">
            {item.detail ? snippet(item.detail, 60) : "No additional text"}
          </span>
        </span>

        {/* The date, where the Calendar's day panel puts the avatar stack. That
            stack would be this same client on every row here, and a list
            spanning months needs the one thing a single-day panel never did:
            which day each row is actually on — so it is the one thing that
            can't be dropped on a phone.

            The weekday under it can. "Friday" is what makes a date land as a
            day rather than a number, and it is worth a line where there's room;
            at two hundred-odd pixels of row it would be competing with the
            title for the space. */}
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="type-caption font-medium text-foreground tabular-nums">
            {formatDayOnly(day.toISOString())}
          </span>
          <span className="type-caption text-muted-foreground max-sm:hidden">
            {weekdayLabel(day)}
          </span>
        </span>

        <CaretRightIcon
          size={14}
          className="shrink-0 text-muted-foreground transition-opacity max-sm:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
        />
      </button>
    </li>
  );
}
