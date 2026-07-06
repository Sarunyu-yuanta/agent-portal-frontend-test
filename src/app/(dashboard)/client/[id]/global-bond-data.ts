export const GLOBAL_BOND_LOGOS = {
  apple: "https://www.figma.com/api/mcp/asset/1c662d40-3f83-48b7-9616-360251500a2e",
  microsoft: "https://www.figma.com/api/mcp/asset/1d843e2c-a5ac-4536-b5f2-783583ada653",
  meta: "https://www.figma.com/api/mcp/asset/8f038722-f9d3-4ba0-954e-d633eb600783",
  amazon: "https://www.figma.com/api/mcp/asset/4684f79e-a3af-4fee-8669-1346abbb3259",
  coke: "https://www.figma.com/api/mcp/asset/32a12a51-e30c-47c0-abeb-875c96b76824",
  amex: "https://www.figma.com/api/mcp/asset/306606b4-150e-4e6c-b9b0-5807dd657934",
  nvidia: "https://www.figma.com/api/mcp/asset/4103f123-bedc-4e97-bbf5-043e1ebb97f5",
  walmart: "https://www.figma.com/api/mcp/asset/a9b69a79-0e8e-435e-baf0-badedfcd5408",
} as const;

export type GlobalBondIssuerId = keyof typeof GLOBAL_BOND_LOGOS;

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

