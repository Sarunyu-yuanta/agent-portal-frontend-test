/**
 * House View static data.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * `STANCES`, `THEMES`, and `STRATEGY_DETAIL` are the CIO's market posture and
 * per-strategy playbook copy — hard-coded here, should be served by the API.
 * Strategy rows themselves come from `mockHouseViewStrategies` (@/lib/mock-data).
 * `buildAIFeed` derives the sidebar feed from NBA actions.
 */

import { useNBAActions } from "@/hooks/use-api";
import { getInitialsFromWords } from "@/lib/client-utils";

export type AssetClassFilter = "All" | "Equity" | "Fixed Income" | "Alternatives" | "Real Estate";
export const ASSET_FILTERS: AssetClassFilter[] = ["All", "Equity", "Fixed Income", "Alternatives", "Real Estate"];

export const STANCES = [
  { label: "Thai Equity",         stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
  { label: "Asian Equity",        stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
  { label: "Global Fixed Income", stance: "Neutral",     color: "var(--text-default-secondary)", width: 50  },
  { label: "Thai Bonds",          stance: "Neutral",     color: "var(--text-default-secondary)", width: 50  },
  { label: "Global REITs",        stance: "Underweight", color: "var(--text-danger-primary)", width: 25  },
  { label: "Alternatives",        stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
];

export const THEMES = [
  { id: "t1", title: "AI-Driven Productivity",  horizon: "LONG-TERM",   horizonColor: "var(--text-brand-primary)", stance: "Overweight",  stanceVariant: "green" as const,  description: "Tech sector earnings upgrades driven by AI capex cycle. Selective overweight in semis and cloud infrastructure." },
  { id: "t2", title: "Rate Cut Cycle",           horizon: "6–12 MONTHS", horizonColor: "var(--text-warning-primary)", stance: "Neutral",     stanceVariant: "gray" as const,   description: "US Fed on track for 2–3 cuts in H2 2026. Duration opportunity in IG bonds at current yields." },
  { id: "t3", title: "China Recovery",           horizon: "LONG-TERM",   horizonColor: "var(--text-brand-primary)", stance: "Overweight",  stanceVariant: "green" as const,  description: "Policy stimulus + retail consumption recovery H2 2026. Selective via HK-listed names." },
  { id: "t4", title: "Energy Transition",        horizon: "18–24 MO.",   horizonColor: "var(--text-default-secondary)", stance: "Selective",   stanceVariant: "yellow" as const, description: "ESG mandates driving inflows into clean energy. Selective in logistics and data centres." },
];

// Extra strategy detail for the playbook cards
export const STRATEGY_DETAIL: Record<string, { rationale: string; hook: string; objection: string; response: string; products: { name: string; type: string; risk: string; yield: string }[] }> = {
  s1: {
    rationale: "Earnings recovery in tech/financials sector with AI-driven productivity tailwinds. Thailand and HK markets offer attractive entry points relative to historical valuations.",
    hook: "\"AI isn't a fad — it's a multi-year capex supercycle with direct exposure through Asia equity.\"",
    objection: "\"Isn't Asian equity too volatile?\"",
    response: "Focus on quality-tilted funds with low drawdown history and active risk management.",
    products: [
      { name: "Thailand Equity Fund A", type: "Mutual Fund · Min ฿50k", risk: "High", yield: "10–15% p.a." },
      { name: "Asia Growth ETF",         type: "ETF · Direct Eq.",        risk: "High", yield: "Beta match" },
      { name: "HK Tech Sector Fund",     type: "Mutual Fund · Min ฿100k", risk: "High", yield: "12–18% p.a." },
    ],
  },
  s2: {
    rationale: "Rate cycle peak creates compelling entry for short-duration IG bonds. Lock in 5–6% yield before cuts compress spreads. Capital preservation with income.",
    hook: "\"Lock in 5–6% yield now before the rate cut cycle compresses spreads.\"",
    objection: "\"Why not wait until rates fall?\"",
    response: "Short duration limits NAV sensitivity. You capture yield now without interest rate risk.",
    products: [
      { name: "IG Corporate Bond Fund",  type: "Mutual Fund · Min ฿50k", risk: "Medium", yield: "5–6% p.a." },
      { name: "Short Duration Bond ETF", type: "ETF · Direct Eq.",        risk: "Low",    yield: "4.5–5% p.a." },
    ],
  },
  s3: {
    rationale: "100% capital protection + 8.5% p.a. coupon. Ideal for idle cash redeployment. Structured for conservative clients with excess liquidity.",
    hook: "\"100% capital protection and 8.5% yield — the ideal home for idle cash.\"",
    objection: "\"Is the capital really protected?\"",
    response: "Protection backed by investment-grade issuer. Full principal returned at maturity regardless of market.",
    products: [
      { name: "6-Month Structured Note Series 12", type: "Structured Product · Min ฿500k", risk: "Low", yield: "8.5% p.a." },
    ],
  },
  s4: {
    rationale: "Sector under pressure from rates but quality assets in logistics and data centers remain resilient. Selective exposure only.",
    hook: "\"Logistics and data centre REITs are structurally supported — different from office exposure.\"",
    objection: "\"REITs are down — why buy now?\"",
    response: "Focus only on quality sub-sectors. Rate normalisation is a tailwind over 18–24 months.",
    products: [
      { name: "Global REITs Fund",    type: "Mutual Fund · Min ฿50k", risk: "Medium", yield: "4–6% p.a." },
      { name: "Logistics REIT ETF",   type: "ETF · Direct Eq.",        risk: "Medium", yield: "Dividend + Beta" },
    ],
  },
};

export function buildAIFeed(actions: ReturnType<typeof useNBAActions>) {
  return actions.slice(0, 3).map((a) => ({
    id: a.id,
    initials: getInitialsFromWords(a.clientName),
    name: a.clientName,
    tag: a.priority === "HIGH" ? "Idle Cash" : a.priority === "MEDIUM" ? "Opportunity" : "Re-engage",
    tagVariant: (a.priority === "HIGH" ? "red" : a.priority === "MEDIUM" ? "blue" : "yellow") as "red" | "blue" | "yellow",
    description: a.insight,
    impact: a.revenueImpact.startsWith("฿") ? `Est. Impact: ${a.revenueImpact.replace(" est. revenue", " Rev")}` : a.revenueImpact,
    impactPositive: a.revenueImpact.startsWith("฿"),
  }));
}
