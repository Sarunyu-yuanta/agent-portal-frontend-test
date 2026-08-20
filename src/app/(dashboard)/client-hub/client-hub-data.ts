/**
 * Client Hub domain layer — pure derivations over the client list.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * Everything here is computed on the client TODAY from the mock data. Each
 * function's doc notes which API field should supply the value once a real
 * backend exists, so this file doubles as the spec for what the Client Hub
 * endpoints must return. Two ratios below are placeholders with no real source:
 *   • LINE_AVAILABLE_RATIO  (see @/lib/client-utils) — margin line available
 *   • LIABILITIES_MULTIPLIER (see @/lib/client-utils) — total liabilities
 * Replace both with real per-client figures from the backend.
 */

import { mockClientDetails, mockKYCData } from "@/lib/mock-data";
import { ALLOCATION_SLICES } from "@/components/AssetSummarySection";
import {
  LINE_AVAILABLE_RATIO,
  LIABILITIES_MULTIPLIER,
  parseAumToThb,
  parsePlYtdPct,
  formatThbAmount,
  formatThaiUpdatedAt,
  displayAssetLabel,
} from "@/lib/client-utils";
import { getNineBoxCell } from "./NineBoxTab";
import type { ProductSortKey, SortKey } from "./types";
import type {
  Client,
  ProductRow,
  ProductHolder,
  AssetHeroSummary,
} from "@/types/domain";

/** Allocation slices for a client, falling back to the default mix. */
function slicesFor(client: Client) {
  const detail = mockClientDetails[client.id];
  return detail?.assetSummary?.allocationSlices?.length
    ? detail.assetSummary.allocationSlices
    : ALLOCATION_SLICES;
}

/**
 * THB a client holds in one asset class = AUM × (slice percent / 100).
 * Backend: expose per-client, per-asset-class amounts directly so the UI does
 * not have to re-derive them from percentages.
 */
export function getClientSliceAmount(client: Client, label: string): number {
  const pct = slicesFor(client).find((s) => s.label === label)?.percent ?? 0;
  return parseAumToThb(client.aum) * (pct / 100);
}

/** Sortable value for a client column. Strings sort lexically, numbers numerically. */
export function getSortValue(client: Client, key: SortKey): number | string {
  switch (key) {
    case "id": return client.id;
    case "name": return client.name;
    case "aum": return parseAumToThb(client.aum);
    case "thaiStock": return getClientSliceAmount(client, "หุ้นไทย");
    case "foreignStock": return getClientSliceAmount(client, "หุ้นต่างประเทศ");
    case "derivatives": return getClientSliceAmount(client, "อนุพันธ์");
    case "mutualFund": return getClientSliceAmount(client, "กองทุนรวม");
    case "bond": return getClientSliceAmount(client, "ตราสารหนี้");
    case "foreignBond": return getClientSliceAmount(client, "ตราสารหนี้ต่างประเทศ");
    case "structuredBond": return getClientSliceAmount(client, "หุ้นกู้ที่มีอนุพันธ์แฝง");
    case "plYtd": { const m = client.plYtd.match(/([+-]?[\d.]+)/); return m ? parseFloat(m[1]) : 0; }
    case "liabilities": return parseAumToThb(client.aum) * LIABILITIES_MULTIPLIER;
    case "cashIdle": return parseAumToThb(client.aum) * (client.cashIdlePct / 100);
    case "nineBox": return getNineBoxCell(client).heat;
    default: return 0;
  }
}

/**
 * Sort value for a product row — the Product tab's counterpart to
 * {@link getSortValue}. `label` sorts on the text actually shown, so the order
 * matches what the user reads rather than the raw slice key behind it.
 */
export function getProductSortValue(
  row: ProductRow,
  key: Exclude<ProductSortKey, "rowIndex" | null>,
): number | string {
  switch (key) {
    case "label": return displayAssetLabel(row.label);
    case "clientCount": return row.clientCount;
    case "totalAmountThb": return row.totalAmountThb;
    case "avgAllocationPct": return row.avgAllocationPct;
    default: return 0;
  }
}

