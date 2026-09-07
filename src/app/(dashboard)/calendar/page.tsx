"use client";

import { redirect } from "next/navigation";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { CALENDAR_ENABLED } from "@/lib/feature-flags";
import { CalendarView } from "./CalendarView";

/**
 * Month calendar of every note carrying a reminder — the same data as the
 * Notes hub's "Reminders" filter, laid out by day instead of by list so
 * upcoming ones read at a glance.
 */
export default function CalendarPage() {
  // Out of the current delivery phase — same guard, and the same reasoning, as
  // `/notes` (see `lib/feature-flags`). The page body is a separate component
  // so the guard sits above every hook rather than in front of them.
  if (!CALENDAR_ENABLED) redirect("/client-hub");
  return <CalendarPageInner />;
}

function CalendarPageInner() {
  const clients = useClients();
  const { notes, isLoading } = useNotes();

  if (isLoading) {
    return <p className="type-body-2 text-muted-foreground text-center py-10">Loading calendar…</p>;
  }

  // The dashboard shell hands `/calendar` a flex-column content area sized to
  // the viewport below the top bar (`isFullHeight` in `page-chrome`), matching
  // how `/notes` claims the same space.
  return (
    <div className="flex-1 min-h-0">
      <CalendarView notes={notes} clients={clients} />
    </div>
  );
}
