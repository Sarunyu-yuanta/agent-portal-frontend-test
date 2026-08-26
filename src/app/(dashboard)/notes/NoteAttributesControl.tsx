"use client";

import { Popover } from "@sarunyu/system-one";
import { BellIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { ClientAvatarStack } from "@/components/ui/client-avatar-stack";
import { ClientField, ReminderField } from "./NoteAttributeFields";
import { formatDayOnly } from "./note-format";

/**
 * The pill that reads out a note's client and reminder, and opens the fields for
 * changing them.
 *
 * Shared by the quick-note composer and the detail pane so the two are the same
 * control rather than two that happen to look alike. The `open` state is the
 * caller's: the composer needs to know when this is up so its own Escape
 * handling can defer to it.
 *
 * Nesting this popover inside another one works — Radix guards
 * `onPointerDownOutside` with a flag set from `onPointerDownCapture`, and React's
 * synthetic events propagate through the React tree, portals included. This
 * content is a React child of whatever opened it, so a click in here counts as
 * "inside" that layer and it stays open. `modal` is false by default too, so
 * there are no duelling focus traps.
 */
export function NoteAttributesControl({
  clientIds,
  clients,
  pinnedClientId,
  reminderAt,
  open,
  onOpenChange,
  onClientIdsChange,
  onReminderChange,
}: {
  clientIds: string[];
  clients: { id: string; name: string }[];
  /** A client that can't be removed — see `ClientField`. */
  pinnedClientId?: string | null;
  reminderAt: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientIdsChange: (next: string[]) => void;
  onReminderChange: (next: string | null) => void;
}) {
  const nothingSet = clientIds.length === 0 && !reminderAt;

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      // Up and to the right: this sits in a bottom-left corner in both callers,
      // so downward would run off the bottom of its container.
      side="top"
      align="start"
      content={
        <div className="flex w-64 flex-col gap-3">
          <ClientField
            clientIds={clientIds}
            clients={clients}
            pinnedClientId={pinnedClientId}
            onChange={onClientIdsChange}
          />
          <span className="h-px bg-border" />
          <ReminderField reminderAt={reminderAt} onChange={onReminderChange} />
        </div>
      }
    >
      <button
        type="button"
        // `rounded-full` + a standing grey fill, so it reads as a control sitting
        // there rather than something that only appears on hover.
        className={`flex min-w-0 shrink items-center gap-2 rounded-full bg-[var(--bg-default-secondary)] px-3 py-1.5 type-caption transition-colors cursor-pointer hover:bg-[var(--bg-default-tertiary)] hover:text-foreground ${
          open ? "bg-[var(--bg-default-tertiary)] text-foreground" : "text-muted-foreground"
        }`}
      >
        <SlidersHorizontalIcon size={16} className="shrink-0" />
        {nothingSet ? (
          <span>Client, reminder</span>
        ) : (
          <>
            <ClientAvatarStack
              names={clientIds.map((id) => clients.find((c) => c.id === id)?.name ?? id)}
              slots={3}
              size="small"
            />
            {reminderAt && (
              // The faces say "client" on their own; a bare date doesn't say
              // "reminder", so it gets the bell to name it.
              <span className="flex items-center gap-1 truncate">
                <BellIcon size={14} className="shrink-0" />
                {formatDayOnly(reminderAt)}
              </span>
            )}
          </>
        )}
      </button>
    </Popover>
  );
}
