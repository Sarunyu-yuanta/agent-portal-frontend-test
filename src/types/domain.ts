/**
 * Central domain types for the dashboard — the seam between the UI and the
 * (currently mocked) backend.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * Every type below is what a screen consumes, and each is derived from the JSON
 * in `src/data` via `@/lib/mock-data` — that JSON is the only source of data in
 * the app. When real endpoints land, point these aliases at the API response
 * types instead and the UI keeps compiling.
 *
 * There is no separate wire contract to reconcile against: the shapes here
 * *are* the contract. `docs/mock-data-inventory.md` catalogues every dataset
 * and is the reference for designing those endpoints.
 */

import type { mockClients, mockClientDetails } from "@/lib/mock-data";
import type { AssetAllocationSlice, AssetHeroSummary } from "@/components/AssetSummarySection";

/** A wealth-management client row as consumed by the UI. */
export type Client = (typeof mockClients)[number];

/** Per-client detail record (asset summary, allocations, holdings, tasks…). */
export type ClientDetail = (typeof mockClientDetails)[string];

/** One asset-class slice of a portfolio ({ label, percent, statusIcon }). */
export type { AssetAllocationSlice, AssetHeroSummary };

/** A single client's stake in one product (aggregated in the Product view). */
export type ProductHolder = {
  clientId: string;
  clientName: string;
  tier: string;
  allocationPct: number;
  amountThb: number;
};

/** One product row: an asset class aggregated across all holders. */
export type ProductRow = {
  label: string;
  statusIcon: string;
  clientCount: number;
  totalAmountThb: number;
  avgAllocationPct: number;
  holders: ProductHolder[];
};

/** A note an IC/RM writes — about any number of clients, or none (a general note). */
export type Note = {
  id: string;
  /**
   * Client ids this note is filed under. Empty means a general note.
   *
   * A list rather than a single nullable id: one conversation often covers
   * several clients, and duplicating the note per client would mean editing it
   * in several places.
   */
  clientIds: string[];
  title: string | null;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  reminderAt: string | null;
  reminderDone: boolean;
};
