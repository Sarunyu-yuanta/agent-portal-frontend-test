"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@sarunyu/system-one";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNotes } from "@/contexts/notes-context";
import type { Note } from "@/types/domain";
import { NotesSidebarList } from "./NotesSidebarList";
import { NoteDetailPane } from "./NoteDetailPane";

/**
 * Apple-Notes-style master/detail view, shared by the Notes hub, the Client
 * 360 Notes tab, and the Client Hub Notes dialog. Responsive by itself: side
 * by side on desktop, single-pane drill-in (list → detail, with a back
 * arrow) below 768px — the same breakpoint/hook `ResponsiveDialog` uses.
 */
export function NotesSplitView({
  notes,
  clients,
  lockedClientId,
  defaultClientId,
  heightClassName = "h-[70vh]",
}: {
  notes: Note[];
  clients: { id: string; name: string }[];
  /** When set (even to null), new/existing notes here can't change client — used from client-scoped views. */
  lockedClientId?: string | null;
  /** Client a freshly-created note starts with when `lockedClientId` isn't set. */
  defaultClientId?: string | null;
  heightClassName?: string;
}) {
  const { addNote, editNote, removeNote } = useNotes();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const nameById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  // Derived, not synced via effect: fall back to the most recently edited
  // note whenever the explicit selection is unset or points at a note that's
  // gone (deleted, filtered out) — matching how the real Notes app never
  // shows a truly blank pane unless the list itself is empty. Mobile is the
  // exception: it starts on the list and only opens a note on an explicit tap.
  const rawSelectedNote = notes.find((n) => n.id === selectedId) ?? null;
  const newestNote = useMemo(
    () =>
      notes.length === 0
        ? null
        : [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0],
    [notes],
  );
  const selectedNote = rawSelectedNote ?? (isMobile ? null : newestNote);

  // `handleSave` is handed down into child closures (the debounced title/body
  // save, the chip editors) that may still fire after `notes` has moved on —
  // merging against `notesRef.current` instead of the `selectedNote` closure
  // keeps every save's merge-base as fresh as possible, so a save that lands
  // late doesn't clobber a different field's edit that landed in between.
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  });

  const handleAdd = async () => {
    const created = await addNote({
      clientId: lockedClientId !== undefined ? lockedClientId : (defaultClientId ?? null),
      title: null,
      body: "",
      author: "Relation Manager",
      reminderAt: null,
      reminderDone: false,
    });
    setSelectedId(created.id);
  };

  const handleSave = (id: string, patch: Partial<Note>) => {
    const current = notesRef.current.find((n) => n.id === id);
    if (!current) return;
    editNote({ ...current, ...patch });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removeNote(deleteTarget.id);
    if (deleteTarget.id === selectedId) setSelectedId(null);
    setDeleteTarget(null);
  };

  const showSidebar = !isMobile || !selectedNote;
  const showDetail = !isMobile || Boolean(selectedNote);

  return (
    <div
      className={`flex ${isMobile ? "flex-col" : "flex-row"} ${heightClassName} rounded-xl border border-border overflow-hidden bg-card`}
    >
      {showSidebar && (
        <div
          className={
            isMobile ? "w-full h-full" : "w-[280px] shrink-0 h-full border-r border-border"
          }
        >
          <NotesSidebarList
            notes={notes}
            selectedId={selectedNote?.id ?? null}
            onSelect={setSelectedId}
            onAdd={handleAdd}
            onDeleteRequest={setDeleteTarget}
          />
        </div>
      )}

      {showDetail && (
        <div className="flex-1 min-w-0 h-full">
          {selectedNote ? (
            <NoteDetailPane
              key={selectedNote.id}
              note={selectedNote}
              clientName={
                selectedNote.clientId ? (nameById[selectedNote.clientId] ?? selectedNote.clientId) : null
              }
              clients={clients}
              lockedClientId={lockedClientId}
              onBack={isMobile ? () => setSelectedId(null) : undefined}
              onSave={(patch) => handleSave(selectedNote.id, patch)}
              onDelete={() => setDeleteTarget(selectedNote)}
            />
          ) : (
            <div className="flex items-center justify-center h-full" />
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Modal
            variant="alert"
            alertStatus="danger"
            title="Delete note?"
            description="This note will be permanently removed."
            actionLayout="double"
            primaryLabel="Delete"
            secondaryLabel="Cancel"
            onPrimaryClick={confirmDelete}
            onSecondaryClick={() => setDeleteTarget(null)}
            onClose={() => setDeleteTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
