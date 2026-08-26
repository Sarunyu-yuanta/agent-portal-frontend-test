"use client";

import { useMemo, useState } from "react";
import { Button, SearchInput } from "@sarunyu/system-one";
import { BellIcon, NotePencilIcon } from "@phosphor-icons/react";
import { ClientAvatarStack } from "@/components/ui/client-avatar-stack";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Note } from "@/types/domain";
import { LOCAL_ID_PREFIX } from "@/contexts/notes-context";
import { groupNotesByDate, snippet } from "./notes-grouping";
import { formatListStamp } from "./note-format";

type Filter = "all" | "reminders";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reminders", label: "Reminders" },
];

/** How long a discarded row takes to fade and collapse out. */
export const DISCARD_EXIT_MS = 200;

/**
 * When `NotesSplitView` may actually drop the note from state — strictly *after*
 * the collapse has finished, never at the same moment.
 *
 * These were one constant, and that was the shudder at the end of the slide: a
 * CSS transition doesn't begin until the frame after the class flips, so it ends
 * a frame or two past its nominal duration, while `setTimeout` fires on schedule.
 * The row was getting pulled out of the DOM still 2–3px tall, and everything
 * below it snapped up to close that last sliver instantly. The buffer means
 * removal happens while the row has been sitting at exactly 0px for a few
 * frames, so it costs nothing visually.
 */
export const DISCARD_REMOVE_MS = DISCARD_EXIT_MS + 80;

/**
 * Two-tier selection, the way a native master/detail list behaves: the selected
 * row fills with the accent colour at full strength while the list itself is the
 * active pane, and thins to a 6% wash of that same accent once focus moves to
 * the search box or the note body. The row keeps the same size and shape either
 * way and stays recognisably blue — only the strength drops, so it still reads
 * as "this is the open note" without competing with whatever you're actually
 * typing in.
 *
 * Three levels that don't get confused for each other: neutral hover
 * (`--bg-default-secondary`) < inactive selection (`--primary-action-light`) <
 * active selection (`--primary-action`).
 *
 * Driven entirely by `group-focus-within/list` on the scroll container, so there
 * is no focus bookkeeping in state — and no focusin/focusout flicker when
 * tabbing from one row to the next. Every class here only ever lands on the
 * selected row.
 *
 * Two cascade traps here, both from `@sarunyu/system-one/styles.css` being
 * imported *after* `globals.css` in the root layout:
 *
 * 1. *Both* fills go through `var(...)` rather than the `bg-primary-action` /
 *    `bg-primary-action-light` classes the rest of the app uses. Those are
 *    hand-written in the design system's stylesheet, not Tailwind utilities:
 *    Tailwind can't build a `group-focus-within` variant of one, and using the
 *    other as the base would let it beat the variant on the tie described in
 *    (2) — the faint wash would win and the row would never go solid. The
 *    variables are on `:root` and redefined under `.dark`, so this stays
 *    theme-aware.
 * 2. The text overrides are forced with `!`. The design system also ships plain
 *    `.text-foreground` / `.text-muted-foreground` classes — same 0-1-0
 *    specificity as a Tailwind variant, but later in the cascade, so they win
 *    the tie and the text stays dark-on-accent. `!` is what makes the override
 *    independent of stylesheet order.
 */
const SELECTED_ROW =
  "bg-[var(--primary-action-light)] group-focus-within/list:bg-[var(--primary-action)]";
const SELECTED_TITLE = "group-focus-within/list:text-white!";
/** Secondary tone inside a selected row: the preview line and the meta icons. */
const SELECTED_SECONDARY = "group-focus-within/list:text-white/75!";
const SELECTED_STAMP = "group-focus-within/list:text-white!";