const APPLE_BONDS: GlobalBondRow[] = [
  { id: "a1", name: "Apple Inc 1.37% 2026", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833CF61", currency: "USD", couponRate: "1.375%", price: "98.45", yieldPct: "2.05%", yieldValue: 2.05, maturity: "05/05/2026", duration: "1.7", durationYears: 1.7, topPick: true },
  { id: "a2", name: "Apple Inc 1.65% 2027", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833DG77", currency: "USD", couponRate: "1.65%", price: "96.20", yieldPct: "2.40%", yieldValue: 2.4, maturity: "15/08/2027", duration: "2.6", durationYears: 2.6 },
  { id: "a3", name: "Apple Inc 3.05% 2032", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833DU16", currency: "USD", couponRate: "3.05%", price: "93.60", yieldPct: "3.45%", yieldValue: 3.45, maturity: "05/06/2032", duration: "6.1", durationYears: 6.1, topPick: true },
  { id: "a4", name: "Apple Inc 4.45% 2035", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833DV98", currency: "USD", couponRate: "4.45%", price: "101.20", yieldPct: "4.35%", yieldValue: 4.35, maturity: "01/02/2035", duration: "8.7", durationYears: 8.7 },
  { id: "a5", name: "Apple Inc 4.65% 2041", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833DW70", currency: "USD", couponRate: "4.65%", price: "99.10", yieldPct: "4.70%", yieldValue: 4.7, maturity: "15/12/2041", duration: "12.5", durationYears: 12.5 },
];

export const GLOBAL_BOND_ISSUERS: Record<GlobalBondIssuerId, GlobalBondIssuer> = {
  apple: {
    id: "apple",
    title: "Apple Overseas Bonds",
    fullName: "Apple Overseas Bonds",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Apple",
    logo: GLOBAL_BOND_LOGOS.apple,
    ticker: "AAPL",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AA+ | Moody's = Aaa | Fitch = AAA",
    updatedAt: "10 September 2025 - 09.00",
    heroImage: "/global-bond-apple-hero.png",
    bonds: APPLE_BONDS,
    couponRateRange: "1.4–4.7%",
    maturityRange: "2026–2041",
    estimatedYield: "2.0–4.7%",
    sp: "AA+",
    moodys: "Aaa",
    fitch: "AAA",
  },
  microsoft: {
    id: "microsoft",
    title: "Microsoft Corp.",
    fullName: "Microsoft Corp.",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Microsoft",
    logo: GLOBAL_BOND_LOGOS.microsoft,
    ticker: "MSFT",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AAA | Moody's = Aaa | Fitch = AA+",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "m1", name: "Microsoft Corp 2.1% 2026", logo: GLOBAL_BOND_LOGOS.microsoft, isin: "US594918CB67", currency: "USD", couponRate: "2.1%", price: "99.10", yieldPct: "2.25%", yieldValue: 2.25, maturity: "01/06/2026", duration: "1.2", durationYears: 1.2, topPick: true },
      { id: "m2", name: "Microsoft Corp 3.5% 2030", logo: GLOBAL_BOND_LOGOS.microsoft, isin: "US594918CC50", currency: "USD", couponRate: "3.5%", price: "97.80", yieldPct: "3.70%", yieldValue: 3.7, maturity: "15/03/2030", duration: "4.5", durationYears: 4.5 },
      { id: "m3", name: "Microsoft Corp 4.2% 2035", logo: GLOBAL_BOND_LOGOS.microsoft, isin: "US594918CD34", currency: "USD", couponRate: "4.2%", price: "100.50", yieldPct: "4.15%", yieldValue: 4.15, maturity: "10/11/2035", duration: "8.2", durationYears: 8.2 },
    ],
    couponRateRange: "2.1–5.4%",
    maturityRange: "2026–2035",
    estimatedYield: "2.5–4.8%",
    sp: "AAA",
    moodys: "Aaa",
    fitch: "AA+",
  },
  meta: {
    id: "meta",
    title: "Meta Platforms",
    fullName: "Meta Platforms Inc.",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Meta",
    logo: GLOBAL_BOND_LOGOS.meta,
    ticker: "META",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AA+ | Moody's = A2 | Fitch = AA-",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "me1", name: "Meta Platforms 2.2% 2027", logo: GLOBAL_BOND_LOGOS.meta, isin: "US30303M1027", currency: "USD", couponRate: "2.2%", price: "98.00", yieldPct: "2.80%", yieldValue: 2.8, maturity: "15/08/2027", duration: "2.1", durationYears: 2.1, topPick: true },
      { id: "me2", name: "Meta Platforms 3.8% 2032", logo: GLOBAL_BOND_LOGOS.meta, isin: "US30303M1035", currency: "USD", couponRate: "3.8%", price: "96.50", yieldPct: "4.00%", yieldValue: 4.0, maturity: "01/04/2032", duration: "6.0", durationYears: 6.0 },
    ],
    couponRateRange: "2.2–4.3%",
    maturityRange: "2027–2034",
    estimatedYield: "2.8–4.0%",
    sp: "AA+",
    moodys: "A2",
    fitch: "AA-",
  },
  amazon: {
    id: "amazon",
    title: "Amazon.com Inc.",
    fullName: "Amazon.com Inc.",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Amazon",
    logo: GLOBAL_BOND_LOGOS.amazon,
    ticker: "AMZN",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AA | Moody's = A1 | Fitch = AA-",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "am1", name: "Amazon.com 3.5% 2028", logo: GLOBAL_BOND_LOGOS.amazon, isin: "US0231351067", currency: "USD", couponRate: "3.5%", price: "97.20", yieldPct: "3.80%", yieldValue: 3.8, maturity: "20/05/2028", duration: "3.2", durationYears: 3.2, topPick: true },
      { id: "am2", name: "Amazon.com 4.8% 2033", logo: GLOBAL_BOND_LOGOS.amazon, isin: "US0231351075", currency: "USD", couponRate: "4.8%", price: "99.80", yieldPct: "4.85%", yieldValue: 4.85, maturity: "10/12/2033", duration: "7.5", durationYears: 7.5 },
    ],
    couponRateRange: "3.5–5.8%",
    maturityRange: "2026–2033",
    estimatedYield: "3.8–5.2%",
    sp: "AA",
    moodys: "A1",
    fitch: "AA-",
  },
  coke: {
    id: "coke",
    title: "COCA-COLA CO/THE",
    fullName: "COCA-COLA CO/THE",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Coca-Cola",
    logo: GLOBAL_BOND_LOGOS.coke,
    ticker: "KO",
    currency: "USD",
    creditRating: "Credit Rating : S&P = A+ | Moody's = A1 | Fitch = A+",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "c1", name: "COCA-COLA CO/THE 5.18% 2045", logo: GLOBAL_BOND_LOGOS.coke, isin: "US1912161007", currency: "USD", couponRate: "5.18%", price: "102.30", yieldPct: "5.05%", yieldValue: 5.05, maturity: "01/11/2045", duration: "15.2", durationYears: 15.2, topPick: true },
    ],
    couponRateRange: "3.0–5.1%",
    maturityRange: "2028–2035",
    estimatedYield: "3.3–4.7%",
    sp: "A+",
    moodys: "A1",
    fitch: "A+",
  },
  amex: {
    id: "amex",
    title: "AMERICAN EXPRESS CO",
    fullName: "AMERICAN EXPRESS CO",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ American Express",
    logo: GLOBAL_BOND_LOGOS.amex,
    ticker: "AXP",
    currency: "USD",
    creditRating: "Credit Rating : S&P = A- | Moody's = A2 | Fitch = A",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "ax1", name: "AMERICAN EXPRESS 1.37% 2026", logo: GLOBAL_BOND_LOGOS.amex, isin: "US0258161092", currency: "USD", couponRate: "1.37%", price: "99.50", yieldPct: "1.50%", yieldValue: 1.5, maturity: "15/08/2026", duration: "1.0", durationYears: 1.0, topPick: true },
    ],
    couponRateRange: "4.1–6.2%",
    maturityRange: "2025–2032",
    estimatedYield: "4.5–5.8%",
    sp: "A-",
    moodys: "A2",
    fitch: "A",
  },
  nvidia: {
    id: "nvidia",
    title: "NVIDIA CORP",
    fullName: "NVIDIA CORP",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ NVIDIA",
    logo: GLOBAL_BOND_LOGOS.nvidia,
    ticker: "NVDA",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AA- | Moody's = A1 | Fitch = AA-",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "n1", name: "NVIDIA CORP 4.75% 2060", logo: GLOBAL_BOND_LOGOS.nvidia, isin: "US67066G1040", currency: "USD", couponRate: "4.75%", price: "93.60", yieldPct: "3.45%", yieldValue: 3.45, maturity: "05/06/2032", duration: "6.1", durationYears: 6.1, topPick: true },
    ],
    couponRateRange: "3.2–5.5%",
    maturityRange: "2027–2034",
    estimatedYield: "3.6–5.0%",
    sp: "AA-",
    moodys: "A1",
    fitch: "AA-",
  },
  walmart: {
    id: "walmart",
    title: "WALMART INC",
    fullName: "WALMART INC",
    description: "รายละเอียดตราสารหนี้ต่างประเทศของ Walmart",
    logo: GLOBAL_BOND_LOGOS.walmart,
    ticker: "WMT",
    currency: "USD",
    creditRating: "Credit Rating : S&P = AA | Moody's = Aa2 | Fitch = AA",
    updatedAt: "25 August 2026 - 09.00",
    bonds: [
      { id: "w1", name: "WALMART INC 2.9% 2030", logo: GLOBAL_BOND_LOGOS.walmart, isin: "US9311421039", currency: "USD", couponRate: "2.9%", price: "98.80", yieldPct: "3.10%", yieldValue: 3.1, maturity: "15/04/2030", duration: "4.0", durationYears: 4.0, topPick: true },
    ],
    couponRateRange: "2.9–4.7%",
    maturityRange: "2023–2030",
    estimatedYield: "3.1–4.3%",
    sp: "AA",
    moodys: "Aa2",
    fitch: "AA",
  },
};

