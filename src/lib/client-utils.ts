import type { AssetHeroSummary } from "@/components/AssetSummarySection";

export const LINE_AVAILABLE_RATIO = 320_000 / 9_400_000;
export const LIABILITIES_MULTIPLIER = 0.0197;

export type ClientSummaryInput = {
  aum: string;
  cashIdlePct: number;
  plYtd: string;
  plPositive: boolean;
};

export function parseAumToThb(aum: string): number {
  const match = aum.match(/([\d.]+)/);
  if (!match) return 0;
  return parseFloat(match[1]) * 1_000_000;
}

export function parsePlYtdPct(plYtd: string): number {
  const match = plYtd.match(/([+-]?[\d.]+)/);
  return match ? Math.abs(parseFloat(match[1])) : 0;
}

export function formatThbAmount(amount: number, withSign = false): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!withSign) return formatted;
  return `${amount >= 0 ? "+" : "-"}${formatted}`;
}

export function formatThaiUpdatedAt(now: Date): { date: string; time: string } {
  return {
    date: now.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: now.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

export function buildHeroSummaryFromClient(client: ClientSummaryInput): AssetHeroSummary {
  const updatedAt = formatThaiUpdatedAt(new Date());
  const aumThb = parseAumToThb(client.aum);
  const cash = aumThb * (client.cashIdlePct / 100);
  const lineAvailable = aumThb * LINE_AVAILABLE_RATIO;
  const pct = parsePlYtdPct(client.plYtd);
  const sign = client.plPositive ? 1 : -1;
  const plChange = aumThb * (pct / 100) * sign;
  const changePercent = aumThb > 0 ? (plChange / aumThb) * 100 : 0;

  return {
    netValue: formatThbAmount(aumThb),
    changeAmount: formatThbAmount(plChange, true),
    changePercent: Math.abs(changePercent).toFixed(2),
    changePositive: plChange >= 0,
    lineAvailable: formatThbAmount(lineAvailable),
    cash: formatThbAmount(cash),
    lastUpdatedDate: updatedAt.date,
    lastUpdatedTime: updatedAt.time,
  };
}

export function formatLiabilitiesStr(aum: string): string {
  const aumThb = parseAumToThb(aum);
  return formatThbAmount(aumThb * LIABILITIES_MULTIPLIER);
}

export function parseAmount(value: string): number {
  return parseFloat(value.replace(/,/g, "")) || 0;
}

/**
 * Initials for an avatar: first + last word initial, or the first two
 * characters for a single-word name. Purely presentational — safe to compute
 * from either a real or a masked name.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Initials from the first two words, e.g. "Somchai Rattanakul" → "SR".
 * Differs from {@link getInitials} on 3+ word and masked single-token names
 * (here "S*****" → "S"); kept as a distinct helper to preserve existing output.
 */
export function getInitialsFromWords(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/** Compact THB in millions, e.g. 12_300_000 → "฿ 12M". */
export function formatMillionThb(thb: number): string {
  const m = thb / 1_000_000;
  return `฿ ${m.toLocaleString("en-US", { maximumFractionDigits: 0 })}M`;
}
