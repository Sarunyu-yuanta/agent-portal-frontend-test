"use client";

import { useState } from "react";
import { Button, Dropdown, Input, TextArea, TimeInput, Toggle, DateInput } from "@sarunyu/system-one";
import type { TimeValue } from "@sarunyu/system-one";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import type { Note } from "@/types/domain";
import type { NoteDraft } from "@/lib/notes-api";

const DEFAULT_REMINDER_TIME: TimeValue = { hour: 9, minute: 0 };

function combineDateTime(date: Date, time: TimeValue): string {
  const combined = new Date(date);
  combined.setHours(time.hour, time.minute, 0, 0);
  return combined.toISOString();
}

export function NoteFormModal({
  open,
  onOpenChange,
  mode,
  initialNote,
  lockedClientId,
  defaultClientId,
  clients,
  saving = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialNote?: Note;
  /** When set (even to null), the client field is fixed and hidden — used from client-scoped views. */
  lockedClientId?: string | null;
  /** Pre-selects this client in the (still visible/editable) dropdown — used when opening from a client's own page but the user may still want a different client or a general note. Ignored when `lockedClientId` is set. */
  defaultClientId?: string | null;
  clients: { id: string; name: string }[];
  saving?: boolean;
  onSubmit: (draft: NoteDraft) => void;
}) {
  const [clientId, setClientId] = useState<string | null>(
    initialNote?.clientId ?? lockedClientId ?? defaultClientId ?? null,
  );
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [body, setBody] = useState(initialNote?.body ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(initialNote?.reminderAt));
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    initialNote?.reminderAt ? new Date(initialNote.reminderAt) : undefined,
  );
  const [reminderTime, setReminderTime] = useState<TimeValue>(
    initialNote?.reminderAt
      ? { hour: new Date(initialNote.reminderAt).getHours(), minute: new Date(initialNote.reminderAt).getMinutes() }
      : DEFAULT_REMINDER_TIME,
  );

  const canSubmit = body.trim().length > 0 && (!reminderEnabled || reminderDate != null);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      clientId: lockedClientId !== undefined ? lockedClientId : clientId,
      title: title.trim() || null,
      body: body.trim(),
      author: initialNote?.author ?? "Relation Manager",
      reminderAt: reminderEnabled && reminderDate ? combineDateTime(reminderDate, reminderTime) : null,
      reminderDone: reminderEnabled ? (initialNote?.reminderDone ?? false) : false,
    });
  };

  const clientOptions = [
    { label: "General note (no client)", value: "" },
    ...clients.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "add" ? "New note" : "Edit note"}
      mobileContentClassName="flex flex-col gap-4 p-4"
      desktopContentClassName="flex flex-col gap-4 min-w-[420px] max-w-[480px]"
    >
      {lockedClientId === undefined && (
        <Dropdown
          label="Client"
          placeholder="General note (no client)"
          value={clientId ?? ""}
          onChange={(value) => setClientId(value || null)}
          options={clientOptions}
        />
      )}

      <Input label="Title (optional)" placeholder="Short subject" value={title} onChange={setTitle} />

      <TextArea
        label="Note"
        placeholder="What do you want to remember?"
        value={body}
        onChange={setBody}
        rows={5}
        required
      />

      <Toggle
        checked={reminderEnabled}
        onChange={setReminderEnabled}
        label="Set a reminder"
        description="Shown in-app on this note and in the client's reminder list."
      />

      {reminderEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            placeholder="Date"
            value={reminderDate}
            onChange={setReminderDate}
            required
          />
          <TimeInput placeholder="Time" value={reminderTime} onChange={setReminderTime} />
        </div>
      )}

      <div className="pt-2 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!canSubmit || saving} onClick={handleSubmit}>
          {saving ? "Saving…" : mode === "add" ? "Add note" : "Save changes"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
