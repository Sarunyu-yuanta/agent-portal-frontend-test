"use client";

import { useState } from "react";
import { Tag, Button, Chip } from "@sarunyu/system-one";
import {
  SparkleIcon,
  DownloadSimpleIcon,
  TrendUpIcon,
  TrendDownIcon,
  MinusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UsersIcon,
  CurrencyCircleDollarIcon,
  ClockIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import { mockHouseViewStrategies } from "@/lib/mock-data";
import { useStrapiNBAActions } from "@/hooks/use-strapi";

// ─── Data ─────────────────────────────────────────────────────────────────────

type AssetClassFilter = "All" | "Equity" | "Fixed Income" | "Alternatives" | "Real Estate";
const ASSET_FILTERS: AssetClassFilter[] = ["All", "Equity", "Fixed Income", "Alternatives", "Real Estate"];

const STANCES = [
  { label: "Thai Equity",         stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
  { label: "Asian Equity",        stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
  { label: "Global Fixed Income", stance: "Neutral",     color: "var(--text-default-secondary)", width: 50  },
  { label: "Thai Bonds",          stance: "Neutral",     color: "var(--text-default-secondary)", width: 50  },
  { label: "Global REITs",        stance: "Underweight", color: "var(--text-danger-primary)", width: 25  },
  { label: "Alternatives",        stance: "Overweight",  color: "var(--text-success-primary)", width: 100 },
];

const THEMES = [
  { id: "t1", title: "AI-Driven Productivity",  horizon: "LONG-TERM",   horizonColor: "var(--text-brand-primary)", stance: "Overweight",  stanceVariant: "green" as const,  description: "Tech sector earnings upgrades driven by AI capex cycle. Selective overweight in semis and cloud infrastructure." },
  { id: "t2", title: "Rate Cut Cycle",           horizon: "6–12 MONTHS", horizonColor: "var(--text-warning-primary)", stance: "Neutral",     stanceVariant: "gray" as const,   description: "US Fed on track for 2–3 cuts in H2 2026. Duration opportunity in IG bonds at current yields." },
  { id: "t3", title: "China Recovery",           horizon: "LONG-TERM",   horizonColor: "var(--text-brand-primary)", stance: "Overweight",  stanceVariant: "green" as const,  description: "Policy stimulus + retail consumption recovery H2 2026. Selective via HK-listed names." },
  { id: "t4", title: "Energy Transition",        horizon: "18–24 MO.",   horizonColor: "var(--text-default-secondary)", stance: "Selective",   stanceVariant: "yellow" as const, description: "ESG mandates driving inflows into clean energy. Selective in logistics and data centres." },
];

// Extra strategy detail for the playbook cards
const STRATEGY_DETAIL: Record<string, { rationale: string; hook: string; objection: string; response: string; products: { name: string; type: string; risk: string; yield: string }[] }> = {
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

function buildAIFeed(actions: ReturnType<typeof useStrapiNBAActions>) {
  return actions.slice(0, 3).map((a) => ({
    id: a.id,
    initials: a.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2),
    name: a.clientName,
    tag: a.priority === "HIGH" ? "Idle Cash" : a.priority === "MEDIUM" ? "Opportunity" : "Re-engage",
    tagVariant: (a.priority === "HIGH" ? "red" : a.priority === "MEDIUM" ? "blue" : "yellow") as "red" | "blue" | "yellow",
    description: a.insight,
    impact: a.revenueImpact.startsWith("฿") ? `Est. Impact: ${a.revenueImpact.replace(" est. revenue", " Rev")}` : a.revenueImpact,
    impactPositive: a.revenueImpact.startsWith("฿"),
  }));
}

// ─── Asset Allocation Posture ─────────────────────────────────────────────────

function AssetPosture() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      <p className="type-subtitle-1 text-foreground">Asset Allocation Posture</p>
      <div className="flex flex-col divide-y divide-border">
        {STANCES.map((s) => {
          const Icon = s.stance === "Overweight" ? TrendUpIcon : s.stance === "Underweight" ? TrendDownIcon : MinusIcon;
          const c = s.stance === "Overweight" ? "var(--text-success-primary)" : s.stance === "Underweight" ? "var(--text-danger-primary)" : "var(--text-default-secondary)";
          return (
            <div key={s.label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-[12px] text-foreground">{s.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Icon size={13} weight="bold" style={{ color: c }} />
                <span className="text-[12px] font-semibold" style={{ color: c }}>{s.stance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Active Market Themes ─────────────────────────────────────────────────────

function MarketThemesCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 flex-1">
      <p className="type-subtitle-1 text-foreground">Active Market Themes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <div key={t.id} className="rounded-xl bg-muted p-3.5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-semibold text-foreground leading-snug flex-1">{t.title}</p>
              <span className="text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5" style={{ color: t.horizonColor }}>{t.horizon}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
            <Tag text={t.stance} variant={t.stanceVariant} size="small" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Strategy Playbook Card ───────────────────────────────────────────────────

function PlaybookCard({ strategy }: { strategy: (typeof mockHouseViewStrategies)[number] }) {
  const detail = STRATEGY_DETAIL[strategy.id];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex">
      {/* Left accent bar */}
      <div className="w-1 shrink-0" style={{
        background: strategy.conviction === "High" ? "var(--bg-brand-primary)" : strategy.conviction === "Medium" ? "var(--bg-warning-primary)" : "var(--bg-danger-primary)"
      }} />

      <div className="flex-1 p-6 flex flex-col gap-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Tag text={`${strategy.conviction.toUpperCase()} CONVICTION`} variant={strategy.convictionVariant} size="small" />
              <Tag text={strategy.assetClass.toUpperCase()} variant="gray" size="small" />
            </div>
            <p className="text-[20px] font-bold text-foreground leading-tight">{strategy.name}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Allocation</p>
            <p className="text-[22px] font-black text-foreground leading-none">{strategy.targetAllocation}</p>
          </div>
        </div>

        {/* Rationale + How to Pitch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategy Rationale</p>
            <p className="text-[12px] text-foreground leading-relaxed">{detail?.rationale}</p>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <SparkleIcon size={12} weight="fill" className="text-primary-action" />
              <p className="text-[11px] font-semibold text-foreground">How to Pitch</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {detail && [
                { label: "Hook", value: detail.hook },
                { label: "Objection", value: detail.objection },
                { label: "Response", value: detail.response },
              ].map((item) => (
                <p key={item.label} className="text-[11px] text-muted-foreground leading-snug">
                  <span className="font-semibold text-foreground">{item.label}: </span>{item.value}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Product table */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Approved Execution Products</p>
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px] bg-muted/50 px-4 py-2 border-b border-border">
              {["Product / Fund", "Risk", "Est. Yield/Ret.", "Action"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
              ))}
            </div>
            {detail?.products.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col gap-2 px-4 py-3 md:grid md:grid-cols-[1fr_80px_120px_100px] md:items-center ${i < (detail.products.length - 1) ? "border-b border-border" : ""}`}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.type}</p>
                </div>
                <span className={`text-[11px] font-semibold ${p.risk === "High" ? "text-destructive" : p.risk === "Medium" ? "text-warning" : "text-success"}`}>{p.risk}</span>
                <span className="text-[11px] text-foreground">{p.yield}</span>
                <Button variant="outline" size="sm">Add to Cart</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[...Array(Math.min(strategy.matchedClients, 3))].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">{strategy.matchedClients}</span> matched clients
            </p>
          </div>
          <Button variant="primary" size="sm" rightIcon={<ArrowRightIcon size={13} />}>
            View Clients &amp; Pitch
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Strategy Playbooks Section ───────────────────────────────────────────────

function StrategyPlaybooks() {
  const [filter, setFilter] = useState<AssetClassFilter>("All");
  const [chipsScrolled, setChipsScrolled] = useState(false);
  const filtered = mockHouseViewStrategies.filter((s) => filter === "All" || s.assetClass === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="type-subtitle-1 text-foreground">Strategy Playbooks</p>
        <div className="flex items-center gap-2 min-w-0 sm:shrink-0">
          <span className="text-[12px] text-muted-foreground shrink-0">Filter by:</span>
          <div className="relative flex-1 min-w-0 sm:flex-none">
            <div
              className="scrollable-tabs flex items-center gap-2 sm:overflow-visible"
              onScroll={(e) => setChipsScrolled(e.currentTarget.scrollLeft > 0)}
              style={chipsScrolled ? {
                maskImage: "linear-gradient(to right, transparent 0px, black 40px)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 40px)",
              } : undefined}
            >
              {ASSET_FILTERS.map((f) => (
                <Chip key={f} label={f} type="single" size="small" selected={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((s) => <PlaybookCard key={s.id} strategy={s} />)}
      </div>
    </div>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────

function RightSidebar() {
  const nbaActions = useStrapiNBAActions();
  const AI_FEED = buildAIFeed(nbaActions);
  return (
    <div className="flex flex-col gap-5 sticky top-6">

      {/* Strategy Impact KPIs */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategy Impact (YTD)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "AUM Generated",       value: "฿1.2B",  icon: CurrencyCircleDollarIcon },
            { label: "Proposal Conv. Rate",  value: "68%",    icon: UsersIcon },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-border bg-card p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground leading-tight">{k.label}</p>
                </div>
                <p className="text-[22px] font-semibold text-foreground leading-none">{k.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Action Feed */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SparkleIcon size={14} weight="fill" className="text-primary-action" />
            <p className="type-subtitle-1 text-foreground">AI Action Feed</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--bg-success-light)] border border-[var(--border-success)] rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-success-primary)] animate-pulse" />
            <span className="text-[10px] font-semibold text-[var(--text-success-primary)]">Live</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {AI_FEED.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-3.5 flex flex-col gap-2.5 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">{item.initials}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{item.name}</p>
                </div>
                <Tag text={item.tag} variant={item.tagVariant} size="small" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>
              <p className={`text-[11px] font-semibold ${item.impactPositive ? "text-success" : "text-warning"}`}>
                {item.impact}
              </p>
            </div>
          ))}
        </div>

        <Button variant="plain" size="sm" rightIcon={<ArrowRightIcon size={12} />}>
          View all AI actions
        </Button>
      </div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HouseViewPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline-black" size="sm" leftIcon={<DownloadSimpleIcon size={14} />}>CIO Report</Button>
        <Button variant="primary" size="sm" leftIcon={<SparkleIcon size={14} weight="fill" />}>Auto-Match Clients</Button>
      </div>

      {/* Top row: Asset Posture + Market Themes */}
      <div className="flex flex-col lg:grid gap-5 items-stretch" style={{ gridTemplateColumns: "320px 1fr" }}>
        <AssetPosture />
        <MarketThemesCard />
      </div>

      {/* Body: Playbooks + Sidebar */}
      <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
        <StrategyPlaybooks />
        <RightSidebar />
      </div>

    </div>
  );
}
