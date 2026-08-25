"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, TrashIcon } from "@phosphor-icons/react";
import { Dropdown, Tag, TimeInput, Toggle, DateInput } from "@sarunyu/system-one";
import type { TimeValue } from "@sarunyu/system-one";
import type { Note } from "@/types/domain";
import { formatDateTime, reminderTag } from "./note-format";

const DEFAULT_REMINDER_TIME: TimeValue = { hour: 9, minute: 0 };

function combineDateTime(date: Date, time: TimeValue): string {
  const combined = new Date(date);
  combined.setHours(time.hour, time.minute, 0, 0);
  return combined.toISOString();
}

function ClientChip({
  note,
  clientName,
  clients,
  locked,
  onSave,
}: {
  note: Note;
  clientName: string | null;
  clients: { id: string; name: string }[];
  locked: boolean;
  onSave: (patch: Partial<Note>) => void;
}) {
  const [editing, setEditing] = useState(false);
  if (locked) return null;

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="cursor-pointer">
        <Tag text={clientName ?? "General"} variant={clientName ? "blue" : "gray"} size="small" />
      </button>
    );
  }

  const options = [
    { label: "General note (no client)", value: "" },
    ...clients.map((c) => ({ label: c.name, value: c.id })),
  ];
  return (
    <div className="w-56">
      <Dropdown
        placeholder="Client"
        value={note.clientId ?? ""}
        options={options}
        onChange={(value) => {
          onSave({ clientId: value || null });
          setEditing(false);
        }}
      />
    </div>
  );
}

function ReminderChip({ note, onSave }: { note: Note; onSave: (patch: Partial<Note>) => void }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    note.reminderAt ? new Date(note.reminderAt) : undefined,
  );
  const [time, setTime] = useState<TimeValue>(
    note.reminderAt
      ? { hour: new Date(note.reminderAt).getHours(), minute: new Date(note.reminderAt).getMinutes() }
      : DEFAULT_REMINDER_TIME,
  );

  const tag = reminderTag(note);

  if (!editing) {
    return tag ? (
      <button type="button" onClick={() => setEditing(true)} className="cursor-pointer">
        <Tag text={tag.label} variant={tag.variant} size="small" icon />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="type-caption text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        + Add reminder
      </button>
    );
  }

  return (
    <div className="w-full flex flex-wrap items-center gap-2">
      <Toggle
        size="sm"
        checked={Boolean(note.reminderAt)}
        onChange={(next) => {
          if (!next) {
            onSave({ reminderAt: null, reminderDone: false });
            setEditing(false);
          } else if (date) {
            onSave({ reminderAt: combineDateTime(date, time), reminderDone: false });
          }
        }}
        label="Reminder"
      />
      <DateInput
        placeholder="Date"
        value={date}
        onChange={(next) => {
          setDate(next);
          if (next) onSave({ reminderAt: combineDateTime(next, time), reminderDone: false });
        }}
      />
      <TimeInput
        placeholder="Time"
        value={time}
        onChange={(next) => {
          setTime(next);
          if (date) onSave({ reminderAt: combineDateTime(date, next), reminderDone: false });
        }}
      />
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="type-caption text-primary-action cursor-pointer"
      >
        Done
      </button>
    </div>
  );
}

export function NoteDetailPane({
  note,
  clientName,
  clients,
  lockedClientId,
  onBack,
  onSave,
  onDelete,
}: {
  note: Note;
  /** Resolved client name, or null for a general (non-client) note. */
  clientName: string | null;
  clients: { id: string; name: string }[];
  /** When set (even to null), the client chip is not editable — used from client-scoped views. */
  lockedClientId?: string | null;
  /** Shown as a back arrow next to the date — mobile drill-in only. */
  onBack?: () => void;
  onSave: (patch: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title ?? "");
  const [body, setBody] = useState(note.body);

  // Always the freshest `note`/`onSave` — read inside the debounce timeout
  // below so a save that fires after a chip edit landed merges against that
  // update instead of the snapshot from whenever typing started.
  const latestRef = useRef({ note, onSave });
  useEffect(() => {
    latestRef.current = { note, onSave };
  });

  // Title and body save together, debounced, rather than independently on
  // blur: two independent saves fired close together (tabbing from Title
  // straight into the body) can resolve out of order, and whichever lands
  // second — still holding the *other* field's old value — clobbers it.
  useEffect(() => {
    const timer = setTimeout(() => {
      const { note: current, onSave: save } = latestRef.current;
      const nextTitle = title.trim() || null;
      const patch: Partial<Note> = {};
      if (nextTitle !== current.title) patch.title = nextTitle;
      if (body !== current.body) patch.body = body;
      if (Object.keys(patch).length > 0) save(patch);
    }, 500);
    return () => clearTimeout(timer);
  }, [title, body]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex items-center justify-center size-7 -ml-1 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-foreground cursor-pointer shrink-0"
            >
              <ArrowLeftIcon size={18} />
            </button>
          )}
          <p className="type-caption text-muted-foreground truncate">{formatDateTime(note.updatedAt)}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete note"
          className="flex items-center justify-center size-7 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
        >
          <TrashIcon size={16} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 shrink-0 border-b border-border">
        <ClientChip
          note={note}
          clientName={clientName}
          clients={clients}
          locked={lockedClientId !== undefined}
          onSave={onSave}
        />
        <ReminderChip note={note} onSave={onSave} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="type-h5 text-foreground bg-transparent outline-none border-none placeholder:text-muted-foreground/50 w-full"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start typing…"
          className="type-body-2 text-foreground bg-transparent outline-none border-none resize-none flex-1 min-h-[200px] placeholder:text-muted-foreground/50 w-full"
        />
      </div>
    </div>
  );
}
