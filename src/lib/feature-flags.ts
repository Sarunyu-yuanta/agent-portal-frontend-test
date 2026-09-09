/**
 * Phase gates — which features are in the build the dev team picks up.
 *
 * The portal was built ahead of the delivery plan, so a few finished features
 * belong to a later phase than the one being handed over. Rather than deleting
 * them (and re-typing them later), each is switched off here and every entry
 * point into it is gated on the flag. The code stays where it is, compiles, and
 * comes back by flipping one boolean.
 *
 * ## Currently out of phase
 *
 * - **Notes** — the `/notes` hub, the floating composer, Client 360's Notes tab
 *   and the Notes dialog in the client-hub side panel.
 * - **Calendar** — the `/calendar` month view.
 * - **Reminders** — the bell's reminder rows, Client 360's Reminders tab and
 *   its Overview card, and the Reminders dialog in the client-hub side panel.
 *   The bell itself is no longer gated on this — see `KYC_ALERTS_ENABLED`.
 * - **Call log** — Client 360's Call Log tab and the Call log dialog in the
 *   client-hub side panel.
 *
 * ## Turning one back on
 *
 * Flip the flag to `true`. Everything gated on it renders again — nothing else
 * to wire up. Two dependencies to respect if they are enabled separately:
 *
 * - A reminder **is** a date attached to a note, so `REMINDERS_ENABLED` without
 *   `NOTES_ENABLED` leaves the reminder surfaces read-only: they still show
 *   system-raised items (dividend ex-dates), but there is no way to author one.
 * - The Calendar is a by-day view of those same reminders, so
 *   `CALENDAR_ENABLED` without `REMINDERS_ENABLED` is not a combination the
 *   design accounts for.
 *
 * The safe move is to bring all three back together, the way they were built.
 *
 * Plain module constants rather than env vars on purpose: a phase boundary is a
 * property of the build, not of the environment it is deployed to, and a
 * constant means whoever greps for the flag finds every gate on it.
 *
 * Each is annotated `: boolean` rather than left to infer `false`. Without it
 * TypeScript narrows the type to the literal `false` and treats the enabled
 * branch of every gate as dead — `flag ? [item] : []` collapses to `never[]`,
 * which breaks the moment a gated value has to satisfy a real type. The
 * annotation keeps both branches type-checked, so flipping a flag can't turn
 * out to have been hiding a compile error all along.
 */

/** `/notes`, the floating note composer, and every per-client Notes surface. */
export const NOTES_ENABLED: boolean = false;

/** The `/calendar` month view. */
export const CALENDAR_ENABLED: boolean = false;

/** Every reminder list, card, and dialog, and the bell's reminder rows. */
export const REMINDERS_ENABLED: boolean = false;

/**
 * KYC expiry alerts in the header bell.
 *
 * Deliberately its own flag rather than part of `REMINDERS_ENABLED`: a KYC
 * expiry isn't a reminder anyone wrote, it's derived from the client's own KYC
 * record, so it stands on data that is already in phase. This is what puts the
 * bell in the header while Reminders is still switched off — the two feeds are
 * merged, so turning Reminders back on adds its rows alongside these rather
 * than replacing them.
 */
export const KYC_ALERTS_ENABLED: boolean = true;

/**
 * Client 360's Call Log tab and the Call log dialog in its side panel.
 *
 * Not the "Last Contact" line in a profile's identity bar. That reads as a
 * property of the client rather than a view of the call history — the client
 * list has always carried its own `lastContact` field for the same fact — and
 * it survives the cut for that reason, even though the mock data happens to
 * derive it from the call log (see `lastContactFromCallLogs`).
 */
export const CALL_LOG_ENABLED: boolean = false;