/**
 * Aggregate every client's allocation slices into per-product rows, sorted by
 * total AUM. Backend: this whole aggregation ("holdings by product") is a good
 * candidate for a dedicated endpoint.
 */
export function buildProductRows(clients: Client[]): ProductRow[] {
  const map = new Map<string, { statusIcon: string; holders: ProductHolder[] }>();
  for (const client of clients) {
    const aumThb = parseAumToThb(client.aum);
    for (const slice of slicesFor(client)) {
      if (slice.percent <= 0) continue;
      if (!map.has(slice.label)) map.set(slice.label, { statusIcon: slice.statusIcon, holders: [] });
      map.get(slice.label)!.holders.push({
        clientId: client.id,
        clientName: client.name,
        tier: client.tier,
        allocationPct: slice.percent,
        amountThb: aumThb * (slice.percent / 100),
      });
    }
  }
  return Array.from(map.entries())
    .map(([label, { statusIcon, holders }]) => ({
      label,
      statusIcon,
      clientCount: holders.length,
      totalAmountThb: holders.reduce((s, h) => s + h.amountThb, 0),
      avgAllocationPct: holders.reduce((s, h) => s + h.allocationPct, 0) / holders.length,
      holders: [...holders].sort((a, b) => b.amountThb - a.amountThb),
    }))
    .sort((a, b) => b.totalAmountThb - a.totalAmountThb);
}

/**
 * Hero summary (net value / P&L / cash / line) aggregated over a set of clients.
 * Backend: these totals should be returned pre-computed for the current page.
 */
export function buildHeroSummaryFromClients(clients: Client[]): AssetHeroSummary {
  const updatedAt = formatThaiUpdatedAt(new Date());

  if (clients.length === 0) {
    return {
      netValue: "0.00",
      changeAmount: "+0.00",
      changePercent: "0.00",
      changePositive: true,
      lineAvailable: "0.00",
      cash: "0.00",
      lastUpdatedDate: updatedAt.date,
      lastUpdatedTime: updatedAt.time,
    };
  }

  let netValue = 0;
  let cash = 0;
  let lineAvailable = 0;
  let plChange = 0;

  for (const client of clients) {
    const aumThb = parseAumToThb(client.aum);
    netValue += aumThb;
    cash += aumThb * (client.cashIdlePct / 100);
    lineAvailable += aumThb * LINE_AVAILABLE_RATIO;

    const pct = parsePlYtdPct(client.plYtd);
    const sign = client.plPositive ? 1 : -1;
    plChange += aumThb * (pct / 100) * sign;
  }

  const changePercent = netValue > 0 ? (plChange / netValue) * 100 : 0;

  return {
    netValue: formatThbAmount(netValue),
    changeAmount: formatThbAmount(plChange, true),
    changePercent: Math.abs(changePercent).toFixed(2),
    changePositive: plChange >= 0,
    lineAvailable: formatThbAmount(lineAvailable),
    cash: formatThbAmount(cash),
    lastUpdatedDate: updatedAt.date,
    lastUpdatedTime: updatedAt.time,
  };
}

/** Total AUM and idle cash across a set of clients. */
export function getClientTotals(clients: Client[]): { totalAum: number; totalCash: number } {
  let totalAum = 0;
  let totalCash = 0;
  for (const c of clients) {
    const aum = parseAumToThb(c.aum);
    totalAum += aum;
    totalCash += aum * (c.cashIdlePct / 100);
  }
  return { totalAum, totalCash };
}

/** Client count per segment/tier, most populous first. */
export function getSegmentBreakdown(clients: Client[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const c of clients) counts.set(c.tier, (counts.get(c.tier) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Clients whose KYC expires within 30 days, enriched and sorted by urgency. */
export function getKycDueClients(clients: Client[]) {
  return mockKYCData
    .filter((k) => k.daysUntilExpiry < 30)
    .flatMap((k) => {
      const client = clients.find((c) => c.id === k.clientId);
      return client ? [{ ...k, client }] : [];
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

/** Clients sorted by AUM, largest first. */
export function getTopClientsByAum(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => parseAumToThb(b.aum) - parseAumToThb(a.aum));
}
