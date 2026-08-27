"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "@sarunyu/system-one";
import { NotePencilIcon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/empty-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNotes } from "@/contexts/notes-context";
import type { Note } from "@/types/domain";
import { NotesSidebarList, DISCARD_REMOVE_MS } from "./NotesSidebarList";
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
  initialSelectedId,
  heightClassName = "h-[70vh]",
}: {
  notes: Note[];
  clients: { id: string; name: string }[];
  /** When set (even to null), new/existing notes here can't change client — used from client-scoped views. */
  lockedClientId?: string | null;
  /** Client a freshly-created note starts with when `lockedClientId` isn't set. */
  defaultClientId?: string | null;
  /** Note to open on mount — how a link from outside (e.g. a Calendar reminder) lands on one. */
  initialSelectedId?: string | null;
  heightClassName?: string;
}) {
  const { addNote, editNote, removeNote } = useNotes();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [adding, setAdding] = useState(false);
  // Reported by NoteDetailPane on every keystroke, not on its save debounce.
  const [draftBlank, setDraftBlank] = useState(false);
  // Notes mid-exit: still in `notes`, already animating out of the list.
  const [discardingIds, setDiscardingIds] = useState<string[]>([]);
  // The one note whose Title field should take the caret on open. Held as an id
  // rather than a boolean so it can't leak onto whatever gets selected next.
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);

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

  // Non-reentrant on purpose: an impatient double-click used to fire two POSTs
  // at once, and the mock API hands both the same id (it reads `max + 1` across
  // an await on a shared store), so one note overwrote the other server-side and
  // the list rendered two rows with the same React key. One create at a time
  // also just matches what a double-click means here — one new note, not two.
  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const seedClient = lockedClientId !== undefined ? lockedClientId : defaultClientId;
      const created = await addNote({
        clientIds: seedClient ? [seedClient] : [],
        title: null,
        body: "",
        author: "Relation Manager",
        reminderAt: null,
        reminderDone: false,
      });
      setSelectedId(created.id);
      // Creating a note is a statement of intent to write one, so land the caret
      // in Title instead of making the user click into an empty pane.
      setAutoFocusId(created.id);
    } finally {
      setAdding(false);
    }
  };

  /**
   * A note is worth keeping only if something was typed into it. Text alone —
   * a reminder or a client doesn't make it a note.
   *
   * This used to spare a note whose only content was a reminder, on the grounds
   * that a reminder is the one thing you can set without typing. It doesn't
   * hold: flipping the reminder switch fills a date in for you, so "empty note
   * with a reminder" is what you get from touching that switch and changing your
   * mind — not something worth keeping a blank note around for. Same rule now
   * drives the New Note lock and the discard, and the same rule runs in the
   * client-page gallery, so the two views agree.
   */
  const nothingWritten = selectedNote !== null && draftBlank;

  /**
   * Selection changes route through here so the note being left can be dropped
   * if the user never wrote in it — the way the real Notes app never keeps an
   * untouched "New Note" around once you move on. Deliberately not an unmount
   * cleanup on the detail pane: StrictMode double-mounts in dev, and the
   * throwaway delete would fire on the phantom unmount and take the note the
   * user is still looking at.
   */
  const selectAndPrune = (nextId: string | null) => {
    const leaving = selectedNote;
    setSelectedId(nextId);
    // Picking a note by hand means the user chose where to be; don't yank the
    // caret into Title on top of that.
    setAutoFocusId(null);
    if (leaving && leaving.id !== nextId && draftBlank) {
      // Two steps rather than one: mark it exiting so the row can fade and
      // collapse, and only drop it from state once that has played out.
      // Deleting straight away made it blink out of existence mid-click.
      //
      // The timer is started here, in the click handler, rather than from an
      // effect — an effect keyed on a single "discarding" id would lose the
      // first note if a second one started exiting before its timer fired, and
      // that note would then sit in the list forever.
      const id = leaving.id;
      setDiscardingIds((prev) => [...prev, id]);
      setTimeout(() => {
        // Clear the flag only once `removeNote` has settled, never alongside
        // it. `removeNote` doesn't touch `notes` until its DELETE comes back,
        // so dropping the id synchronously left a window where the note was
        // still in the list but no longer marked as leaving — the collapsed row
        // sprang back to full height, then vanished when the response landed.
        // One frame of that locally, and about half a second against a real
        // backend. That was the jiggle.
        // `finally`, not `then`: if the delete fails the note is still there, so
        // un-marking it is right — the row reopens rather than staying collapsed
        // over a note that never went away. `removeNote` lets its errors out, so
        // the catch is what keeps that from surfacing as an unhandled rejection.
        void removeNote(id)
          .catch((err) => console.warn("[NotesSplitView] discard failed", err))
          .finally(() => setDiscardingIds((prev) => prev.filter((x) => x !== id)));
      }, DISCARD_REMOVE_MS);
    }
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
            clients={clients}
            selectedId={selectedNote?.id ?? null}
            onSelect={selectAndPrune}
            onAdd={handleAdd}
            addDisabled={adding || nothingWritten}
            discardingIds={discardingIds}
          />
        </div>
      )}

      {showDetail && (
        <div className="flex-1 min-w-0 h-full">
          {selectedNote ? (
            <NoteDetailPane
              key={selectedNote.id}
              note={selectedNote}
              clients={clients}
              pinnedClientId={lockedClientId}
              onBack={isMobile ? () => selectAndPrune(null) : undefined}
              onSave={(patch) => handleSave(selectedNote.id, patch)}
              onEmptyChange={setDraftBlank}
              autoFocusTitle={selectedNote.id === autoFocusId}
              onDelete={() => setDeleteTarget(selectedNote)}
            />
          ) : (
            /*
             * Reachable only when there are no notes at all: `selectedNote` falls
             * back to the newest one whenever the explicit selection is unset, so
             * on desktop this branch means the list itself is empty (on mobile the
             * pane isn't rendered without a selection). Hence "no notes yet"
             * rather than "pick one from the list".
             *
             * Uses the shared `EmptyState` primitive; the wrapper is only here to
             * centre it, since the primitive brings a 400px floor rather than
             * filling its parent.
             */
            <div className="flex items-center justify-center h-full p-4">
              <EmptyState
                icon={
                  <NotePencilIcon
                    size={40}
                    className="text-[var(--text-default-placeholder)]"
                  />
                }
                title="No notes yet"
                body="Write your first note and it will show up in the list on the left."
                actionSlot={
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAdd}
                    disabled={adding}
                    leftIcon={<NotePencilIcon size={18} weight="bold" />}
                  >
                    New Note
                  </Button>
                }
              />
            </div>
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
