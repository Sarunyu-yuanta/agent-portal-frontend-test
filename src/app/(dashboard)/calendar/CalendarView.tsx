"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button, Modal, Toaster, Tooltip } from "@sarunyu/system-one";
import type { ToastProps } from "@sarunyu/system-one";
import { CalendarDotIcon, CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { useNotes } from "@/contexts/notes-context";
import type { Note } from "@/types/domain";
import { DayCell } from "./DayCell";
import { MonthPicker } from "./MonthPicker";
import {
  addMonths,
  dayKey,
  dayLabel,
  monthGrid,
  weeksOf,
  WEEKDAY_LABELS,
} from "./calendar-grid";
import { AlertOverlay, type AlertTarget } from "./AlertOverlay";
import { groupDayItems } from "./day-items";
import { NoteDetailPane } from "../notes/NoteDetailPane";
import { reminderAtFromDate } from "../notes/note-format";

export function CalendarView({
  notes,
  clients,
}: {
  notes: Note[];
  clients: { id: string; name: string }[];
}) {
  const { addNote, editNote, removeNote } = useNotes();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [viewDate, setViewDate] = useState<Date | null>(null);
  if (isHydrated && viewDate === null) {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  // Shared across both modals (only one can be open at a time).
  const attributesOpenRef = useRef(false);
  const modalValuesRef = useRef<{ title: string; body: string } | null>(null);
  const [blank, setBlank] = useState(true);

  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);
  const addToast = (props: Omit<ToastProps, "onClose">) =>
    setToasts((prev) => [...prev, { ...props, id: crypto.randomUUID() }]);

  // --- Create modal (new reminder, draft — saved only on "Add note") ---
  const [createOpen, setCreateOpen] = useState(false);
  const [draftAttrs, setDraftAttrs] = useState<{
    clientIds: string[];
    reminderAt: string | null;
    reminderDone: boolean;
  }>({ clientIds: [], reminderAt: null, reminderDone: false });
  const [saving, setSaving] = useState(false);
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

  const handleNewReminder = (day: Date) => {
    draftCreatedAt.current = new Date().toISOString();
    setDraftAttrs({ clientIds: [], reminderAt: reminderAtFromDate(day), reminderDone: false });
    modalValuesRef.current = { title: "", body: "" };
    setCreateOpen(true);
  };

  const handleCreateSave = async () => {
    const values = modalValuesRef.current ?? { title: "", body: "" };
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
      addToast({ status: "success", message: "Reminder added" });
    } finally {
      setSaving(false);
    }
    setCreateOpen(false);
  };

  // --- Edit modal (existing note) ---
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const editOpen = editNoteId !== null;
  const [panelNote, setPanelNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const liveEditNote = notes.find((n) => n.id === editNoteId) ?? null;
  if (liveEditNote && liveEditNote !== panelNote) setPanelNote(liveEditNote);

  const openNoteModal = (noteId: string) => {
    setEditNoteId(noteId);
  };

  const handleEditSave = () => {
    const values = modalValuesRef.current;
    if (panelNote) {
      editNote({ ...panelNote, title: values?.title.trim() || null, body: values?.body ?? panelNote.body });
    }
    addToast({ status: "success", message: "Note saved" });
    setEditNoteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removeNote(deleteTarget.id);
    addToast({ status: "success", message: "Note deleted" });
    setDeleteTarget(null);
    if (deleteTarget.id === editNoteId) setEditNoteId(null);
  };

  /**
   * The alert panel's target, held here rather than in the cell that opened it
   * for the same reason the note modals are: a cell is 50px of a grid that
   * scrolls and re-renders, and a panel owned by one would be at the mercy of
   * it. `AlertOverlay` owns the shell around it.
   */
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);

  // `todayKey` rather than the `Date`: a fresh object every render would make
  // this memo useless, and only the day the mock alerts hang off actually
  // matters here.
  const todayKey = new Date().toDateString();
  const itemsByDay = useMemo(
    () => groupDayItems(notes, new Date(todayKey)),
    [notes, todayKey],
  );

  if (!viewDate) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading calendar…</p>;
  }

  const today = new Date();
  const days = monthGrid(viewDate);

  /**
   * The day the toolbar's "New" starts a reminder on. Clicking a cell says which
   * day it means; the toolbar button doesn't, so it has to pick one.
   *
   * Today, when today is in the month on screen — otherwise the 1st of that
   * month. Defaulting to today unconditionally would file the reminder into a
   * month you are not looking at, and it would vanish the moment the modal
   * closed. The date is editable in the modal either way; this only decides what
   * it opens on.
   */
  const defaultNewReminderDay = () =>
    viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()
      ? today
      : new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);

  return (
    <>
      <Toaster
        items={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* `max-xl:` overrides with `!`, not `rounded-none xl:rounded-xl`: the two
          tie on specificity and `@sarunyu/system-one`, which ships a plain
          `.rounded-none` and loads after `globals.css`, takes the tie — the
          corners would stay square at every width. Same trap `SELECTED_ROW` in
          `NotesSidebarList` documents. Below `xl` the shell drops its padding
          and page title for this route (`isMobileFullBleed` in `page-chrome`),
          so a border pressed against the screen edge would read as a rendering
          fault rather than a card. */}
      <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card overflow-hidden max-xl:rounded-none! max-xl:border-0!">
        {/* Navigation left, action right — the toolbar arrangement Outlook and
            Google Calendar both use. Today / ‹ / › sit together because they are
            one control (move the view) and the month label reads as their
            readout, which is why it follows them rather than heading the bar. */}
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 border-b border-border">
          {/* Three groups, not four controls: Today, the two arrows, and the
              month they read out. The gap between the groups opens up below
              `sm` — a phone has fewer pixels but bigger targets, and at 4px the
              three ran together into one undifferentiated strip. The arrows keep
              their own tight gap inside the wrapper, so widening this one
              separates the groups without pulling ‹ and › apart.

              `!` again: `@sarunyu/system-one` ships a plain `.gap-1` and loads
              after `globals.css`, so it takes the specificity tie from a
              Tailwind responsive variant and the gap never widens. */}
          <div className="flex min-w-0 flex-1 items-center gap-1 max-sm:gap-2.5!">
            {/* The button says which day it goes to only in the abstract, and
                after paging a few months you stop tracking what "today" is.
                `shrink-0` on all three controls: they are already at their
                minimum, so the month label beside them is what gives when the
                bar runs out of room. */}
            <Tooltip content={`Go to today · ${dayLabel(today)}`} side="bottom">
              <Button
                variant="plain"
                size="sm"
                className="shrink-0"
                leftIcon={<CalendarDotIcon size={15} />}
                onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              >
                Today
              </Button>
            </Tooltip>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d ?? today, -1))}
                aria-label="Previous month"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)] hover:text-foreground"
              >
                <CaretLeftIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d ?? today, 1))}
                aria-label="Next month"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors cursor-pointer hover:bg-[var(--bg-default-secondary)] hover:text-foreground"
              >
                <CaretRightIcon size={16} />
              </button>
            </div>
            {/* No padding of its own any more — the group gap above is what sets
                this apart from the arrows, and two sources of the same spacing
                would only disagree at one of the two breakpoints. */}
            <div className="min-w-0">
              <MonthPicker value={viewDate} today={today} onSelect={setViewDate} />
            </div>
          </div>

          {/* Two buttons rather than one with a hidden label. Hiding the label
              left the "+" visibly off-centre: `Button` trims the padding on
              whichever side has an icon (6px left against 8px right at `sm`),
              which is right for icon-then-text and wrong the moment the text is
              gone. `icon-md` is the design system's square size — centred by
              construction, and 32px matches the arrow buttons beside it, which
              is a better thumb target than the 28px label button anyway.

              `!` on the two `hidden`s: `Button`'s own `inline-flex` is a plain
              class in `@sarunyu/system-one`'s stylesheet, which loads after
              `globals.css` and so wins the specificity tie against a Tailwind
              responsive variant — without it both buttons render at every
              width. The same cascade trap as `SELECTED_ROW` in
              `NotesSidebarList`. */}
          <Button
            variant="primary"
            size="sm"
            className="shrink-0 max-sm:hidden!"
            leftIcon={<PlusIcon size={15} weight="bold" />}
            onClick={() => handleNewReminder(defaultNewReminderDay())}
          >
            New reminder
          </Button>
          <Button
            variant="primary"
            size="icon-md"
            aria-label="New reminder"
            className="shrink-0 sm:hidden!"
            onClick={() => handleNewReminder(defaultNewReminderDay())}
          >
            <PlusIcon size={16} weight="bold" />
          </Button>
        </div>

        <div className="grid shrink-0 grid-cols-7 border-b border-[rgba(0,0,0,0.12)]">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2 type-caption text-center text-muted-foreground">
              {label}
            </div>
          ))}
        </div>

        {/* No `border-l` here and no bottom border on the final week: the card's
            own `border` already draws those edges, and stacking a grid line on
            top of it reads as a double-thick rule on three sides. Same reason
            `DayCell` drops its `border-r` in the last column. */}
        {/* `overflow-hidden` + `basis-0` weeks, not a scroller: the month has to
            fit the card whatever the viewport is, so the six rows split the
            leftover height evenly and each cell clips its own overflow.
            `basis-0` matters — with the default `auto` basis a row's content
            (pill stack) would set its height and rows would come out uneven. */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {weeksOf(days).map((week, i) => (
            <div key={i} className="grid min-h-0 flex-1 basis-0 grid-cols-7 border-b border-[rgba(0,0,0,0.12)] last:border-b-0">
              {week.map((day, dayIndex) => (
                <DayCell
                  key={day.toISOString()}
                  day={day}
                  columnIndex={dayIndex}
                  rowIndex={i}
                  viewMonth={viewDate}
                  today={today}
                  items={itemsByDay.get(dayKey(day)) ?? []}
                  clients={clients}
                  onOpenNote={openNoteModal}
                  onOpenAlert={(item) => setAlertTarget({ item, day })}
                  onNewReminder={handleNewReminder}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Create modal — new reminder */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (attributesOpenRef.current) return;
            setCreateOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl h-[75vh] rounded-xl border border-border bg-card flex flex-col overflow-hidden shadow-xl">
            <div className="flex-1 min-h-0 overflow-hidden">
              <NoteDetailPane
                key="__draft__"
                note={draftNoteForPane}
                clients={clients}
                onSave={(patch) => setDraftAttrs((prev) => ({ ...prev, ...patch }))}
                onEmptyChange={setBlank}
                onValuesChange={(values) => { modalValuesRef.current = values; }}
                manualSave
                layout="side"
                autoFocusTitle
                onAttributesOpenChange={(open) => { attributesOpenRef.current = open; }}
              />
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateSave}
                disabled={blank || saving}
              >
                Add note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal — existing note */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (attributesOpenRef.current || deleteTarget) return;
            setEditNoteId(null);
          }}
        >
          <div className="relative w-full max-w-4xl h-[75vh] rounded-xl border border-border bg-card flex flex-col overflow-hidden shadow-xl">
            <div className="flex-1 min-h-0 overflow-hidden">
              {panelNote && (
                <NoteDetailPane
                  key={panelNote.id}
                  note={panelNote}
                  clients={clients}
                  onSave={(patch) => editNote({ ...panelNote, ...patch })}
                  onEmptyChange={setBlank}
                  onValuesChange={(values) => { modalValuesRef.current = values; }}
                  manualSave
                  layout="side"
                  autoFocusTitle={panelNote.title === null && panelNote.body === ""}
                  onAttributesOpenChange={(open) => { attributesOpenRef.current = open; }}
                  onDelete={() => setDeleteTarget(panelNote)}
                />
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" onClick={() => setEditNoteId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEditSave}
                disabled={blank}
              >
                Save
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
            title="Delete reminder?"
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

      {/* A sheet on a phone and a centred panel on a pointer device — the same
          split the day list makes, and for the same reason: a floating card is
          fine where there is room around it and wrong where there isn't. */}
      <AlertOverlay
        target={alertTarget}
        clients={clients}
        onClose={() => setAlertTarget(null)}
      />
    </>
  );
}
