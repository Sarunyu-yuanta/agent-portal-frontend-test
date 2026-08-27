"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal, Toaster } from "@sarunyu/system-one";
import type { ToastProps } from "@sarunyu/system-one";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { setQueryState, withQuery } from "@/lib/query-state";
import type { Note } from "@/types/domain";
import { NotesGallery } from "../../notes/NotesGallery";
import { NoteDetailPane } from "../../notes/NoteDetailPane";

/**
 * Notes tab on a client's Full Profile — a wall of cards rather than the Notes
 * hub's list-beside-reader.
 *
 * Different shape for a different job: the hub is where you work through every
 * note you have, so it wants a list and a reader side by side. Here you're
 * looking at one client, the set is small, and what you want is to recognise the
 * note you're after — which cards do better than rows.
 */
export function ClientNotesTab({ clientId }: { clientId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clients = useClients();
  const { notes, isLoading, addNote, editNote, removeNote } = useNotes();

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const attributesOpenRef = useRef(false);
  // Latest title/body from NoteDetailPane — read on "Add note" click.
  const modalValuesRef = useRef<{ title: string; body: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);
  const addToast = (props: Omit<ToastProps, "onClose">) =>
    setToasts((prev) => [...prev, { ...props, id: crypto.randomUUID() }]);
  // True when the editor is blank — disables "Add note" so empty notes can't be saved.
  const [draftBlank, setDraftBlank] = useState(true);

  // --- Create flow: modal opens with a local draft, note is only created in DB on "Add note" ---
  const [createOpen, setCreateOpen] = useState(false);
  const [draftAttrs, setDraftAttrs] = useState<{
    clientIds: string[];
    reminderAt: string | null;
    reminderDone: boolean;
  }>({ clientIds: [clientId], reminderAt: null, reminderDone: false });
  // Stable timestamp so the displayed date doesn't jump when attributes change.
  const draftCreatedAt = useRef(new Date().toISOString());

  const draftNoteForPane = useMemo<Note>(
    () => ({
      id: "__draft__",
      title: null,
      body: "",
      author: "Relation Manager",
      createdAt: draftCreatedAt.current,
      updatedAt: draftCreatedAt.current,
      ...draftAttrs,
    }),
    [draftAttrs],
  );

  // --- Edit flow: existing note opened via URL param ---
  const clientNotes = useMemo(
    () => notes.filter((n) => n.clientIds.includes(clientId)),
    [notes, clientId],
  );

  const noteParam = searchParams.get("note");
  const openNote = (noteParam && clientNotes.find((n) => n.id === noteParam)) || null;
  const editOpen = openNote !== null;

  // Kept in state so the modal still has content while it fades out after closing.
  const [panelNote, setPanelNote] = useState<Note | null>(openNote);
  if (openNote && openNote !== panelNote) {
    setPanelNote(openNote);
    if (openNote.id !== panelNote?.id) attributesOpenRef.current = false;
  }

  const pushedPanelRef = useRef(false);

  const hrefFor = (noteId: string | null) =>
    withQuery(`/client/${clientId}`, searchParams, { tab: "notes", note: noteId });

  const navigateClosed = () => {
    if (pushedPanelRef.current) {
      pushedPanelRef.current = false;
      router.back();
    } else {
      setQueryState(hrefFor(null), "replace");
    }
  };

  const pruneIfBlank = (note: Note | null) => {
    if (note && draftBlank) void removeNote(note.id);
  };

  const openNoteId = (noteId: string) => {
    const leaving = openNote;
    if (editOpen) {
      setQueryState(hrefFor(noteId), "replace");
    } else {
      pushedPanelRef.current = true;
      setQueryState(hrefFor(noteId), "push");
    }
    if (leaving && leaving.id !== noteId) pruneIfBlank(leaving);
  };

  // --- Shared modal close ---
  const closeModal = () => {
    if (createOpen) {
      setCreateOpen(false);
    } else {
      pruneIfBlank(openNote);
      navigateClosed();
    }
  };

  // --- "New note" tile: open create modal without touching the DB ---
  const handleAdd = () => {
    draftCreatedAt.current = new Date().toISOString();
    setDraftAttrs({ clientIds: [clientId], reminderAt: null, reminderDone: false });
    modalValuesRef.current = { title: "", body: "" };
    setCreateOpen(true);
  };

  // --- "Add note" button in modal ---
  const handleModalSave = async () => {
    const values = modalValuesRef.current ?? { title: "", body: "" };

    if (createOpen) {
      if (saving) return;
      setSaving(true);
      try {
        await addNote({
          clientIds: draftAttrs.clientIds,
          title: values.title.trim() || null,
          body: values.body,
          author: "Relation Manager",
          reminderAt: draftAttrs.reminderAt,
          reminderDone: draftAttrs.reminderDone,
        });
        addToast({ status: "success", message: "Note added" });
      } finally {
        setSaving(false);
      }
      setCreateOpen(false);
    } else if (panelNote) {
      editNote({ ...panelNote, title: values.title.trim() || null, body: values.body });
      addToast({ status: "success", message: "Note saved" });
      navigateClosed();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const wasOpen = deleteTarget.id === openNote?.id;
    await removeNote(deleteTarget.id);
    addToast({ status: "success", message: "Note deleted" });
    setDeleteTarget(null);
    if (wasOpen) navigateClosed();
  };

  const modalOpen = createOpen || editOpen;

  if (isLoading) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading notes…</p>;
  }

  return (
    <>
      <Toaster
        items={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
      <NotesGallery
        notes={clientNotes}
        selectedId={openNote?.id ?? null}
        onOpen={(note) => openNoteId(note.id)}
        onAdd={handleAdd}
        addDisabled={createOpen}
      />

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (attributesOpenRef.current || deleteTarget) return;
            closeModal();
          }}
        >
          <div className="relative w-full max-w-4xl h-[75vh] rounded-xl border border-border bg-card flex flex-col overflow-hidden shadow-xl">
            <div className="flex-1 min-h-0 overflow-hidden">
              {createOpen ? (
                <NoteDetailPane
                  key="__draft__"
                  note={draftNoteForPane}
                  clients={clients}
                  pinnedClientId={clientId}
                  onSave={(patch) => setDraftAttrs((prev) => ({ ...prev, ...patch }))}
                  onEmptyChange={setDraftBlank}
                  onValuesChange={(values) => { modalValuesRef.current = values; }}
                  manualSave
                  layout="side"
                  autoFocusTitle
                  onAttributesOpenChange={(open) => { attributesOpenRef.current = open; }}
                />
              ) : panelNote ? (
                <NoteDetailPane
                  key={panelNote.id}
                  note={panelNote}
                  clients={clients}
                  pinnedClientId={clientId}
                  onSave={(patch) => editNote({ ...panelNote, ...patch })}
                  onEmptyChange={setDraftBlank}
                  onValuesChange={(values) => { modalValuesRef.current = values; }}
                  manualSave
                  layout="side"
                  autoFocusTitle={panelNote.title === null && panelNote.body === ""}
                  onAttributesOpenChange={(open) => { attributesOpenRef.current = open; }}
                  onDelete={() => setDeleteTarget(panelNote)}
                />
              ) : null}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleModalSave}
                disabled={draftBlank || saving}
              >
                {createOpen ? "Add note" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
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
    </>
  );
}
