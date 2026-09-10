# Phase scope — what's in this handover, and what's switched off

The portal was built ahead of the delivery plan, so four finished features sit
outside the phase being handed to the dev team. They are **switched off, not
deleted** — every file is still in the repo, still compiles, and still type-checks.

The switches live in one place: [`src/lib/feature-flags.ts`](../src/lib/feature-flags.ts).

| Flag                | Feature   | State |
| ------------------- | --------- | ----- |
| `NOTES_ENABLED`     | Notes     | `false` |
| `CALENDAR_ENABLED`  | Calendar  | `false` |
| `REMINDERS_ENABLED` | Reminders | `false` |
| `CALL_LOG_ENABLED`  | Call log  | `false` |

## What each flag hides

**`NOTES_ENABLED`**

- `/notes` — the Notes hub. The route still exists and redirects to `/client-hub`,
  so a bookmarked or pasted link lands somewhere real.
- The floating "New note" button, bottom-right on desktop
  ([`layout.tsx`](<../src/app/(dashboard)/layout.tsx>)).
- Client 360 → Full Profile → the **Notes** tab, and `?tab=notes` as an
  addressable URL ([`client/[id]/page.tsx`](<../src/app/(dashboard)/client/[id]/page.tsx>)).
- The **Notes** shortcut tile and its dialog in the Client 360 side panel
  ([`ClientDetailPanel.tsx`](<../src/app/(dashboard)/client-hub/ClientDetailPanel.tsx>)).

**`CALENDAR_ENABLED`**

- `/calendar` — the month view. Same redirect treatment as `/notes`.

**`REMINDERS_ENABLED`**

- The notification bell in the top bar, and the modals a bell row opens
  ([`layout.tsx`](<../src/app/(dashboard)/layout.tsx>)). The bell holds nothing
  but reminders, so it goes rather than sitting permanently empty.
- Client 360 → Full Profile → the **Reminders** tab, and `?tab=reminders`.
- The **Reminders** card on that profile's Overview tab
  ([`OverviewTab.tsx`](<../src/app/(dashboard)/client/[id]/OverviewTab.tsx>)).
- The **Reminder** shortcut tile and its dialog in the Client 360 side panel.

**`CALL_LOG_ENABLED`**

- Client 360 → Full Profile → the **Call Log** tab, and `?tab=call-log`.
- The **Call log** shortcut tile and its dialog in the Client 360 side panel.

Not gated: the **Last Contact** line in a profile's identity bar. It reads as a
property of the client rather than a view of the call history — the client list
has carried its own `lastContact` field for the same fact all along — so it
survives the cut, even though the mock data happens to derive it from the call
log (`lastContactFromCallLogs` in
[`client-detail-data.ts`](<../src/app/(dashboard)/client/[id]/client-detail-data.ts>)).
Gate it too if the phase-1 backend won't be serving that number.

## Knock-on effects worth knowing

Two places had to change shape rather than just lose a branch, because they were
written around a fixed number of things:

- **The Full Profile tab list** now lives in
  [`client-tabs.ts`](<../src/app/(dashboard)/client/[id]/client-tabs.ts>) instead
  of inside `page.tsx`. Three readers share it — the tab strip, the `?tab=`
  validator, and the loading skeleton — so a gated tab leaves all three at once
  and the skeleton can't draw a bar for a tab that never arrives. With the
  current flags it renders **Overview / KYC / Assets**.
- **The side panel's shortcut row** is built from a list with a column count
  that follows its length, and stops rendering at zero. All three of its tiles
  are gated right now, so the row is gone — leaving it in place would have spent
  a `gap-4` between the client's name and "View Full Profile".

## What is deliberately left alone

- **The `notes` seam** — `contexts/notes-context.tsx` and the `Note` types.
  `NotesProvider` still mounts, because surfaces that survived the cut read from
  it. Nothing is visible, so nothing needs unwiring. (`lib/notes-api.ts` and the
  `/api/mock/notes` route it called are gone — notes are React state now.)
- **`data/call-log-data.ts` and `CallLogTable`** — same reasoning. The table is
  still imported by `page.tsx` for a tab branch that can no longer be reached,
  which is what keeps it compiling against the rest of the page.
- **"Last Contact"** — out of scope for this phase, so the line is not rendered
  in the profile identity bar (the KYC countdown sits there instead). Two pieces
  survive it and have **no callers at all**, which makes them look like dead
  code to any automated sweep: the `lastContact` field in `data/clients.json`,
  and `lastContactFromCallLogs()` in `client/[id]/client-detail-data.ts`.
  Keep both. `lastContact` also stays a display string (`"2 days ago"`,
  `"Today"`) rather than a timestamp like the other client fields — nothing
  reads it, so converting it now would be unverifiable, and fixed dates would
  quietly rot into "8 months ago" before the phase that shows them lands.
- **Route metadata** for `/notes` and `/calendar` — `page-chrome.ts`,
  `page-breadcrumbs.ts`, `lib/nav-memory.ts`. These describe routes that now
  redirect, so they have no effect; leaving them means re-enabling is one
  boolean rather than an archaeology exercise.
- **The `comingSoon` flag** on the side panel's shortcut tiles. That's a
  different mechanism from a phase gate: `comingSoon` shows a disabled tile with
  a badge, for a feature the user is *meant* to know is on the way. A phase-gated
  feature isn't advertised at all.

## Turning a feature back on

Flip the flag in `src/lib/feature-flags.ts`. Nothing else to wire up.

`CALL_LOG_ENABLED` stands on its own — it depends on nothing and nothing depends
on it. The other three are one body of work and are best brought back together:
a reminder *is* a date attached to a note, and the Calendar is those reminders
laid out by day, so the partial combinations aren't shapes the design accounts
for. The flag file spells out the dependencies.
