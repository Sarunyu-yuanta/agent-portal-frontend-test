"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Note } from "@/types/domain";
import { fetchNotes, createNote, updateNote, deleteNote, type NoteDraft } from "@/lib/notes-api";

type NotesContextValue = {
  notes: Note[];
  isLoading: boolean;
  addNote: (draft: NoteDraft) => Promise<Note>;
  editNote: (note: Note) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

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

  const addNote = useCallback(async (draft: NoteDraft) => {
    const created = await createNote(draft);
    setNotes((prev) => [created, ...prev]);
    return created;
  }, []);

  const editNote = useCallback(async (note: Note) => {
    const { id, createdAt, ...rest } = note;
    const updated = await updateNote(id, { ...rest, createdAt });
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

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
