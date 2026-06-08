"use client";

import { useState } from "react";
import { Card, Tag, Button, CircleProgress, Slider } from "@sarunyu/system-one";
import {
  SparkleIcon,
  ChartBarIcon,
  TargetIcon,
  CurrencyCircleDollarIcon,
  TrendUpIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  WarningCircleIcon,
  CalendarCheckIcon,
  UsersThreeIcon,
  ArrowsLeftRightIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { mockPerformanceData } from "@/lib/mock-data";

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusVariant(s: string): "green" | "yellow" | "blue" {
  if (s === "On Track") return "green";
  if (s === "Exceeded") return "blue";
  return "yellow";
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KpiRow() {
  const metrics = [
    { label: "YTD Revenue",         ...mockPerformanceData.revenueYtd },
    { label: "AUM Growth",          ...mockPerformanceData.aumGrowth },
    { label: "Net New Money",       ...mockPerformanceData.netNewMoney },
    { label: "Product Penetration", ...mockPerformanceData.productPenetration },
  ];
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[160px_1fr_1fr_1fr_1fr]">
      {/* Grade card — hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex rounded-2xl p-5 flex-col items-center justify-center gap-2 h-full" style={{ background: "#1e2337" }}>
        <p className="text-[48px] font-bold text-white leading-none tracking-tight">B+</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.35)" }}>Overall</p>
      </div>
      {/* KPI Cards — 2 per row on mobile, each takes 1fr on desktop */}
      <div className="grid grid-cols-2 gap-4 lg:contents">
        {metrics.map((m) => (
          <Card key={m.label} variant="default" className="flex flex-col gap-3 h-full">
            <div className="flex items-start justify-between gap-2">
              <p className="type-caption text-muted-foreground">{m.label}</p>
              <Tag text={m.status} variant={statusVariant(m.status)} size="small" />
            </div>
            <p className="type-h3 text-foreground leading-none">{m.value}</p>
            <div className="flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary-action" style={{ width: `${m.progress}%` }} />
              </div>
              <p className="type-caption text-[var(--text-default-disabled)]">{m.progress}% · Target {m.target}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Income Tracker ───────────────────────────────────────────────────────────

const PRODUCT_COLORS: Record<string, string> = {
  "Equity Funds":    "var(--bg-brand-secondary)",
  "Fixed Income":    "var(--bg-brand-primary)",
  "Structured Notes":"var(--bg-success-primary)",
  "REITs":           "var(--bg-warning-primary)",
  "Alternatives":    "var(--bg-theme-pink)",
};

function IncomeTracker() {
  const total = mockPerformanceData.incomeByProduct.reduce((s, d) => s + d.revenue, 0);
  const maxRevenue = Math.max(...mockPerformanceData.incomeByProduct.map((d) => d.revenue));

  return (
    <Card variant="default">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <CurrencyCircleDollarIcon size={16} className="text-muted-foreground" />
          <p className="type-subtitle-1 text-foreground">Income Tracker</p>
        </div>

        {/* Hero commission */}
        <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
          <p className="type-caption text-muted-foreground">Est. Commission (YTD)</p>
          <div className="flex items-baseline gap-2.5">
            <p className="type-h3 text-foreground leading-none">฿{total.toFixed(1)}M</p>
            <span className="text-[11px] text-muted-foreground">+฿2.4M vs last Q</span>
          </div>
        </div>

        {/* Revenue by product — horizontal bars */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground">Revenue by Product Type</p>
          <div className="flex flex-col gap-2.5 mt-1">
            {mockPerformanceData.incomeByProduct.map((d) => (
              <div key={d.product} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PRODUCT_COLORS[d.product] }} />
                    <span className="text-[12px] text-foreground">{d.product}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-foreground tabular-nums">฿{d.revenue}M</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(d.revenue / maxRevenue) * 100}%`, background: PRODUCT_COLORS[d.product] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Pipeline Coverage ────────────────────────────────────────────────────────

function PipelineCoverage() {
  return (
    <Card variant="default">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <ChartBarIcon size={16} className="text-muted-foreground" />
          <p className="type-subtitle-1 text-foreground">Pipeline Coverage</p>
        </div>

        <div className="flex justify-center py-2">
          <CircleProgress size="lg" value={90} />
        </div>

        <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-border bg-muted/30">
          <div className="flex items-start gap-2">
            <SparkleIcon size={13} weight="fill" className="text-primary-action shrink-0 mt-0.5" />
            <p className="text-[12px] text-foreground leading-relaxed">
              Your pipeline can cover <span className="font-semibold">90% of your revenue gap</span> if executed. Focus on closing the 2 deals in Negotiation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Deals in Pipeline", value: "8" },
            { label: "Weighted Value",   value: "฿8.2M" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 p-3 rounded-xl bg-muted">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="text-[18px] font-semibold text-foreground leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Gap Analysis (dark sidebar card) ────────────────────────────────────────

function GapAnalysisSidebar() {
  const gaps = [
    {
      label: "Revenue Shortfall",
      value: "฿5.8M",
      sub: "to hit Q2 target",
      badge: "19% gap",
      progress: 81,
      color: "var(--text-danger-primary)",
      bg: "var(--bg-danger-light)",
      border: "var(--border-danger)",
      track: "var(--bg-danger-light)",
    },
    {
      label: "AUM Growth Gap",
      value: "−1.6pp",
      sub: "below target rate",
      badge: "16% gap",
      progress: 84,
      color: "var(--text-warning-primary)",
      bg: "var(--bg-warning-light)",
      border: "var(--border-warning)",
      track: "var(--bg-warning-light)",
    },
    {
      label: "Product Penetration",
      value: "−0.6",
      sub: "products / client gap",
      badge: "20% gap",
      progress: 80,
      color: "var(--text-warning-primary)",
      bg: "var(--bg-warning-light)",
      border: "var(--border-warning)",
      track: "var(--bg-warning-light)",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TargetIcon size={14} style={{ color: "rgba(255,255,255,0.45)" }} />
          <p className="text-[13px] font-semibold text-white">Gap Analysis</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}
        >
          Q2 2025
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-1.5">
        {gaps.map((g) => (
          <div
            key={g.label}
            className="rounded-xl px-4 py-3.5 flex items-center justify-between gap-4"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
                {g.label}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {g.sub}
              </p>
            </div>
            <p className="text-[22px] font-semibold leading-none shrink-0" style={{ color: g.color }}>
              {g.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Action Plan ───────────────────────────────────────────────────────────

const AI_STEPS = [
  {
    n: 1,
    title: "Close 2 Structured Note proposals",
    detail: "฿110M combined · 85% and 78% probability. Closes ฿2.4M rev gap immediately.",
    cta: "Follow Up",
    impact: "+฿2.4M",
  },
  {
    n: 2,
    title: "Re-engage Wichai Thongkam",
    detail: "฿45M bond proposal stalled 25 days. Pitch Short-term Fixed Income instead.",
    cta: "Draft Message",
    impact: "+฿0.5M",
  },
  {
    n: 3,
    title: "Pitch Asia Equity Fund to 3 UHNW clients",
    detail: "Somchai, Nattaporn, Thanawat hold idle cash. Optimal window this week.",
    cta: "Generate Pitch Decks",
    impact: "+฿1.8M",
  },
];

function AiActionPlan() {
  return (
    <div className="flex flex-col gap-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div>
        <div className="flex items-center gap-2">
          <SparkleIcon size={13} weight="fill" style={{ color: "var(--text-brand-primary)" }} />
          <p className="text-[13px] font-semibold text-white">AI Action Plan</p>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Prioritised steps to close ฿5.8M revenue gap.</p>
      </div>

      <div className="flex flex-col gap-4">
        {AI_STEPS.map((s) => (
          <div key={s.n} className="flex gap-3">
            {/* Number bubble */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.3)" }}
            >
              <span className="text-[10px] font-bold" style={{ color: "var(--text-brand-primary)" }}>{s.n}</span>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-snug">{s.title}</p>
              <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{s.detail}</p>
              <div className="flex items-center gap-2">
                <button
                  className="text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                >
                  {s.cta}
                </button>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-success-primary)" }}>{s.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cross-Sell Diagnostics ───────────────────────────────────────────────────

function CrossSellDiagnostics() {
  return (
    <Card variant="default">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ArrowsLeftRightIcon size={16} className="text-muted-foreground" />
          <p className="type-subtitle-1 text-foreground">Cross-Sell Diagnostics</p>
        </div>

        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-[13px] font-medium text-foreground">Single Product Clients</p>
              <p className="type-caption text-muted-foreground mt-0.5">High flight risk</p>
            </div>
            <p className="text-[24px] font-semibold text-destructive leading-none">42%</p>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-[13px] font-medium text-foreground">Multi-Product Clients (3+)</p>
              <p className="type-caption text-muted-foreground mt-0.5">Highly retained</p>
            </div>
            <p className="text-[24px] font-semibold text-success leading-none">18%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <WarningCircleIcon size={12} weight="fill" className="text-[var(--text-warning-primary)] shrink-0" />
          <p className="text-[11px] text-muted-foreground">Over-reliance on Equities (62% of book).</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Client Engagement ────────────────────────────────────────────────────────

function ClientEngagement() {
  return (
    <Card variant="default" className="h-full">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UsersThreeIcon size={16} className="text-muted-foreground" />
            <p className="type-subtitle-1 text-foreground">Client Engagement</p>
          </div>
          <Tag text="2 At Risk" variant="red" size="small" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted">
            <p className="type-caption text-muted-foreground">Active</p>
            <div className="flex items-baseline gap-1">
              <p className="text-[28px] font-semibold text-foreground leading-none">6</p>
              <p className="type-caption text-muted-foreground">/ 8</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted">
            <p className="type-caption text-muted-foreground">Dormant &gt;30D</p>
            <p className="text-[28px] font-semibold text-foreground leading-none">2</p>
          </div>
        </div>

        {/* Segmented bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="rounded-full bg-[var(--bg-success-primary)]" style={{ flex: 6 }} />
            <div className="rounded-full bg-[var(--bg-danger-primary)]" style={{ flex: 2 }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-success-primary)] shrink-0" />
              <span className="type-caption text-muted-foreground">Active 75%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-danger-primary)] shrink-0" />
              <span className="type-caption text-muted-foreground">Dormant 25%</span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" leftIcon={<CalendarCheckIcon size={13} />} className="w-full justify-center">
          View Dormant Clients
        </Button>
      </div>
    </Card>
  );
}

// ─── Outcome Simulator ────────────────────────────────────────────────────────

function OutcomeSimulator() {
  const [deals, setDeals] = useState(0);
  const projected = Math.min(81 + deals * 2, 100);
  const commission = (24.2 + deals * 0.85).toFixed(1);
  const done = projected >= 100;

  return (
    <Card variant="default">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <LightningIcon size={15} weight="fill" className="text-muted-foreground" />
          <p className="type-subtitle-1 text-foreground">Outcome Simulator</p>
        </div>
        <p className="text-[12px] text-muted-foreground -mt-2">Adjust closed deals to see impact on Q2 target.</p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-foreground">Deals Closed from Pipeline</p>
            <span className="text-[13px] font-semibold text-foreground tabular-nums">
              {deals} {deals === 1 ? "deal" : "deals"}
            </span>
          </div>
          <div className="px-3">
            <Slider value={deals} onChange={setDeals} min={0} max={10} showSteps size="lg" />
          </div>
          <div className="flex items-center justify-between px-3 text-[10px] text-muted-foreground">
            <span>0</span><span>All 10</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted">
            <p className="type-caption text-muted-foreground">Projected Target %</p>
            <p className="text-[24px] font-semibold text-foreground leading-none">{projected}%</p>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted">
            <p className="type-caption text-muted-foreground">Est. Total Comm.</p>
            <p className="text-[24px] font-semibold text-foreground leading-none">฿{commission}M</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-5">

      {/* KPI row */}
      <KpiRow />

      {/* Body: main 2-col + dark sidebar */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_300px] items-start">

        {/* Main content */}
        <div className="flex flex-col gap-5">
          {/* Row 1: Income + Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <IncomeTracker />
            <PipelineCoverage />
          </div>

          {/* Row 2: Cross-sell + Engagement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <CrossSellDiagnostics />
            <ClientEngagement />
          </div>

          {/* Row 3: Outcome Simulator full-width */}
          <OutcomeSimulator />
        </div>

        {/* Dark navy sidebar — stretches full height */}
        <div className="rounded-2xl p-5 flex flex-col gap-4 lg:sticky lg:top-6" style={{ background: "#1e2337" }}>
          <GapAnalysisSidebar />
          <AiActionPlan />
        </div>

      </div>
    </div>
  );
}
