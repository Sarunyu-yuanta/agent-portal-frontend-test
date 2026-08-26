"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@sarunyu/system-one";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { DetailDrawer } from "@/components/ui/detail-drawer";
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
  const [adding, setAdding] = useState(false);
  // Reported by `NoteDetailPane` on every keystroke, not on its save debounce —
  // so a note is never thrown away over text the user has already typed but
  // that hasn't been written back yet.
  const [draftBlank, setDraftBlank] = useState(false);

  // `includes`, not equality: a note can cover several clients, and it belongs
  // on every one of their pages.
  const clientNotes = useMemo(
    () => notes.filter((n) => n.clientIds.includes(clientId)),
    [notes, clientId],
  );

  /**
   * The open note is URL-owned (`?note=4`), following the same pattern as the
   * Client Hub's quick-view drawer: refresh, a shared link and the browser back
   * button all land on the same open panel, and closing doesn't need its own
   * piece of state to remember.
   */
  const noteParam = searchParams.get("note");
  const openNote = (noteParam && clientNotes.find((n) => n.id === noteParam)) || null;
  const drawerOpen = openNote !== null;

  // The drawer animates out after the param is gone, so the last note is kept
  // around to slide away with content rather than collapsing to blank.
  const [panelNote, setPanelNote] = useState<Note | null>(openNote);
  if (openNote && openNote !== panelNote) setPanelNote(openNote);

  // Only rewind history if we're the ones who pushed the panel onto it —
  // arriving straight on `?note=…` must not bounce out of the app.
  const pushedPanelRef = useRef(false);

  const hrefFor = (noteId: string | null) =>
    withQuery(`/client/${clientId}`, searchParams, { tab: "notes", note: noteId });

  /** URL work only — no pruning. Used where the note is already gone. */
  const navigateClosed = () => {
    if (pushedPanelRef.current) {
      pushedPanelRef.current = false;
      router.back();
    } else {
      setQueryState(hrefFor(null), "replace");
    }
  };

  /**
   * A note nobody typed into isn't worth a card on the wall, so leaving one
   * throws it away — the same rule the Notes hub applies when you move off an
   * untouched note. Text is the whole test: flipping the reminder switch fills a
   * date in for you, so "blank note with a reminder" is what changing your mind
   * about that switch leaves behind.
   */
  const pruneIfBlank = (note: Note | null) => {
    if (note && draftBlank) void removeNote(note.id);
  };

  const openNoteId = (noteId: string) => {
    const leaving = openNote;
    // Card-to-card while the panel is already open swaps what it shows rather
    // than stacking history entries to unwind one at a time.
    if (drawerOpen) {
      setQueryState(hrefFor(noteId), "replace");
    } else {
      pushedPanelRef.current = true;
      setQueryState(hrefFor(noteId), "push");
    }
    if (leaving && leaving.id !== noteId) pruneIfBlank(leaving);
  };

  const closePanel = () => {
    const leaving = openNote;
    navigateClosed();
    pruneIfBlank(leaving);
  };

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const created = await addNote({
        clientIds: [clientId],
        title: null,
        body: "",
        author: "Relation Manager",
        reminderAt: null,
        reminderDone: false,
      });
      // Straight into the editor — the tile is a way to start writing, not a way
      // to add a blank card to the wall.
      openNoteId(created.id);
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const wasOpen = deleteTarget.id === openNote?.id;
    await removeNote(deleteTarget.id);
    setDeleteTarget(null);
    // `navigateClosed`, not `closePanel`: the note is already deleted, and
    // pruning would fire a second delete for the same id.
    if (wasOpen) navigateClosed();
  };

  if (isLoading) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading notes…</p>;
  }

  return (
    <>
      <NotesGallery
        notes={clientNotes}
        selectedId={openNote?.id ?? null}
        onOpen={(note) => openNoteId(note.id)}
        onAdd={handleAdd}
        addDisabled={adding}
      />

      {/* `DetailDrawer` is non-modal, which is the point: the wall stays visible
          and clickable, so moving to another note is one click instead of close-
          then-open. `wide` because a note is prose, not a field list. */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(next, details) => {
          if (next) return;
          if (details.reason === "outside-press") {
            const target = details.event.target as Element | null;
            /*
             * Clicking outside closes the drawer — except when "outside" is a
             * Radix popover, which Base UI has no way to recognise as ours.
             *
             * The footer's client/reminder popover portals to `document.body`, so
             * it lands outside this drawer's DOM subtree and Base UI reads a
             * click in it as a click on the page. One selector covers all of it:
             * `DateInput`'s calendar and `DropdownMultiple`'s list are absolutely
             * positioned *inside* that popover rather than portalled again, so
             * they sit under the same wrapper.
             */
            if (target?.closest("[data-radix-popper-content-wrapper]")) {
              details.cancel();
              return;
            }
            // A confirmation is up; nothing behind it should act on the click.
            if (deleteTarget) {
              details.cancel();
              return;
            }
          }
          closePanel();
        }}
        size="wide"
        className="flex flex-col overflow-hidden p-0"
      >
        {panelNote && (
          <NoteDetailPane
            key={panelNote.id}
            note={panelNote}
            clients={clients}
            // Pinned, not locked: this client can't be taken off the note (it
            // would vanish off the wall you're looking at), but other clients
            // stay editable — it's the same note the hub lets you re-file.
            pinnedClientId={clientId}
            onSave={(patch) => editNote({ ...panelNote, ...patch })}
            onEmptyChange={setDraftBlank}
            // Narrow drawer: a side card would eat a third of the writing area.
            layout="footer"
            autoFocusTitle={panelNote.title === null && panelNote.body === ""}
            onDelete={() => setDeleteTarget(panelNote)}
          />
        )}
      </DetailDrawer>

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
