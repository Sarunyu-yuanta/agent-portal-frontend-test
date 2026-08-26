"use client";

import { PlusIcon } from "@phosphor-icons/react";
import type { Note } from "@/types/domain";
import { groupNotesByDate } from "./notes-grouping";
import { formatDayOnly } from "./note-format";
import { reminderTag } from "./note-format";

/**
 * Notes as a wall of cards rather than a list beside a reader.
 *
 * Each card shows the note itself, shrunk — the point is to recognise a note by
 * the shape of what's in it, not to read a one-line snippet. Grouped by date the
 * same way the sidebar list is, with the "new note" tile taking the first cell of
 * the first group so it sits where the eye already starts.
 */
export function NotesGallery({
  notes,
  selectedId = null,
  onOpen,
  onAdd,
  addDisabled = false,
}: {
  notes: Note[];
  /**
   * The note currently open in the panel beside this. Worth marking because
   * that panel is non-modal — the wall stays visible, so without it there's
   * nothing saying which card you're looking at.
   */
  selectedId?: string | null;
  onOpen: (note: Note) => void;
  onAdd: () => void;
  addDisabled?: boolean;
}) {
  const groups = groupNotesByDate(notes);

  return (
    <div className="flex flex-col gap-6">
      {/* With nothing written yet there are no groups to hang the tile off, so
          it gets a grid of its own — never a screen with no way to start. */}
      {groups.length === 0 ? (
        <GalleryGrid>
          <AddTile onClick={onAdd} disabled={addDisabled} />
        </GalleryGrid>
      ) : (
        groups.map((group, groupIndex) => (
          <div key={group.label} className="flex flex-col gap-3">
            <p className="type-caption text-muted-foreground">{group.label}</p>
            <GalleryGrid>
              {groupIndex === 0 && <AddTile onClick={onAdd} disabled={addDisabled} />}
              {group.notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  selected={note.id === selectedId}
                  onOpen={() => onOpen(note)}
                />
              ))}
            </GalleryGrid>
          </div>
        ))
      )}
    </div>
  );
}

/** One column count for every tile, so the add tile lines up with the cards. */
function GalleryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{children}</div>
  );
}

function AddTile({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    // `self-start` so it keeps the box's own height instead of being stretched
    // to the full cell: grid items stretch by default, and the cards are taller
    // than their boxes because of the title and date underneath them.
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col self-start disabled:cursor-not-allowed disabled:opacity-50 group/tile"
    >
      {/* Dashed and empty where a card would have content, so it reads as a slot
          waiting to be filled rather than a note that happens to be blank. The
          same `aspect-[4/3]` the cards' boxes use, so it lines up with them.
          The accent wash is standing, not hover-only, so the tile reads as the
          one actionable thing on the wall from the moment you look at it. Hover
          steps it up one — `--primary-action-muted` is the same hue at 10%
          against the resting 6%.

          Both go through `var(...)` rather than the `bg-primary-action-light`
          class: the hover one has to (Tailwind can't build variants of the
          design system's hand-written classes), and matching them keeps the pair
          readable as one scale. */}
      <span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary-action bg-[var(--primary-action-light)] text-primary-action transition-colors group-hover/tile:bg-[var(--primary-action-muted)]">
        <PlusIcon size={24} />
        <span className="type-body-2 font-semibold">New note</span>
      </span>
    </button>
  );
}

function NoteCard({
  note,
  selected,
  onOpen,
}: {
  note: Note;
  selected: boolean;
  onOpen: () => void;
}) {
  const reminder = reminderTag(note);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={selected || undefined}
      className="flex flex-col gap-2 text-left group/tile"
    >
      {/* The note at a smaller size: its own title, then the body as written,
          clipped by the tile. `whitespace-pre-wrap` keeps the line breaks — they
          are most of what makes one note recognisable from another at a glance.
          `select-none` because this is a button, not a passage to select.

          `aspect-[4/3]` — landscape, so the wall stays scannable at a glance
          instead of every row being tall enough to read. A fixed ratio rather
          than content height is what keeps rows even: note bodies are any
          length, so their height can't come from what's in them. */}
      {/* Hover lifts the card off the wall — accent border, a shadow and a 2px
          rise. The border alone was too quiet to tell you a card was a target
          at all, and on a grid of similar rectangles the shadow is what reads
          fastest.

          Hover border goes through `var(...)`, not the `border-primary-action`
          class the add tile uses: that one is hand-written in the design
          system's stylesheet rather than being a Tailwind utility, so Tailwind
          can't build a `group-hover` variant of it and the rule was never
          emitted at all. Bare, the class is fine — it's only variants of it that
          silently do nothing.

          `motion-reduce:` drops the movement and keeps the colour and shadow,
          which carry the same message without anything sliding.

          The open card gets a ring rather than just the accent border: hover is
          transient and this isn't, so they need to be told apart when the
          pointer happens to be resting on the open one. */}
      <span
        className={`flex aspect-[4/3] flex-col gap-1 overflow-hidden rounded-lg border bg-card p-3 select-none transition-[border-color,box-shadow,transform] duration-150 ease-out group-hover/tile:-translate-y-0.5 group-hover/tile:border-[var(--primary-action)] group-hover/tile:shadow-md motion-reduce:group-hover/tile:translate-y-0 ${
          selected
            ? "border-[var(--primary-action)] ring-2 ring-[var(--primary-action-muted)]"
            : "border-border"
        }`}
      >
        {note.title && (
          <span className="type-caption font-semibold text-foreground line-clamp-2">
            {note.title}
          </span>
        )}
        <span className="type-caption whitespace-pre-wrap text-muted-foreground">
          {note.body || "No additional text"}
        </span>
      </span>

      <span className="flex flex-col gap-0.5">
        <span className="type-body-2 font-semibold text-foreground truncate">
          {note.title || "New Note"}
        </span>
        <span className="type-caption text-muted-foreground">
          {formatDayOnly(note.updatedAt)}
          {reminder && <> · {reminder.label}</>}
        </span>
      </span>
    </button>
  );
}
