import { BASE } from "@/lib/api";
import type { ApiNote } from "@/types/api";
import type { Note } from "@/types/domain";

const REQUEST_TIMEOUT_MS = 8_000;

function toNote(item: ApiNote): Note {
  return {
    id: String(item.id),
    // Tolerates the old single-`clientId` shape so notes stored before this
    // became a list don't come back looking like general notes.
    clientIds: item.clientIds ?? (item.clientId ? [item.clientId] : []),
    title: item.title,
    body: item.body,
    author: item.author,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    reminderAt: item.reminderAt,
    reminderDone: item.reminderDone,
  };
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE}/notes?pagination[pageSize]=100`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`API /notes: ${res.status}`);
  const { data } = (await res.json()) as { data: ApiNote[] };
  return data.map(toNote);
}

/** Everything the caller supplies for a new note — server assigns id/timestamps. */
export type NoteDraft = Omit<Note, "id" | "createdAt" | "updatedAt">;

export async function createNote(draft: NoteDraft): Promise<Note> {
  const now = new Date().toISOString();
  const res = await fetch(`${BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...draft, createdAt: now, updatedAt: now }),
  });
  if (!res.ok) throw new Error(`API POST /notes: ${res.status}`);
  const { data } = (await res.json()) as { data: ApiNote };
  return toNote(data);
}

/**
 * The mock PUT handler replaces the whole record server-side, so this sends
 * every field (minus id) rather than a partial patch — `createdAt` must be
 * carried forward from the existing note, only `updatedAt` refreshes here.
 */
export async function updateNote(id: string, note: Omit<Note, "id" | "updatedAt">): Promise<Note> {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...note, updatedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`API PUT /notes/${id}: ${res.status}`);
  const { data } = (await res.json()) as { data: ApiNote };
  return toNote(data);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${BASE}/notes/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`API DELETE /notes/${id}: ${res.status}`);
}
