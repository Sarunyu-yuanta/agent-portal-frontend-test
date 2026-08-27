"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Tooltip } from "@sarunyu/system-one";
import { ClientAvatarStack } from "@/components/ui/client-avatar-stack";
import type { Note } from "@/types/domain";
import { dayHeading } from "./calendar-grid";
import { reminderTag, TAG_CHIP_TONE } from "../notes/note-format";
import { snippet } from "../notes/notes-grouping";

/**
 * What a day cell opens into: the reminders due that day, each a click away
 * from its note, and a "+" that hands off to the caller's own new-note flow
 * (a `DetailDrawer` sheet at the Calendar page level — see `CalendarView` —
 * rather than anything owned by this popover).
 */
export function DayPopoverContent({
  day,
  notes,
  clients,
  onOpenNote,
  onNewReminder,
}: {
  day: Date;
  /** This day's reminders, already filtered and sorted by the caller. */
  notes: Note[];
  clients: { id: string; name: string }[];
  onOpenNote: (noteId: string) => void;
  onNewReminder: () => void;
}) {
  return (
    <div className="flex w-72 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="type-body-2 font-semibold text-foreground">{dayHeading(day)}</p>
        <Tooltip content="New reminder" side="top">
          <button
            type="button"
            onClick={onNewReminder}
            aria-label="New reminder"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-default-secondary)] text-muted-foreground transition-colors cursor-pointer hover:bg-primary-action hover:text-white"
          >
            <PlusIcon size={15} weight="bold" />
          </button>
        </Tooltip>
      </div>

      {notes.length === 0 ? (
        <p className="type-body-2 text-muted-foreground text-center py-6">
          No reminders on this day
        </p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {notes.map((note) => {
            const tag = reminderTag(note);
            return (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => onOpenNote(note.id)}
                  className="flex w-full flex-col items-start gap-1 rounded-lg px-2 py-2 text-left transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)]"
                >
                  <span className="flex w-full items-center gap-1.5">
                    {tag && (
                      <span
                        className={`shrink-0 rounded-[4px] px-1.5 py-0.5 type-caption ${TAG_CHIP_TONE[tag.variant]}`}
                      >
                        {note.reminderDone ? "Done" : tag.label.split(" · ")[0]}
                      </span>
                    )}
                    <span className="type-body-2 font-medium text-foreground truncate">
                      {note.title || "Untitled note"}
                    </span>
                  </span>
                  {(note.body || note.clientIds.length > 0) && (
                    <span className="flex w-full items-center gap-1.5 pl-0.5">
                      {note.clientIds.length > 0 && (
                        <ClientAvatarStack
                          names={note.clientIds.map(
                            (id) => clients.find((c) => c.id === id)?.name ?? id,
                          )}
                          slots={3}
                          size="small"
                        />
                      )}
                      {note.body && (
                        <span className="type-caption text-muted-foreground truncate">
                          {snippet(note.body)}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
