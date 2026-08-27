"use client";

import { useState } from "react";
import { Popover } from "@sarunyu/system-one";
import type { Note } from "@/types/domain";
import { reminderTag, TAG_CHIP_TONE } from "../notes/note-format";
import { DayPopoverContent } from "./DayPopoverContent";
import { isSameDay, isSameMonth } from "./calendar-grid";

/** Pills a cell shows before folding the rest into "+N more" — three is what a
 * ~110px-tall cell fits without the day number getting crowded out. */
const MAX_VISIBLE_PILLS = 3;

export function DayCell({
  day,
  viewMonth,
  today,
  notes,
  clients,
  onOpenNote,
  onNewReminder,
}: {
  day: Date;
  /** The month currently being viewed — days outside it render muted. */
  viewMonth: Date;
  today: Date;
  /** This day's reminders, already sorted by the caller. */
  notes: Note[];
  clients: { id: string; name: string }[];
  onOpenNote: (noteId: string) => void;
  onNewReminder: (day: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const inMonth = isSameMonth(day, viewMonth);
  const isToday = isSameDay(day, today);
  const visible = notes.slice(0, MAX_VISIBLE_PILLS);
  const overflow = notes.length - visible.length;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      content={
        open ? (
          <DayPopoverContent
            day={day}
            notes={notes}
            clients={clients}
            onOpenNote={onOpenNote}
            // The sheet is the actual editing surface (see `CalendarView`) — this
            // popover's job ends the moment it hands off to it.
            onNewReminder={() => {
              setOpen(false);
              onNewReminder(day);
            }}
          />
        ) : null
      }
    >
      {/* `border-[rgba(0,0,0,0.12)]` rather than `border-border`: the same
          10%-black-opacity-reads-as-invisible issue `globals.css` already
          documents for `system-one`'s `<Table>` (~2-3% perceived contrast on
          a white cell). Not much darker than that 10%, though — a whole grid
          of these compounds, and a value that reads as a crisp single line in
          isolation reads as a heavy one repeated across 7 columns × 6 rows.

          Hover is the same story: `hover:bg-[var(--bg-default-secondary)]`
          (the token every other hover state in the app uses) loses the
          cascade fight against this cell's own `bg-card` here — `system-one`'s
          stylesheet loads after `globals.css` and apparently isn't layered the
          same way, so its `bg-card` outranks an app-level `hover:` variant
          regardless of specificity. The trailing `!` is this repo's existing
          fix for exactly that (see `SELECTED_TITLE` in `NotesSidebarList.tsx`),
          and an explicit colour sidesteps the token entirely rather than
          fighting to make the reference win too. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setOpen(true);
        }}
        className={`flex h-full min-h-28 flex-col gap-1 border-r border-[rgba(0,0,0,0.12)] p-1.5 text-left transition-colors cursor-pointer hover:bg-[rgba(0,0,0,0.045)]! ${
          inMonth ? "bg-card" : "bg-[var(--bg-default-secondary)]/60"
        }`}
      >
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full type-caption font-semibold ${
            isToday
              ? "bg-destructive text-white"
              : inMonth
                ? "text-foreground"
                : "text-muted-foreground/50"
          }`}
        >
          {day.getDate()}
        </span>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
          {visible.map((note) => {
            const tag = reminderTag(note);
            return (
              <span
                key={note.id}
                className={`truncate rounded-[3px] px-1 py-0.5 type-caption leading-tight ${
                  tag ? TAG_CHIP_TONE[tag.variant] : "bg-[var(--bg-default-secondary)] text-muted-foreground"
                }`}
              >
                {note.title || "Untitled note"}
              </span>
            );
          })}
          {overflow > 0 && (
            <span className="px-1 type-caption text-muted-foreground">+{overflow} more</span>
          )}
        </div>
      </div>
    </Popover>
  );
}
