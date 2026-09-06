"use client";

import {
  CalendarBlankIcon,
  CaretRightIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { ClientAvatarStack } from "@/components/ui/client-avatar-stack";
import { dayLabel, weekdayLabel, type DayRelation } from "./calendar-grid";
import type { DayItem } from "./day-items";
import { SourceBadgeIcon } from "./source-badge";
import { snippet } from "../notes/notes-grouping";

/**
 * Header badge per relation, or `null` where the date line already says it.
 *
 * Only two of the three earn one. "Overdue" is the fact the header can't show —
 * the date alone doesn't say it has slipped — and "Today" is worth calling out
 * because it's the one day being looked at from the inside. A future day would
 * get "Upcoming", which is exactly what the date already told you.
 */
const RELATION_BADGE: Record<DayRelation, { label: string; className: string } | null> = {
  past: {
    label: "Overdue",
    className: "bg-[var(--fill-p1-100)] text-[var(--fill-p1-600)]",
  },
  today: { label: "Today", className: "bg-primary-action text-white" },
  future: null,
};

/**
 * What a day cell opens into: everything landing on that day — reminders the
 * user wrote, alerts the backend raised — plus a "New reminder" action that
 * hands off to the caller's own flow (a modal at the Calendar page level, see
 * `CalendarView`, rather than anything owned by this panel).
 *
 * Laid out as header / scrolling list / footer action, with the popover's own
 * padding turned off by the caller so the section rules and the row hover run
 * edge to edge. A day with seven reminders is the case this has to survive, and
 * inset rows in a padded box leave it looking like a stack of loose cards.
 */
export function DayPopoverContent({
  day,
  items,
  clients,
  relation,
  onOpenNote,
  onOpenAlert,
  onNewReminder,
  variant = "popover",
}: {
  day: Date;
  /** This day's rows, already filtered and sorted by the caller. */
  items: DayItem[];
  clients: { id: string; name: string }[];
  /** Where `day` sits against today, resolved by the cell. Drives the header
   * badge only: the rows carry no status mark of their own, since a single-day
   * list would repeat the same one down every row. */
  relation: DayRelation;
  onOpenNote: (noteId: string) => void;
  /** Opens a row that has no note behind it — an alert — in its own panel. */
  onOpenAlert: (item: DayItem) => void;
  onNewReminder: () => void;
  /**
   * Which shell is holding this. `popover` sizes itself; `sheet` takes the width
   * it is given and spends the room on taller rows, because on a phone every one
   * of them is a touch target rather than a mouse target.
   */
  variant?: "popover" | "sheet";
}) {
  const isSheet = variant === "sheet";
  // An "Overdue" badge on a day whose reminders are all ticked off would be
  // wrong: nothing is outstanding. The badge describes work still owed, so a
  // fully-cleared past day gets none.
  const badge =
    relation === "past" && items.every((i) => i.done) ? null : RELATION_BADGE[relation];

  return (
    <div className={`flex min-h-0 flex-col ${isSheet ? "w-full" : "w-80"}`}>
      <header
        className={`flex shrink-0 items-start justify-between gap-3 px-3.5 ${
          isSheet ? "pb-3 pt-1" : "pb-2.5 pt-3"
        }`}
      >
        <div className="min-w-0">
          <p className="type-body-1 font-semibold text-foreground">{dayLabel(day)}</p>
          {/* Weekday and count share a line: both are context for the list below,
              and stacking them would push the first reminder out of view. */}
          {/* The count is dropped when there is nothing — "Nothing scheduled"
              is already about to say so, in bigger type, right below. */}
          <p className="type-caption text-muted-foreground">
            {weekdayLabel(day)}
            {items.length > 0 && ` · ${items.length} item${items.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {badge && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 type-caption font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </header>

      {items.length === 0 ? (
        // `border-y` matches the list's, so the footer below sits under exactly
        // one rule whichever branch renders.
        <div className="flex flex-col items-center gap-2 border-y border-border/60 px-3.5 py-8 text-center">
          <CalendarBlankIcon size={28} className="text-muted-foreground/40" />
          <p className="type-body-2 text-muted-foreground">Nothing scheduled</p>
        </div>
      ) : (
        <ul
          className={`flex flex-col divide-y divide-border/60 overflow-y-auto border-y border-border/60 ${
            // The sheet is already capped at 75vh and flexes; a second cap here
            // would leave dead space under a short list.
            isSheet ? "min-h-0 flex-1" : "max-h-80"
          }`}
        >
          {items.map((item) => {
            // No per-row state word. Every row in this list falls on the same
            // day, so "Overdue" would have printed identically on all of them —
            // the same noise the repeated "Reminder" chip was. It moved to the
            // header, which is where a fact about the day belongs.
            const clientNames = item.clientIds.map(
              (id) => clients.find((c) => c.id === id)?.name ?? id,
            );
            // Every row opens something now — a note goes to its editor, an
            // alert to a read-only panel listing the holders it affects.
            const open = item.noteId ? () => onOpenNote(item.noteId!) : () => onOpenAlert(item);

            const body = (
              <>
                {/* `self-center`, like the caret: the badge stands for the row
                    rather than for its title line. */}
                <SourceBadgeIcon item={item} size={isSheet ? "default" : "small"} selfCenter />

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`type-body-2 font-medium truncate ${
                      item.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="type-caption text-muted-foreground truncate">
                    {item.detail ? snippet(item.detail, 44) : "No additional text"}
                  </span>
                </span>

                {clientNames.length > 0 && (
                  <span className="mt-0.5 shrink-0">
                    <ClientAvatarStack names={clientNames} slots={3} size="small" />
                  </span>
                )}
                {/* `self-center`: the caret stands for the whole row, so it
                    centres against both lines. Sits in the layout at all times so
                    a row does not reflow on hover; only its opacity changes.
                    Always on in the sheet — there is no hover on a phone, so a
                    hover-only affordance is one nobody ever sees. */}
                <CaretRightIcon
                  size={14}
                  className={`self-center shrink-0 text-muted-foreground transition-opacity ${
                    isSheet ? "opacity-40" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </>
            );

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={open}
                  className={`group flex w-full items-start gap-2.5 px-3.5 text-left transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)]! ${
                    isSheet ? "py-3.5" : "py-2.5"
                  }`}
                >
                  {body}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onNewReminder}
        className={`flex shrink-0 items-center gap-1.5 px-3.5 type-body-2 font-medium text-primary-action transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)]! ${
          // Extra bottom room in the sheet clears the home indicator on a
          // gesture-navigation phone, where the last few pixels aren't tappable.
          isSheet ? "pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))]" : "py-2.5"
        }`}
      >
        <PlusIcon size={15} weight="bold" />
        New reminder
      </button>
    </div>
  );
}
