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

  return <NotesSplitView notes={notes} clients={clients} heightClassName="h-[75vh]" />;
}
