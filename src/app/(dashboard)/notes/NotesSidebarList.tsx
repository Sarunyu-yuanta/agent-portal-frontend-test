"use client";

import { useMemo, useState } from "react";
import { SearchInput, TabGroup } from "@sarunyu/system-one";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Note } from "@/types/domain";
import { groupNotesByDate, snippet } from "./notes-grouping";

type Filter = "all" | "reminders";

export function NotesSidebarList({
  notes,
  selectedId,
  onSelect,
  onAdd,
  onDeleteRequest,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDeleteRequest: (note: Note) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let result = notes;
    if (filter === "reminders") result = result.filter((n) => n.reminderAt && !n.reminderDone);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (n) => (n.title ?? "").toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
      );
    }
    return result;
  }, [notes, filter, search]);

  const groups = useMemo(() => groupNotesByDate(filtered), [filtered]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 p-3 shrink-0">
        <SearchInput
          placeholder="Search"
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          size="sm"
          className="flex-1"
        />
        <button
          type="button"
          onClick={onAdd}
          aria-label="New note"
          className="flex items-center justify-center size-8 rounded-full bg-primary-action text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <PlusIcon size={16} weight="bold" />
        </button>
      </div>

      <div className="px-3 pb-2 shrink-0">
        <TabGroup
          items={[
            { id: "all", title: "All" },
            { id: "reminders", title: "Reminders" },
          ]}
          activeId={filter}
          onChange={(id) => setFilter(id as Filter)}
          size="sm"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="type-body-2 text-muted-foreground text-center py-10">No Notes</p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="flex flex-col">
              <p className="type-caption font-semibold text-muted-foreground px-3 pt-3 pb-1">
                {group.label}
              </p>
              {group.notes.map((note) => {
                const isSelected = note.id === selectedId;
                return (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(note.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSelect(note.id);
                    }}
                    className={`group flex items-start justify-between gap-2 px-3 py-2.5 cursor-pointer border-b border-border/60 ${
                      isSelected
                        ? "bg-[var(--bg-default-secondary)]"
                        : "hover:bg-[var(--bg-default-secondary)]/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="type-body-2 font-semibold text-foreground truncate">
                        {note.title || "New Note"}
                      </p>
                      <p className="type-caption text-muted-foreground truncate">
                        {new Date(note.updatedAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {"  "}
                        {snippet(note.body)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(note);
                      }}
                      aria-label="Delete note"
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center size-6 rounded-md hover:bg-[var(--bg-default-secondary)] transition-opacity text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