export function NotesSidebarList({
  notes,
  clients,
  selectedId,
  onSelect,
  onAdd,
  addDisabled = false,
  discardingIds = [],
}: {
  notes: Note[];
  /** Resolves each note's `clientIds` into names for its avatar stack. */
  clients: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  /** Notes on their way out — rendered collapsing rather than yanked instantly. */
  discardingIds?: string[];
  /**
   * Locks the New Note button — either a create is already in flight, or the
   * open note is still blank and a second empty note would be pointless.
   */
  addDisabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let result = notes;
    if (filter === "reminders")
      result = result.filter((n) => n.reminderAt && !n.reminderDone);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (n) =>
          (n.title ?? "").toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q),
      );
    }
    return result;
  }, [notes, filter, search]);

  const groups = useMemo(() => groupNotesByDate(filtered), [filtered]);

  // Built once per render of the list rather than per row: every row would
  // otherwise re-scan the whole client array for each of its ids.
  const nameById = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col gap-2 p-3 shrink-0">
        <SearchInput
          placeholder="Search"
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          size="sm"
          className="w-full"
        />
        {/* `xl` is 40px, which lines up with the 38px `SearchInput` above it —
            the default `sm` button is 28px and read as an afterthought under it. */}
        <Button
          variant="primary"
          size="xl"
          onClick={onAdd}
          disabled={addDisabled}
          leftIcon={<NotePencilIcon size={18} weight="bold" />}
          className="w-full justify-center"
        >
          New Note
        </Button>
      </div>

      {/* shadcn `Tabs` used purely as a segmented control — the two filters are
          views of the same list, so there are no `TabsContent` panels; the list
          below reads `filter` directly. `w-full` overrides the list's `w-fit`
          so the segments split the sidebar width evenly. */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="px-3 pb-2 shrink-0"
      >
        <TabsList aria-label="Filter notes" className="w-full">
          {FILTERS.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* `group/list` is what the two-tier selection below keys off — see
          SELECTED_*. Named rather than bare `group` so that adding any per-row
          `group-hover:` behaviour later can't accidentally bind to this one.

          `overflow-anchor: none` switches off scroll anchoring, which otherwise
          nudges `scrollTop` every frame to keep its anchor element still —
          helpful for content loading in, but it fights a deliberate height
          animation and reads as a shudder as the rows settle. Costs no layout.

          Deliberately NOT `scrollbar-gutter: stable`, which was here for a
          while: where the platform draws classic scrollbars it reserves their
          width permanently, so the rows' `mx-2` became 8px on the left and 8px
          + ~15px of gutter on the right — a visible, always-on lopsidedness. It
          was only ever guarding a one-off shift when the list crosses its scroll
          threshold, and the jitter that prompted it turned out to be a
          state-ordering bug in `NotesSplitView`. Not worth the trade. */}
      <div className="group/list flex-1 min-h-0 overflow-y-auto [overflow-anchor:none]">
        {groups.length === 0 ? (
          <p className="type-body-2 text-muted-foreground text-center py-10">
            No Notes
          </p>
        ) : (
          groups.map((group) => {
            // Discarding the only note in a group would otherwise leave its
            // header hanging for a frame and then pop out, which is a second
            // jump right after the row's. Collapse the whole block instead.
            const groupExiting = group.notes.every((n) =>
              discardingIds.includes(n.id),
            );
            // The mirror image on the way in: a brand-new note landing in a
            // group that didn't exist yet (the first note of the day) brings a
            // header with it, and that header should expand in with the row
            // rather than pop above it.
            const groupEntering = group.notes.every((n) =>
              n.id.startsWith(LOCAL_ID_PREFIX),
            );
            return (
              <div
                key={group.label}
                aria-hidden={groupExiting || undefined}
                style={{ transitionDuration: `${DISCARD_EXIT_MS}ms` }}
                className={`grid transition-[grid-template-rows] ease-out ${
                  groupExiting
                    ? "grid-rows-[0fr] pointer-events-none"
                    : "grid-rows-[1fr]"
                } ${groupEntering ? "starting:grid-rows-[0fr]" : ""}`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col pb-1">
                    <p className="type-caption text-muted-foreground px-4 pt-3 pb-1">
                      {group.label}
                    </p>
                    {group.notes.map((note, i) => {
                      const isSelected = note.id === selectedId;
                      const isDiscarding = discardingIds.includes(note.id);
                      // Whether *this row* runs the collapse, as opposed to
                      // being carried out by its group's. Running both at once
                      // nests one `1fr → 0fr` inside another, and the outer
                      // track's `1fr` resolves against content that is itself
                      // shrinking — the height becomes the product of two
                      // falling curves, so it slams shut early and then sits
                      // there. One collapse at a time keeps the motion a single
                      // clean interpolation. Kept separate from `isDiscarding`
                      // because the row still has to go inert either way.
                      const collapseRow = isDiscarding && !groupExiting;
                      // Expand in on mount, using the same one-collapse-at-a-
                      // time rule as the exit: if the group is already
                      // animating open, the row inside it must not, or the two
                      // `fr` interpolations nest and compound.
                      const expandRow =
                        note.id.startsWith(LOCAL_ID_PREFIX) && !groupEntering;
                      // The rule the reference screenshot follows: rows are separated
                      // by a hairline, but the selected row is a floating pill — a
                      // divider touching either of its rounded edges reads as a seam,
                      // so the row before it drops its divider too. Last row in a
                      // group never draws one; the next group header is the break.
                      // A row on its way out drops its divider as well, so the line
                      // doesn't hang in the gap while the row collapses under it.
                      const next = group.notes[i + 1];
                      const showDivider =
                        !isSelected &&
                        !isDiscarding &&
                        next !== undefined &&
                        next.id !== selectedId &&
                        !discardingIds.includes(next.id);
                      return (
                        // Collapse via `grid-template-rows: 1fr → 0fr`, which starts
                        // from the row's *real* height. The earlier `max-height`
                        // version had to guess a start value (96px vs a ~54px row),
                        // so the first ~40% of the transition moved nothing and the
                        // rest snapped — and its `py-2 → py-0` slid the text up while
                        // the box was still frozen. Two motions fighting, i.e. the
                        // jitter. Here padding never animates: the wrapper clips.
                        <div
                          key={note.id}
                          style={{ transitionDuration: `${DISCARD_EXIT_MS}ms` }}
                          className={`grid transition-[grid-template-rows] ease-out ${
                            collapseRow ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                          } ${expandRow ? "starting:grid-rows-[0fr]" : ""}`}
                        >
                          <div className="overflow-hidden">
                            <div
                              role="button"
                              tabIndex={isDiscarding ? -1 : 0}
                              aria-hidden={isDiscarding || undefined}
                              onClick={() => onSelect(note.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") onSelect(note.id);
                              }}
                              style={{
                                transitionDuration: `${DISCARD_EXIT_MS}ms`,
                              }}
                              className={`relative flex items-start mx-2 px-2.5 py-2 rounded-lg transition-[opacity,background-color] ease-out ${
                                isDiscarding
                                  ? "opacity-0 pointer-events-none"
                                  : "cursor-pointer"
                              } ${
                                expandRow || groupEntering
                                  ? "starting:opacity-0"
                                  : ""
                              } ${
                                isSelected
                                  ? SELECTED_ROW
                                  : "hover:bg-[var(--bg-default-secondary)]"
                              } ${
                                showDivider
                                  ? "after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:bg-border/60"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p
                                    className={`type-body-2 font-semibold truncate flex-1 text-foreground ${
                                      isSelected ? SELECTED_TITLE : ""
                                    }`}
                                  >
                                    {note.title || "New Note"}
                                  </p>
                                  {/* What's attached to the note, at a glance.
                                      Pinned right on the title line — the title
                                      truncates, these never do.

                                      Faces rather than a person glyph, so the
                                      row says *who* and not just "someone".
                                      `small` (16px) and three slots, because
                                      this shares a 280px row with the title;
                                      the detail pane runs the same component
                                      wider. The stack keeps its own colours —
                                      only the bell takes the white-on-accent
                                      override, since the avatars' pale gradient
                                      already reads against the selected fill.

                                      Bell stays one flat tone rather than
                                      colouring by urgency: on the solid-accent
                                      selected row a red or yellow glyph fights
                                      the fill, and the detail pane already
                                      carries that state on its chip. */}
                                  {(note.clientIds.length > 0 || note.reminderAt) && (
                                    <span className="flex shrink-0 items-center gap-1.5">
                                      <ClientAvatarStack
                                        names={note.clientIds.map(
                                          (id) => nameById.get(id) ?? id,
                                        )}
                                        slots={3}
                                        size="small"
                                      />
                                      {note.reminderAt && (
                                        <BellIcon
                                          size={13}
                                          role="img"
                                          aria-label="Has a reminder"
                                          className={`text-muted-foreground ${
                                            isSelected ? SELECTED_SECONDARY : ""
                                          }`}
                                        />
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`type-caption flex items-baseline gap-1.5 text-muted-foreground ${
                                    isSelected ? SELECTED_SECONDARY : ""
                                  }`}
                                >
                                  {/* Stamp holds its width; the snippet is what gives. */}
                                  <span
                                    className={`shrink-0 text-foreground/70 ${
                                      isSelected ? SELECTED_STAMP : ""
                                    }`}
                                  >
                                    {formatListStamp(note.updatedAt)}
                                  </span>
                                  <span className="truncate">
                                    {snippet(note.body)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
