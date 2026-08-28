/**
 * Stand-in for the rule-based alerts the backend will raise.
 *
 * The Calendar is meant to show more than the user's own reminders — a
 * dividend the desk has to tell holders about, a maturity, a KYC review coming
 * due. None of that exists server-side yet, so this file fakes the one case
 * that makes the shape concrete: shares going ex-dividend, and which clients
 * hold them.
 *
 * Kept in one file with an obvious name so replacing it is a deletion. When the
 * real endpoint lands, `groupDayItems` swaps `dividendAlerts(today)` for the
 * fetched list and nothing else in the Calendar changes — the adapter into
 * `DayItem` is already the seam.
 */

export type CalendarAlert = {
  id: string;
  /** The day it belongs on. */
  date: Date;
  title: string;
  detail: string;
  /** Real ids from `src/data/clients.json`, so the avatars resolve to real names. */
  clientIds: string[];
};

/**
 * Three dividend events in the month `today` falls in, on fixed days of that
 * month.
 *
 * Anchored to the caller's `today` rather than to hard-coded dates so the
 * mockup still has something to show whenever it is opened, and derived
 * purely from it so two renders in the same session agree — a `new Date()` in
 * here would differ between the server pass and the client one and warn about
 * a hydration mismatch.
 */
export function dividendAlerts(today: Date): CalendarAlert[] {
  const y = today.getFullYear();
  const m = today.getMonth();
  const on = (dayOfMonth: number) => new Date(y, m, dayOfMonth);

  return [
    {
      id: "xd-ptt",
      date: on(12),
      title: "PTT — ex-dividend",
      detail: "THB 2.50 per share · notify holders",
      clientIds: ["110001", "110003", "110006"],
    },
    {
      id: "pay-advanc",
      date: on(20),
      title: "ADVANC — dividend paid",
      detail: "THB 4.75 per share",
      clientIds: ["110002", "110005"],
    },
    {
      id: "xd-scb",
      date: on(26),
      title: "SCB — ex-dividend",
      detail: "THB 3.00 per share · notify holders",
      clientIds: ["110001", "110004"],
    },
  ];
}
