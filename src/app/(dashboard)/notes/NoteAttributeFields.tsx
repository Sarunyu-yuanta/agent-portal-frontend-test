"use client";

import { useState, type ReactNode } from "react";
import { BellIcon, UserIcon } from "@phosphor-icons/react";
import { DateInput, DropdownMultiple, Toggle } from "@sarunyu/system-one";
import { defaultReminderDate, reminderAtFromDate } from "./note-format";

/**
 * The two things a note carries besides its text.
 *
 * Both take a plain value and an `onChange` rather than a `Note` and a save
 * callback, so they work the same on a note that exists (the detail pane, where
 * every change is a save) and on one that doesn't yet (the quick-note dialog,
 * where they edit a draft until it's submitted).
 */

/** Small icon + text heading above each control. */
function FieldLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 type-body-2 text-muted-foreground">
      <span className="shrink-0 flex items-center">{icon}</span>
      {children}
    </span>
  );
}

export function ClientField({
  clientIds,
  clients,
  pinnedClientId,
  onChange,
}: {
  clientIds: string[];
  clients: { id: string; name: string }[];
  /**
   * A client that can't be taken off the note — set when this is open on that
   * client's own page.
   *
   * The other clients are still editable, because it's the same note either way
   * and a conversation that turns out to involve someone else shouldn't send you
   * to a different screen to say so. Only this one is held: the client page
   * filters its notes by `clientIds.includes(...)`, so dropping it would make
   * the note vanish off the wall and close the panel you were typing in.
   */
  pinnedClientId?: string | null;
  onChange: (next: string[]) => void;
}) {
  // Before the early return below, so the hook order can't shift with the props.
  const [enabled, setEnabled] = useState(clientIds.length > 0);

  // No "General note (no client)" entry — the switch is what says general, so
  // leaving it in the list would be a second way to say the same thing, and the
  // two could disagree.
  const options = clients.map((c) => ({ label: c.name, value: c.id }));

  if (pinnedClientId) {
    const pinnedName =
      clients.find((c) => c.id === pinnedClientId)?.name ?? pinnedClientId;
    return (
      <div className="flex flex-col gap-1.5">
        {/* No switch here: the note always has at least the pinned client, so
            there is no "general note" state to toggle into. */}
        <FieldLabel icon={<UserIcon size={16} />}>Client</FieldLabel>
        <DropdownMultiple
          placeholder="Select clients"
          value={clientIds}
          options={options}
          helperText={`${pinnedName} stays on this note`}
          // Put the pin back if the dropdown drops it. `DropdownMultiple` has no
          // per-option lock, so this is enforced on the way out instead.
          onChange={(next) =>
            onChange(next.includes(pinnedClientId) ? next : [...next, pinnedClientId])
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Toggle
        size="sm"
        checked={enabled}
        onChange={(next) => {
          setEnabled(next);
          // Switching off is a complete instruction, so it reports. Switching on
          // isn't: unlike the reminder, where tomorrow is a fair default, there
          // is no sensible default client to pick on someone's behalf — so the
          // note stays general until at least one is actually chosen.
          if (!next) onChange([]);
        }}
        label={<FieldLabel icon={<UserIcon size={16} />}>Client</FieldLabel>}
      />
      {enabled && (
        <DropdownMultiple
          placeholder="Select clients"
          value={clientIds}
          options={options}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export function ReminderField({
  reminderAt,
  onChange,
}: {
  reminderAt: string | null;
  onChange: (next: string | null) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(
    reminderAt ? new Date(reminderAt) : undefined,
  );
  /**
   * The switch's own state rather than `Boolean(reminderAt)`, so it responds to
   * the click itself instead of waiting on a round trip through the note.
   */
  const [enabled, setEnabled] = useState(Boolean(reminderAt));

  return (
    <div className="flex flex-col gap-1.5">
      <Toggle
        size="sm"
        checked={enabled}
        onChange={(next) => {
          setEnabled(next);
          if (!next) {
            onChange(null);
            return;
          }
          // Switching on lands on tomorrow when nothing is set yet, so the
          // reminder is real from the first click and the date is there to
          // adjust rather than to supply. Keeps any date already chosen.
          const target = date ?? defaultReminderDate();
          setDate(target);
          onChange(reminderAtFromDate(target));
        }}
        label={<FieldLabel icon={<BellIcon size={16} />}>Reminder</FieldLabel>}
      />
      {enabled && (
        <DateInput
          placeholder="Date"
          value={date}
          onChange={(next) => {
            setDate(next);
            // Clearing the field clears the reminder too. Otherwise the note
            // keeps one the empty input says isn't there.
            onChange(next ? reminderAtFromDate(next) : null);
          }}
        />
      )}
    </div>
  );
}
