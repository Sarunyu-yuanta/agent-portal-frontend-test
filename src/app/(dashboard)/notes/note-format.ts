import type { TagProps } from "@sarunyu/system-one";
import type { Note } from "@/types/domain";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type ReminderTag = { label: string; variant: NonNullable<TagProps["variant"]> };

export function reminderTag(note: Note): ReminderTag | null {
  if (!note.reminderAt) return null;
  const when = formatDateTime(note.reminderAt);
  if (note.reminderDone) return { label: `Done · ${when}`, variant: "gray" };
  const diffMs = new Date(note.reminderAt).getTime() - Date.now();
  if (diffMs < 0) return { label: `Overdue · ${when}`, variant: "red" };
  if (diffMs < 24 * 60 * 60 * 1000) return { label: `Due today · ${when}`, variant: "yellow" };
  return { label: `Reminder · ${when}`, variant: "blue" };
}
