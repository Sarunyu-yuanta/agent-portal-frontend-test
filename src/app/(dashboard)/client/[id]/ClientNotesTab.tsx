"use client";

import { useMemo } from "react";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { NotesSplitView } from "../../notes/NotesSplitView";

/** Notes tab on a client's Full Profile — the same note history, filtered to this client. */
export function ClientNotesTab({ clientId }: { clientId: string }) {
  const clients = useClients();
  const { notes, isLoading } = useNotes();

  const clientNotes = useMemo(
    () => notes.filter((n) => n.clientId === clientId),
    [notes, clientId],
  );

  if (isLoading) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading notes…</p>;
  }

  return (
    <NotesSplitView
      notes={clientNotes}
      clients={clients}
      lockedClientId={clientId}
      heightClassName="h-[560px]"
    />
  );
}
