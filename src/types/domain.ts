/**
 * Central domain types for the dashboard — the seam between the UI and the
 * (currently mocked) backend.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * Every type below is what a screen consumes. The canonical shapes are still
 * derived from the mock data in `@/lib/mock-data`; when real endpoints land,
 * point these aliases at the API response types instead and the UI keeps
 * compiling. See `public/openapi.yaml` for the wire contract of the four core
 * resources already specified (clients, nba-actions, pipeline-deals,
 * mini-kanbans).
 */

import type { mockClients, mockClientDetails, mockKYCData } from "@/lib/mock-data";
import type { AssetAllocationSlice, AssetHeroSummary } from "@/components/AssetSummarySection";

/** A wealth-management client row as consumed by the UI. */
export type Client = (typeof mockClients)[number];

/** Per-client detail record (asset summary, allocations, holdings, tasks…). */
export type ClientDetail = (typeof mockClientDetails)[string];

/** KYC compliance record for a client. */
export type KYCRecord = (typeof mockKYCData)[number];

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
