import type { ReactNode } from "react";
import { CoinsIcon, NotePencilIcon } from "@phosphor-icons/react";
import type { DayItemSource } from "./day-items";

/**
 * A circle per source, so a reader can tell "something I wrote" from "something
 * the system noticed" before reading a word of the row.
 *
 * One definition, read by both the day list and the alert detail panel. It
 * started out inline in the list and was copied into the panel, which is exactly
 * how the two drifted apart — the panel stayed green for a release after the
 * list turned orange.
 *
 * More rule-based alerts are coming from the backend; each one costs an entry
 * here plus a case in `day-items`, and neither surface changes.
 */
export const SOURCE_BADGE: Record<
  DayItemSource,
  { icon: ReactNode; tone: string; label: string }
> = {
  note: {
    icon: <NotePencilIcon size={15} />,
    // The light end of the primary ramp the grid pills use, so a row and the
    // pill it corresponds to read as the same thing.
    tone: "bg-[var(--fill-p1-100)] text-[var(--fill-p1-600)]",
    label: "Note",
  },
  dividend: {
    icon: <CoinsIcon size={15} />,
    // Off the primary ramp on purpose. Primary is the user's own material, here
    // and across the grid; an alert the desk didn't write has to be tellable
    // from one at a glance. Matches `ALERT_TONE` in `DayCell`.
    tone: "bg-[var(--fill-orange-100)] text-[var(--fill-orange-600)]",
    label: "Dividend alert",
  },
};

/** Done drops out of the ramp, the way it does everywhere else in the calendar:
 * finished business shouldn't keep a colour that asks to be dealt with. */
export const DONE_BADGE_TONE = "bg-[var(--fill-gray-100)] text-[var(--fill-gray-400)]";
