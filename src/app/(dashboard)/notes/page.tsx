"use client";

import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { NotesSplitView } from "./NotesSplitView";

/**
 * The full note history — every note the RM has written, client-linked or
 * general. Client 360's Notes tab is the same data filtered to one client;
 * this page is where general (non-client) notes actually live.
 */
export default function NotesPage() {
  const clients = useClients();
  const { notes, isLoading } = useNotes();

  if (isLoading) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading notes…</p>;
  }

  // The dashboard shell hands `/notes` a flex-column content area sized to the
  // viewport below the top bar (`isFullHeight` in `page-chrome`), so the split
  // view claims what's left rather than guessing a vh fraction.
  return <NotesSplitView notes={notes} clients={clients} heightClassName="flex-1 min-h-0" />;
}
