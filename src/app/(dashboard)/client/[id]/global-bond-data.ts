import globalBondsRaw from "@/data/global-bonds.json";

export type GlobalBondIssuerId =
  | "apple"
  | "microsoft"
  | "meta"
  | "amazon"
  | "coke"
  | "amex"
  | "nvidia"
  | "walmart";

export type YieldFilter = "all" | "lt2" | "2-3" | "3-4" | "gt4";
export type MaturityFilter = "all" | "short" | "long";
export type TickerFilter = "all" | "AAPL" | "MSFT" | "META" | "AMZN";
export type CouponFilter = "all" | "lt2" | "2-3" | "3-4" | "gt4";

export type GlobalBondRow = {
  id: string;
  name: string;
  logo: string;
  ticker?: string;
  isin: string;
  currency: string;
  couponRate: string;
  couponValue?: number;
  price: string;
  yieldPct: string;
  yieldValue: number;
  maturity: string;
  duration: string;
  durationYears: number;
  topPick?: boolean;
};

export type GlobalBondIssuer = {
  id: GlobalBondIssuerId;
  title: string;
  fullName: string;
  description: string;
  logo: string;
  ticker: string;
  currency: string;
  creditRating: string;
  updatedAt: string;
  heroImage?: string;
  bonds: GlobalBondRow[];
  couponRateRange: string;
  maturityRange: string;
  estimatedYield: string;
  sp: string;
  moodys: string;
  fitch: string;
};

export type DetailRecommendedCard = {
  id: GlobalBondIssuerId;
  title: string;
  ticker: string;
  estimatedYield: string;
  maturityRange: string;
  logoSrc: string;
  logoVariant: "meta-infinity" | "image";
};

export const GLOBAL_BOND_LOGOS = globalBondsRaw.logos as Record<GlobalBondIssuerId, string>;

export const GLOBAL_BOND_ISSUERS: Record<GlobalBondIssuerId, GlobalBondIssuer> =
  Object.fromEntries(
    (globalBondsRaw.issuers as GlobalBondIssuer[]).map((issuer) => [issuer.id, issuer]),
  ) as Record<GlobalBondIssuerId, GlobalBondIssuer>;

export const TOP_PICK_ROWS = globalBondsRaw.topPickRows as GlobalBondRow[];
export const RECOMMENDED_ISSUERS = globalBondsRaw.recommendedIssuers as GlobalBondIssuerId[];
export const DETAIL_RECOMMENDED_ISSUERS: GlobalBondIssuerId[] = ["meta", "microsoft", "amazon"];
export const DETAIL_RECOMMENDED_CARDS =
  globalBondsRaw.detailRecommendedCards as DetailRecommendedCard[];

export const ALL_OVERSEAS_BONDS_COUNT = globalBondsRaw.meta.allOverseasBondsCount;
export const ALL_OVERSEAS_BONDS_UPDATED_AT = globalBondsRaw.meta.allOverseasBondsUpdatedAt;
export const ALL_OVERSEAS_BONDS_PAGE_SIZE = globalBondsRaw.meta.allOverseasBondsPageSize;

export const ALL_OVERSEAS_BONDS: GlobalBondRow[] = Array.from(
  { length: ALL_OVERSEAS_BONDS_COUNT },
  (_, i) => {
    const seed = globalBondsRaw.allOverseasBondsSeed[i % globalBondsRaw.allOverseasBondsSeed.length];
    return { ...(seed as GlobalBondRow), id: `aob-${i + 1}` };
  },
);

export function getGlobalBondIssuer(id: string): GlobalBondIssuer | undefined {
  return GLOBAL_BOND_ISSUERS[id as GlobalBondIssuerId];
}

export function resolveGlobalBondIssuer(id: string): GlobalBondIssuer | undefined {
  const direct = getGlobalBondIssuer(id);
  if (direct) return direct;
  const normalized = id.toLowerCase().replace(/\s+/g, "-");
  return getGlobalBondIssuer(normalized);
}

export function filterGlobalBonds(
  bonds: GlobalBondRow[],
  yieldFilter: YieldFilter,
  maturityFilter: MaturityFilter,
): GlobalBondRow[] {
  return bonds.filter((bond) => {
    const yieldMatch =
      yieldFilter === "all" ||
      (yieldFilter === "lt2" && bond.yieldValue < 2) ||
      (yieldFilter === "2-3" && bond.yieldValue >= 2 && bond.yieldValue < 3) ||
      (yieldFilter === "3-4" && bond.yieldValue >= 3 && bond.yieldValue < 4) ||
      (yieldFilter === "gt4" && bond.yieldValue >= 4);

    const maturityMatch =
      maturityFilter === "all" ||
      (maturityFilter === "short" && bond.durationYears <= 3) ||
      (maturityFilter === "long" && bond.durationYears > 3);

    return yieldMatch && maturityMatch;
  });
}

function matchCouponFilter(couponValue: number | undefined, filter: CouponFilter): boolean {
  if (filter === "all" || couponValue === undefined) return filter === "all";
  return (
    (filter === "lt2" && couponValue < 2) ||
    (filter === "2-3" && couponValue >= 2 && couponValue < 3) ||
    (filter === "3-4" && couponValue >= 3 && couponValue < 4) ||
    (filter === "gt4" && couponValue >= 4)
  );
}

export function filterAllOverseasBonds(
  bonds: GlobalBondRow[],
  tickerFilter: TickerFilter,
  couponFilter: CouponFilter,
  yieldFilter: YieldFilter,
  maturityFilter: MaturityFilter,
): GlobalBondRow[] {
  return bonds.filter((bond) => {
    const tickerMatch = tickerFilter === "all" || bond.ticker === tickerFilter;
    const couponMatch = matchCouponFilter(bond.couponValue, couponFilter);
    const yieldMatch =
      yieldFilter === "all" ||
      (yieldFilter === "lt2" && bond.yieldValue < 2) ||
      (yieldFilter === "2-3" && bond.yieldValue >= 2 && bond.yieldValue < 3) ||
      (yieldFilter === "3-4" && bond.yieldValue >= 3 && bond.yieldValue < 4) ||
      (yieldFilter === "gt4" && bond.yieldValue >= 4);
    const maturityMatch =
      maturityFilter === "all" ||
      (maturityFilter === "short" && bond.durationYears <= 3) ||
      (maturityFilter === "long" && bond.durationYears > 3);
    return tickerMatch && couponMatch && yieldMatch && maturityMatch;
  });
}
