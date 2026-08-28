"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Note } from "@/types/domain";
import { fetchNotes, createNote, updateNote, deleteNote, type NoteDraft } from "@/lib/notes-api";

type NotesContextValue = {
  notes: Note[];
  isLoading: boolean;
  /**
   * `localId` lets a caller that was already showing the note under an id of its
   * own hand that id over instead of being given a new one. `NotesSplitView`
   * composes into a local draft and only creates the note once a character is
   * typed — if that create minted a fresh id, the row and the editor would both
   * change key mid-keystroke and remount, taking the caret with them.
   */
  addNote: (draft: NoteDraft, localId?: string) => Promise<Note>;
  editNote: (note: Note) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

/**
 * Marks an id minted here rather than by the API. Prefixed so it can never
 * collide with a server id, which is always a stringified number.
 *
 * Exported because it doubles as "this note appeared because someone clicked,
 * not because a fetch returned" — which is exactly the set of rows the sidebar
 * animates in. Server ids arrive only from `fetchNotes`, i.e. already-existing
 * notes that shouldn't animate.
 */
export const LOCAL_ID_PREFIX = "local-";
let localIdSeq = 0;

/**
 * Single shared note list for the whole app — mounted once in the dashboard
 * layout so every screen (the Notes hub, a client's Notes tab, the Overview
 * Reminders card, the floating "New note" button) reads and writes the same
 * data. Without this, adding a note from one screen wouldn't appear on
 * another already-open screen until that screen remounted.
 */
export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch((err) => console.warn("[NotesProvider]", err))
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * `POST /notes` is a network round trip, so waiting for it before the row and
   * the editor appear puts a visible stall between the click and anything
   * happening. Instead the note goes into state under a local id straight away
   * and the request settles behind it.
   *
   * The local id is what the rest of the app sees for the rest of the session,
   * *including* after the server answers: it's this row's React key and the
   * detail pane's, so swapping it in for the server's id would remount the
   * editor out from under whoever is already typing in it. Only the network
   * layer deals in server ids, via `serverIds` below.
   *
   * Unique local ids also make duplicate React keys structurally impossible on
   * create — worth noting because the mock API *can* hand two concurrent POSTs
   * the same id (it reads `max + 1` across an await on a shared store, see
   * `src/app/api/mock/[...slug]/route.ts`), which is what used to crash the list.
   */
  const pendingCreates = useRef(new Map<string, Promise<Note>>());
  const serverIds = useRef(new Map<string, string>());

  /**
   * Local id → the id to send to the API. Waits on the create when it hasn't
   * landed yet, so an edit typed within the first few hundred milliseconds
   * doesn't PUT to an id the server has never seen. `null` means the create
   * failed and there is nothing on the server to talk about.
   */
  const resolveServerId = useCallback(async (id: string): Promise<string | null> => {
    if (!id.startsWith(LOCAL_ID_PREFIX)) return id;
    const known = serverIds.current.get(id);
    if (known) return known;
    const pending = pendingCreates.current.get(id);
    if (!pending) return null;
    try {
      return (await pending).id;
    } catch {
      return null;
    }
  }, []);

  const addNote = useCallback(async (draft: NoteDraft, presetLocalId?: string) => {
    const now = new Date().toISOString();
    const localId = presetLocalId ?? `${LOCAL_ID_PREFIX}${++localIdSeq}`;
    const optimistic: Note = { ...draft, id: localId, createdAt: now, updatedAt: now };
    setNotes((prev) => [optimistic, ...prev]);

    const request = createNote(draft);
    pendingCreates.current.set(localId, request);
    request
      .then((saved) => {
        serverIds.current.set(localId, saved.id);
        // Server fields win (real timestamps), but the local id stays.
        setNotes((prev) => prev.map((n) => (n.id === localId ? { ...saved, id: localId } : n)));
      })
      .catch((err) => {
        console.warn("[NotesProvider] create failed", err);
        setNotes((prev) => prev.filter((n) => n.id !== localId));
      })
      .finally(() => pendingCreates.current.delete(localId));

    return optimistic;
  }, []);

  const editNote = useCallback(
    async (note: Note) => {
      const { id, createdAt, ...rest } = note;
      const serverId = await resolveServerId(id);
      if (!serverId) return note;
      const updated = await updateNote(serverId, { ...rest, createdAt });
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...updated, id } : n)));
      return { ...updated, id };
    },
    [resolveServerId],
  );

  const removeNote = useCallback(
    async (id: string) => {
      const serverId = await resolveServerId(id);
      if (serverId) await deleteNote(serverId);
      serverIds.current.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [resolveServerId],
  );

  return (
    <NotesContext.Provider value={{ notes, isLoading, addNote, editNote, removeNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}
