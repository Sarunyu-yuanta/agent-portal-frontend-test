"use client";

import { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Chip,
  TabGroup,
  Toggle,
  Toaster,
  Avatar,
} from "@sarunyu/system-one";
import {
  SparkleIcon,
  BrainIcon,
  WarningIcon,
  UsersIcon,
  ChartBarIcon,
  GearSixIcon,
  PhoneIcon,
  ChatCircleIcon,
  FileTextIcon,
  UserIcon,
  CurrencyCircleDollarIcon,
  CalendarPlusIcon,
} from "@phosphor-icons/react";
import { mockInsights, mockClients, mockClientDetails } from "@/lib/mock-data";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type SortOption = "priority" | "recent";
type TabId = "all" | "product" | "risk" | "engagement" | "portfolio";
type Insight = (typeof mockInsights)[number];

const CATEGORY_CONFIG = {
  "Product Match": {
    color: "var(--text-brand-primary)",
    bg: "var(--bg-brand-light)",
    Icon: SparkleIcon,
    tagVariant: "green" as const,
    tagText: "Product Match",
    primaryAction: "Draft Proposal",
  },
  "Risk Alert": {
    color: "var(--text-danger-primary)",
    bg: "var(--bg-danger-light)",
    Icon: WarningIcon,
    tagVariant: "red" as const,
    tagText: "Risk Alert",
    primaryAction: "View Allocation",
  },
  "Engagement": {
    color: "var(--text-warning-primary)",
    bg: "var(--bg-warning-light)",
    Icon: UsersIcon,
    tagVariant: "yellow" as const,
    tagText: "Engagement",
    primaryAction: "Call Now",
  },
  "Portfolio": {
    color: "var(--text-brand-secondary)",
    bg: "var(--bg-brand-light)",
    Icon: ChartBarIcon,
    tagVariant: "blue" as const,
    tagText: "Portfolio",
    primaryAction: "Review Portfolio",
  },
} as const;

// ─── KPI Bar ─────────────────────────────────────────────────────────────────

function KpiBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {[
        { label: "High Priority Actions", tag: "Urgent",   tagV: "red"    as const, value: "3",       sub: "Requires action today" },
        { label: "Est. Revenue Impact",   tag: "+฿ 9.5M", tagV: "green"  as const, value: "฿ 9.5M",  sub: "Across 8 insights" },
        { label: "Critical Risk Alerts",  tag: "2 New",    tagV: "red"    as const, value: "2",       sub: "Portfolio concentration" },
        { label: "Engagement Drops",      tag: "Watch",    tagV: "yellow" as const, value: "1",       sub: "Avg 14 days silent" },
      ].map((k) => (
        <Card key={k.label} variant="default" className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <p className="type-caption text-muted-foreground">{k.label}</p>
            <Tag text={k.tag} variant={k.tagV} size="small" />
          </div>
          <div className="flex flex-col gap-1 mt-auto">
            <p className="type-h3 text-foreground leading-none">{k.value}</p>
            <p className="type-caption text-[var(--text-default-disabled)]">{k.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Insight Row ──────────────────────────────────────────────────────────────

function InsightRow({
  insight,
  isLast,
  isSelected,
  onSelect,
}: {
  insight: Insight;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[insight.type as keyof typeof CATEGORY_CONFIG];
  if (!config) return null;
  const { color, bg, Icon, tagVariant, tagText, primaryAction } = config;

  const confidenceColor =
    insight.confidence >= 85 ? "var(--text-success-primary)"
    : insight.confidence >= 70 ? "var(--text-warning-primary)"
    : "var(--text-danger-primary)";

  const isRisk = insight.type === "Risk Alert";

  return (
    <div
      className={`cursor-pointer transition-colors ${isSelected ? "bg-primary-action-light/60" : "hover:bg-muted/40"} ${!isLast ? "border-b border-border" : ""}`}
      onClick={() => onSelect(insight.id)}
    >
      {/* ── Mobile layout ── */}
      <div className="flex flex-col gap-2 px-4 py-4 lg:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
            <Icon size={13} weight="duotone" style={{ color }} />
          </div>
          <Tag text={tagText} variant={tagVariant} size="small" />
          <span className="text-[11px] font-medium text-muted-foreground">{insight.tier}</span>
        </div>
        <p className="text-[14px] font-semibold text-foreground leading-snug">{insight.clientName}</p>
        <p className="type-body-2 text-muted-foreground leading-snug">{insight.insight}</p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: confidenceColor }}>{insight.confidence}% confidence</span>
          {!isRisk && <span className="text-[11px] font-medium text-success">{insight.revenueImpact} potential</span>}
          {isRisk && <span className="text-[11px] font-medium" style={{ color: "var(--text-danger-primary)" }}>Risk Reduction</span>}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="plain" size="sm" onClick={(e) => e.stopPropagation()}>Snooze 24h</Button>
          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>{primaryAction}</Button>
        </div>
      </div>

      {/* ── Desktop layout (original) ── */}
      <div className="hidden lg:flex items-start gap-4 px-5 py-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: bg }}>
          <Icon size={18} weight="duotone" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Tag text={tagText} variant={tagVariant} size="small" />
            <span className="text-[11px] font-medium text-muted-foreground">{insight.tier}</span>
          </div>
          <p className="text-[14px] font-semibold text-foreground leading-snug">{insight.clientName}</p>
          <p className="type-body-2 text-muted-foreground leading-snug">{insight.insight}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: confidenceColor }}>{insight.confidence}% confidence</span>
            {!isRisk && <span className="text-[11px] font-medium text-success">{insight.revenueImpact} potential</span>}
            {isRisk && <span className="text-[11px] font-medium" style={{ color: "var(--text-danger-primary)" }}>Risk Reduction</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0 items-end">
          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>{primaryAction}</Button>
          <Button variant="plain" size="sm" onClick={(e) => e.stopPropagation()}>Snooze 24h</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Insight Drawer Panel ─────────────────────────────────────────────────────

function InsightDrawerPanel({ insight }: { insight: Insight }) {
  const config = CATEGORY_CONFIG[insight.type as keyof typeof CATEGORY_CONFIG];
  const client = mockClients.find((c) => c.id === insight.clientId);
  const detail = client ? mockClientDetails[client.id] : null;

  const tierVariant = client?.tier === "UHNW" ? ("blue" as const) : ("gray" as const);
  const { color, bg, Icon, tagVariant, tagText, primaryAction } = config ?? {
    color: "var(--text-default-secondary)", bg: "var(--bg-default-secondary)", Icon: SparkleIcon,
    tagVariant: "gray" as const, tagText: insight.type, primaryAction: "View",
  };

  const confidenceColor =
    insight.confidence >= 85 ? "var(--text-success-primary)"
    : insight.confidence >= 70 ? "var(--text-warning-primary)"
    : "var(--text-danger-primary)";

  const isRisk = insight.type === "Risk Alert";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials={getInitials(insight.clientName)} size="m" />
          <div className="flex-1 min-w-0">
            <p className="type-subtitle-1 text-foreground leading-tight">{insight.clientName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {client && <Tag text={client.tier} variant={tierVariant} size="small" />}
              {client && <Tag text={client.riskProfile} variant="gray" size="small" />}
            </div>
          </div>
          <div className="w-8 shrink-0" />
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <PhoneIcon size={20} />,        label: "Call" },
            { icon: <ChatCircleIcon size={20} />,   label: "Message" },
            { icon: <FileTextIcon size={20} />,     label: "Proposal" },
            { icon: <CalendarPlusIcon size={20} />, label: "Meet" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--bg-default-secondary)] border border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] transition-colors cursor-pointer"
            >
              <span className="text-primary-action">{icon}</span>
              <span className="text-[11px] font-medium text-primary-action leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 px-5 py-5 flex-1 overflow-y-auto bg-[var(--bg-default-secondary)]">
        {/* 1. KPI grid */}
        {client && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total AUM",   value: client.aum,                sub: null,                                           accent: null },
              { label: "Cash Idle",   value: `${client.cashIdlePct}%`,  sub: client.cashIdlePct > 20 ? "Above 10% target" : null, accent: client.cashIdlePct > 20 ? "text-warning" : "text-success" },
              { label: "YTD P&L",    value: client.plYtd,               sub: null,                                           accent: client.plPositive ? "text-success" : "text-destructive" },
              { label: "Risk Profile",value: client.riskProfile,         sub: null,                                           accent: null },
            ].map((kpi) => (
              <div key={kpi.label} className="flex flex-col justify-between gap-2 p-3 rounded-xl bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] min-h-[80px]">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">{kpi.label}</p>
                <div className="flex flex-col gap-0.5">
                  <p className={`type-subtitle-1 font-bold leading-tight ${kpi.accent ?? "text-foreground"}`}>{kpi.value}</p>
                  {kpi.sub && <p className={`text-[10px] font-semibold leading-none ${kpi.accent ?? "text-muted-foreground"}`}>{kpi.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. AI Insight */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">AI Insight</p>
            <div className="inline-flex items-center gap-1 bg-primary-action/10 rounded-full px-1.5 py-0.5">
              <SparkleIcon size={9} className="text-primary-action" weight="fill" />
              <span className="text-[9px] font-bold text-primary-action">AI</span>
            </div>
            <Tag text={tagText} variant={tagVariant} size="small" />
          </div>
          <div className="bg-[var(--primary-action-light)] border border-[var(--border-brand-primary)] rounded-xl px-3 py-3 flex flex-col gap-3">
            <p className="text-[12px] text-primary-action leading-relaxed">{insight.insight}</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">Confidence</p>
                <span className="text-[13px] font-bold leading-none" style={{ color: confidenceColor }}>
                  {insight.confidence}%
                </span>
              </div>
              {!isRisk && (
                <div className="flex flex-col gap-0.5 items-end">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">Revenue Potential</p>
                  <div className="flex items-center gap-1">
                    <CurrencyCircleDollarIcon size={13} weight="fill" className="text-success" />
                    <span className="text-[13px] font-bold text-success leading-none">{insight.revenueImpact}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Portfolio Allocation — individual bars per slice */}
        {detail?.allocationData && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Asset Allocation</p>
            <div className="bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] rounded-xl px-3 py-3 flex flex-col gap-3">
              {detail.allocationData.map((slice) => (
                <div key={slice.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-foreground">{slice.name}</span>
                    <span className="text-[12px] font-bold text-foreground">{slice.value}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--bg-default-secondary)]">
                    <div className="h-full rounded-full" style={{ width: `${slice.value}%`, backgroundColor: slice.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-[var(--border-default)] px-5 py-4">
        <Button variant="outline" size="lg" className="w-full" leftIcon={<UserIcon size={16} />}>
          View Full Profile
        </Button>
      </div>
    </div>
  );
}

// ─── AI Summary Card ──────────────────────────────────────────────────────────

function AiSummaryCard() {
  return (
    <Card variant="default" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SparkleIcon size={16} weight="duotone" className="text-foreground" />
        <p className="type-subtitle-1 text-foreground">Today's AI Summary</p>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        8 active insights across your book. Focus on{" "}
        <span className="font-semibold text-foreground">Somchai</span> and{" "}
        <span className="font-semibold text-foreground">Nattaporn</span> — highest revenue potential at ฿ 5.6M combined.
      </p>
      <div className="flex flex-col gap-2 pt-1 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Model updated</span>
          <span className="text-[11px] font-medium text-foreground">Today, 08:30</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Avg confidence</span>
          <span className="text-[11px] font-semibold text-success">83%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Clients analyzed</span>
          <span className="text-[11px] font-medium text-foreground">24</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Logic Rules Sidebar ──────────────────────────────────────────────────────

function LogicRulesSidebar() {
  const [highPriorityThreshold, setHighPriorityThreshold] = useState("80");
  const [revenueMin, setRevenueMin] = useState("0.5");
  const [engagementDays, setEngagementDays] = useState("14");
  const [toggles, setToggles] = useState({ high: true, revenue: true, engagement: true });
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; status: "success" }>>([]);

  const triggerSave = () => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message: "Settings saved", status: "success" }]);
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    triggerSave();
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
        <GearSixIcon size={15} className="text-muted-foreground" />
        <p className="text-[13px] font-semibold text-foreground flex-1">AI Logic Rules</p>
        <Tag text="Active" variant="green" size="small" />
      </div>

      {/* Rules */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground">High Priority threshold</p>
            <p className="text-[11px] text-muted-foreground">AI Score ≥</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={highPriorityThreshold}
              onChange={(e) => setHighPriorityThreshold(e.target.value)}
              onBlur={triggerSave}
              className="w-12 text-center text-[13px] font-semibold border border-border rounded-lg py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Toggle label="" checked={toggles.high} onChange={() => handleToggle("high")} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground">Revenue minimum</p>
            <p className="text-[11px] text-muted-foreground">฿M impact floor</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={revenueMin}
              onChange={(e) => setRevenueMin(e.target.value)}
              onBlur={triggerSave}
              className="w-12 text-center text-[13px] font-semibold border border-border rounded-lg py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Toggle label="" checked={toggles.revenue} onChange={() => handleToggle("revenue")} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground">Engagement alert</p>
            <p className="text-[11px] text-muted-foreground">Days without contact</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={engagementDays}
              onChange={(e) => setEngagementDays(e.target.value)}
              onBlur={triggerSave}
              className="w-12 text-center text-[13px] font-semibold border border-border rounded-lg py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Toggle label="" checked={toggles.engagement} onChange={() => handleToggle("engagement")} />
          </div>
        </div>
      </div>

      <Toaster
        items={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

// ─── AI Model Stats ───────────────────────────────────────────────────────────

function AiModelStats() {
  const stats = [
    { label: "Product Match", count: 3, color: "var(--text-brand-primary)" },
    { label: "Risk Alert", count: 2, color: "var(--text-danger-primary)" },
    { label: "Engagement", count: 2, color: "var(--text-warning-primary)" },
    { label: "Portfolio", count: 1, color: "var(--text-brand-secondary)" },
  ];

  return (
    <Card variant="default" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BrainIcon size={15} className="text-muted-foreground" />
        <p className="type-subtitle-1 text-foreground">Breakdown</p>
      </div>
      <div className="flex flex-col gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[12px] text-muted-foreground flex-1">{s.label}</span>
            <span className="text-[12px] font-semibold text-foreground tabular-nums">{s.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiInsightsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSelectInsight(id: string) {
    setSelectedInsightId(id);
    setDrawerOpen(true);
  }

  const selectedInsight = mockInsights.find((i) => i.id === selectedInsightId);

  const tabItems = [
    { id: "all", title: "All" },
    { id: "product", title: "Product Match", notification: 4 },
    { id: "risk", title: "Risk Alert", notification: 2 },
    { id: "engagement", title: "Engagement", notification: 1 },
    { id: "portfolio", title: "Portfolio", notification: 1 },
  ];

  const filteredInsights = mockInsights.filter((insight) => {
    if (activeTab === "all") return true;
    if (activeTab === "product") return insight.type === "Product Match";
    if (activeTab === "risk") return insight.type === "Risk Alert";
    if (activeTab === "engagement") return insight.type === "Engagement";
    if (activeTab === "portfolio") return insight.type === "Portfolio";
    return true;
  });

  const sortedInsights =
    sortBy === "priority"
      ? [...filteredInsights].sort((a, b) => b.confidence - a.confidence)
      : filteredInsights;

  return (
    <>
    <div className="flex flex-col gap-6">
      {/* KPI Bar */}
      <KpiBar />

      {/* Body: 2-col */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
        {/* Main feed */}
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">
          <div className="scrollable-tabs transparent-tabs">
            <TabGroup
              items={tabItems}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="type-caption text-muted-foreground">Sort:</span>
              <Chip
                label="AI Priority"
                type="single"
                size="small"
                selected={sortBy === "priority"}
                onClick={() => setSortBy("priority")}
              />
              <Chip
                label="Most Recent"
                type="single"
                size="small"
                selected={sortBy === "recent"}
                onClick={() => setSortBy("recent")}
              />
            </div>
            <span className="type-caption text-muted-foreground">
              {sortedInsights.length} insights
            </span>
          </div>

          {/* Insight feed */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden w-full max-w-full">
            {sortedInsights.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="type-body-2 text-muted-foreground">No insights in this category</p>
              </div>
            ) : (
              sortedInsights.map((insight, i) => (
                <InsightRow
                  key={insight.id}
                  insight={insight}
                  isLast={i === sortedInsights.length - 1}
                  isSelected={selectedInsightId === insight.id}
                  onSelect={handleSelectInsight}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-4">
          <AiSummaryCard />
          <AiModelStats />
          <LogicRulesSidebar />
        </div>
      </div>
    </div>

    {/* Client Profile Drawer */}
    <Sheet
      modal={false}
      open={drawerOpen}
      onOpenChange={(open) => {
        setDrawerOpen(open);
        if (!open) setSelectedInsightId(null);
      }}
    >
      <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] overflow-y-auto p-0">
        {selectedInsight && <InsightDrawerPanel insight={selectedInsight} />}
      </SheetContent>
    </Sheet>
    </>
  );
}
