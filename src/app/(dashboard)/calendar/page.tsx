"use client";

import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { CalendarView } from "./CalendarView";

/**
 * Month calendar of every note carrying a reminder — the same data as the
 * Notes hub's "Reminders" filter, laid out by day instead of by list so
 * upcoming ones read at a glance.
 */
export default function CalendarPage() {
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