export const TOP_PICK_ROWS: GlobalBondRow[] = [
  { id: "tp1", name: "Apple Inc 4.45% 2035", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833CF61", currency: "USD", couponRate: "1.375%", price: "98.45", yieldPct: "2.05%", yieldValue: 2.05, maturity: "05/05/2026", duration: "1.7", durationYears: 1.7, topPick: true },
  { id: "tp2", name: "COCA-COLA CO/THE 5.18% 2045", logo: GLOBAL_BOND_LOGOS.coke, isin: "US037833DG77", currency: "USD", couponRate: "1.65%", price: "96.20", yieldPct: "2.40%", yieldValue: 2.4, maturity: "15/08/2027", duration: "2.6", durationYears: 2.6 },
  { id: "tp3", name: "NVIDIA CORP 4.75% 2060", logo: GLOBAL_BOND_LOGOS.nvidia, isin: "US037833DU16", currency: "USD", couponRate: "3.05%", price: "93.60", yieldPct: "3.45%", yieldValue: 3.45, maturity: "05/06/2032", duration: "6.1", durationYears: 6.1, topPick: true },
  { id: "tp4", name: "Apple Inc 4.45% 2035", logo: GLOBAL_BOND_LOGOS.apple, isin: "US037833DV98", currency: "USD", couponRate: "4.45%", price: "101.20", yieldPct: "4.35%", yieldValue: 4.35, maturity: "01/02/2035", duration: "8.7", durationYears: 8.7 },
  { id: "tp5", name: "AMERICAN EXPRESS 1.37% 2026", logo: GLOBAL_BOND_LOGOS.amex, isin: "US037833DW70", currency: "USD", couponRate: "4.65%", price: "99.10", yieldPct: "4.70%", yieldValue: 4.7, maturity: "15/12/2041", duration: "12.5", durationYears: 12.5 },
];

export const RECOMMENDED_ISSUERS: GlobalBondIssuerId[] = [
  "apple",
  "microsoft",
  "meta",
  "amazon",
  "coke",
  "amex",
  "nvidia",
  "walmart",
];

export const DETAIL_RECOMMENDED_ISSUERS: GlobalBondIssuerId[] = ["meta", "microsoft", "amazon"];

export type DetailRecommendedCard = {
  id: GlobalBondIssuerId;
  title: string;
  ticker: string;
  estimatedYield: string;
  maturityRange: string;
  logoSrc: string;
  logoVariant: "meta-infinity" | "image";
};

export const DETAIL_RECOMMENDED_CARDS: DetailRecommendedCard[] = [
  {
    id: "meta",
    title: "Meta Platforms",
    ticker: "META",
    estimatedYield: "3.2–4.1%",
    maturityRange: "2027–2032",
    logoSrc: "/global-bond-card-meta-logo.svg",
    logoVariant: "meta-infinity",
  },
  {
    id: "microsoft",
    title: "Microsoft Corp",
    ticker: "MSFT",
    estimatedYield: "3.2–4.1%",
    maturityRange: "2027–2032",
    logoSrc: "/global-bond-card-msft.png",
    logoVariant: "image",
  },
  {
    id: "amazon",
    title: "Amazon.com Inc.",
    ticker: "AMZN",
    estimatedYield: "3.2–4.1%",
    maturityRange: "2027–2032",
    logoSrc: "/global-bond-card-amzn.png",
    logoVariant: "image",
  },
];

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

const ALL_OVERSEAS_BONDS_SEED: Omit<GlobalBondRow, "id">[] = [
  { name: "Microsoft Corp 3.05% 2032", logo: GLOBAL_BOND_LOGOS.microsoft, ticker: "MSFT", isin: "US037833CF61", currency: "USD", couponRate: "3.05%", couponValue: 3.05, price: "93.60", yieldPct: "3.45%", yieldValue: 3.45, maturity: "05/06/2032", duration: "6.1", durationYears: 6.1, topPick: true },
  { name: "Meta Platforms Inc 1.37% 2026", logo: GLOBAL_BOND_LOGOS.meta, ticker: "META", isin: "US037833CF61", currency: "USD", couponRate: "1.37%", couponValue: 1.37, price: "98.45", yieldPct: "2.05%", yieldValue: 2.05, maturity: "05/05/2026", duration: "1.7", durationYears: 1.7 },
  { name: "Apple Inc 1.37% 2026", logo: GLOBAL_BOND_LOGOS.apple, ticker: "AAPL", isin: "US037833CF61", currency: "USD", couponRate: "1.375%", couponValue: 1.375, price: "98.45", yieldPct: "2.05%", yieldValue: 2.05, maturity: "05/05/2026", duration: "1.7", durationYears: 1.7 },
  { name: "Apple Inc 4.45% 2035", logo: GLOBAL_BOND_LOGOS.apple, ticker: "AAPL", isin: "US037833CF61", currency: "USD", couponRate: "4.45%", couponValue: 4.45, price: "101.20", yieldPct: "4.35%", yieldValue: 4.35, maturity: "01/02/2035", duration: "8.7", durationYears: 8.7, topPick: true },
  { name: "Microsoft Corp 1.37% 2026", logo: GLOBAL_BOND_LOGOS.microsoft, ticker: "MSFT", isin: "US037833CF61", currency: "USD", couponRate: "1.37%", couponValue: 1.37, price: "99.10", yieldPct: "2.25%", yieldValue: 2.25, maturity: "01/06/2026", duration: "1.2", durationYears: 1.2 },
  { name: "Meta Platforms Inc 3.05% 2032", logo: GLOBAL_BOND_LOGOS.meta, ticker: "META", isin: "US037833CF61", currency: "USD", couponRate: "3.05%", couponValue: 3.05, price: "96.50", yieldPct: "4.00%", yieldValue: 4.0, maturity: "01/04/2032", duration: "6.0", durationYears: 6.0 },
  { name: "Apple Inc 3.05% 2032", logo: GLOBAL_BOND_LOGOS.apple, ticker: "AAPL", isin: "US037833CF61", currency: "USD", couponRate: "3.05%", couponValue: 3.05, price: "93.60", yieldPct: "3.45%", yieldValue: 3.45, maturity: "05/06/2032", duration: "6.1", durationYears: 6.1 },
  { name: "Apple Inc 1.65% 2027", logo: GLOBAL_BOND_LOGOS.apple, ticker: "AAPL", isin: "US037833CF61", currency: "USD", couponRate: "1.65%", couponValue: 1.65, price: "96.20", yieldPct: "2.40%", yieldValue: 2.4, maturity: "15/08/2027", duration: "2.6", durationYears: 2.6 },
  { name: "Microsoft Corp 1.65% 2027", logo: GLOBAL_BOND_LOGOS.microsoft, ticker: "MSFT", isin: "US037833CF61", currency: "USD", couponRate: "1.65%", couponValue: 1.65, price: "97.80", yieldPct: "3.70%", yieldValue: 3.7, maturity: "15/03/2030", duration: "4.5", durationYears: 4.5 },
  { name: "Apple Inc 4.65% 2041", logo: GLOBAL_BOND_LOGOS.apple, ticker: "AAPL", isin: "US037833CF61", currency: "USD", couponRate: "4.65%", couponValue: 4.65, price: "99.10", yieldPct: "4.70%", yieldValue: 4.7, maturity: "15/12/2041", duration: "12.5", durationYears: 12.5 },
  { name: "Amazon.com Inc 3.05% 2032", logo: GLOBAL_BOND_LOGOS.amazon, ticker: "AMZN", isin: "US037833CF61", currency: "USD", couponRate: "3.05%", couponValue: 3.05, price: "97.20", yieldPct: "3.80%", yieldValue: 3.8, maturity: "20/05/2028", duration: "3.2", durationYears: 3.2 },
  { name: "Amazon.com Inc 1.37% 2026", logo: GLOBAL_BOND_LOGOS.amazon, ticker: "AMZN", isin: "US037833CF61", currency: "USD", couponRate: "1.37%", couponValue: 1.37, price: "99.80", yieldPct: "4.85%", yieldValue: 4.85, maturity: "10/12/2033", duration: "7.5", durationYears: 7.5, topPick: true },
  { name: "Meta Platforms Inc 1.65% 2027", logo: GLOBAL_BOND_LOGOS.meta, ticker: "META", isin: "US037833CF61", currency: "USD", couponRate: "1.65%", couponValue: 1.65, price: "98.00", yieldPct: "2.80%", yieldValue: 2.8, maturity: "15/08/2027", duration: "2.1", durationYears: 2.1 },
  { name: "Amazon.com Inc 1.65% 2027", logo: GLOBAL_BOND_LOGOS.amazon, ticker: "AMZN", isin: "US037833CF61", currency: "USD", couponRate: "1.65%", couponValue: 1.65, price: "97.20", yieldPct: "3.80%", yieldValue: 3.8, maturity: "20/05/2028", duration: "3.2", durationYears: 3.2 },
  { name: "Meta Platforms Inc 4.45% 2035", logo: GLOBAL_BOND_LOGOS.meta, ticker: "META", isin: "US037833CF61", currency: "USD", couponRate: "4.45%", couponValue: 4.45, price: "96.50", yieldPct: "4.00%", yieldValue: 4.0, maturity: "01/04/2032", duration: "6.0", durationYears: 6.0 },
];

export const ALL_OVERSEAS_BONDS_COUNT = 100;
export const ALL_OVERSEAS_BONDS_UPDATED_AT = "10 September 2025 - 09.00";
export const ALL_OVERSEAS_BONDS_PAGE_SIZE = 15;

export const ALL_OVERSEAS_BONDS: GlobalBondRow[] = Array.from({ length: ALL_OVERSEAS_BONDS_COUNT }, (_, i) => {
  const seed = ALL_OVERSEAS_BONDS_SEED[i % ALL_OVERSEAS_BONDS_SEED.length];
  return { ...seed, id: `aob-${i + 1}` };
});

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
