"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TabGroup,
  Button,
  Avatar,
  Tag,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Pagination,
  SearchInput,
  Tooltip,
} from "@sarunyu/system-one";
import {
  PhoneIcon,
  ChatCircleIcon,
  UserIcon,
  SparkleIcon,
  CurrencyCircleDollarIcon,
  CalendarPlusIcon,
  ClipboardTextIcon,
} from "@phosphor-icons/react";
import { mockClients } from "@/lib/mock-data";
import { useClients, usePipelineDeals, useNBAActions } from "@/hooks/use-api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AssetSummarySection, type AssetHeroSummary } from "@/components/AssetSummarySection";

type Client = (typeof mockClients)[number];
type InsightCategory = "opportunity" | "risk" | "stable" | "match";

// ─── Static data ──────────────────────────────────────────────────────────────

const clientInsights: Record<
  string,
  { title: string; description: string; category: InsightCategory }
> = {
  "1": {
    title: "High Deploy Opportunity",
    description:
      "฿81M idle cash (18%). Pitch Structured Note for yield enhancement.",
    category: "opportunity",
  },
  "2": {
    title: "Compliance Risk",
    description:
      "KYC expires in 14 days. Portfolio -3.1% YTD requires immediate review.",
    category: "risk",
  },
  "3": {
    title: "Stable Portfolio",
    description:
      "On track for annual targets. Conservative allocation performing well.",
    category: "stable",
  },
  "4": {
    title: "Product Match",
    description:
      "New Structured Note (8.5% p.a.) — best fit for UHNW risk profile.",
    category: "match",
  },
  "5": {
    title: "Re-engage Client",
    description: "No contact in 14 days. Engagement score dropped 22 points.",
    category: "risk",
  },
  "6": {
    title: "Cross-sell Candidate",
    description: "Low cash drag, strong P&L. Ideal for Fixed Income upsell.",
    category: "match",
  },
  "7": {
    title: "Top Performer",
    description: "+22.1% YTD. Leverage success story — referral opportunity.",
    category: "opportunity",
  },
  "8": {
    title: "Deploy Idle Cash",
    description: "28% cash idle. Ready for DCA Equity Fund pitch this week.",
    category: "opportunity",
  },
};

const statusConfig: Record<
  string,
  { dot: string; label: string; contactColor?: string }
> = {
  success: { dot: "bg-[var(--bg-success-primary)]", label: "Healthy" },
  error: {
    dot: "bg-[var(--bg-danger-primary)]",
    label: "Urgent Action",
    contactColor: "text-destructive",
  },
  hold: { dot: "bg-[var(--bg-warning-primary)]", label: "Needs Attention" },
  processing: { dot: "bg-[var(--bg-brand-primary)]", label: "In Progress" },
};

const insightBadgeStyle: Record<InsightCategory, { bg: string; text: string }> =
  {
    opportunity: {
      bg: "bg-[var(--bg-warning-soft)]",
      text: "text-[var(--text-warning-primary)]",
    },
    risk: { bg: "bg-[var(--bg-danger-light)]", text: "text-destructive" },
    stable: {
      bg: "bg-[var(--bg-default-secondary)]",
      text: "text-muted-foreground",
    },
    match: { bg: "bg-[var(--bg-brand-light)]", text: "text-primary-action" },
  };

type AssetSlice = { label: string; pct: number; color: string };
type Interaction = {
  title: string;
  description: string;
  timeAgo: string;
  dotColor: string;
};

const assetAllocation: Record<string, AssetSlice[]> = {
  "1": [
    { label: "Equities", pct: 62, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 20,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 18, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "2": [
    { label: "Equities", pct: 45, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 38,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 17, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "3": [
    { label: "Equities", pct: 30, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 55,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 15, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "4": [
    { label: "Equities", pct: 70, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 15,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 15, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "5": [
    { label: "Equities", pct: 50, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 22,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 28, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "6": [
    { label: "Equities", pct: 40, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 48,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 12, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "7": [
    { label: "Equities", pct: 78, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 10,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 12, color: "bg-[var(--bg-warning-primary)]" },
  ],
  "8": [
    { label: "Equities", pct: 55, color: "bg-[var(--bg-default-dark)]" },
    {
      label: "Fixed Income",
      pct: 17,
      color: "bg-[var(--bg-default-secondary-medium)]",
    },
    { label: "Cash", pct: 28, color: "bg-[var(--bg-warning-primary)]" },
  ],
};

const recentInteractions: Record<string, Interaction[]> = {
  "1": [
    {
      title: "Client Logged In",
      description: "Viewed performance dashboard and downloaded tax forms.",
      timeAgo: "Yesterday, 4:30 PM",
      dotColor: "bg-[var(--bg-brand-primary)]",
    },
    {
      title: "Q3 Portfolio Review (Zoom)",
      description:
        "Discussed tech sector exposure. Client happy with YTD returns.",
      timeAgo: "14 days ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "2": [
    {
      title: "KYC Renewal Reminder Sent",
      description: "Automated email sent for upcoming KYC expiry.",
      timeAgo: "2 days ago",
      dotColor: "bg-[var(--bg-warning-primary)]",
    },
    {
      title: "Phone Call",
      description: "Brief check-in. Client asked about bond market outlook.",
      timeAgo: "3 weeks ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "3": [
    {
      title: "Monthly Statement Viewed",
      description:
        "Client accessed and downloaded monthly portfolio statement.",
      timeAgo: "3 days ago",
      dotColor: "bg-[var(--bg-brand-primary)]",
    },
    {
      title: "Annual Review Meeting",
      description:
        "Reviewed conservative allocation. Client satisfied with stability.",
      timeAgo: "1 month ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "4": [
    {
      title: "Structured Note Pitch",
      description:
        "Presented new 8.5% p.a. Structured Note. Client interested.",
      timeAgo: "1 day ago",
      dotColor: "bg-[var(--bg-brand-primary)]",
    },
    {
      title: "Portfolio Rebalancing",
      description: "Executed rebalancing to reduce equity overweight.",
      timeAgo: "2 weeks ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "5": [
    {
      title: "No Recent Contact",
      description: "Engagement score has dropped. Last activity was app login.",
      timeAgo: "14 days ago",
      dotColor: "bg-[var(--bg-danger-primary)]",
    },
    {
      title: "Product Brochure Opened",
      description: "Client opened bond fund brochure sent via email.",
      timeAgo: "1 month ago",
      dotColor: "bg-[var(--bg-default-secondary-medium)]",
    },
  ],
  "6": [
    {
      title: "Fixed Income Proposal Sent",
      description: "Emailed Fixed Income upsell proposal for review.",
      timeAgo: "Today, 10:00 AM",
      dotColor: "bg-[var(--bg-brand-primary)]",
    },
    {
      title: "Video Call",
      description:
        "Discussed interest rate environment and bond ladder strategy.",
      timeAgo: "10 days ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "7": [
    {
      title: "Referral Discussion",
      description:
        "Client agreed to refer two colleagues for wealth management.",
      timeAgo: "Yesterday",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
    {
      title: "Q3 Review Meeting",
      description:
        "Celebrated +22.1% YTD performance. Discussed year-end strategy.",
      timeAgo: "3 weeks ago",
      dotColor: "bg-[var(--bg-success-primary)]",
    },
  ],
  "8": [
    {
      title: "DCA Fund Proposal Viewed",
      description: "Client opened proposal and spent 4 min reviewing.",
      timeAgo: "2 days ago",
      dotColor: "bg-[var(--bg-brand-primary)]",
    },
    {
      title: "Cash Deployment Alert",
      description: "Notified client of high cash drag vs benchmark.",
      timeAgo: "1 week ago",
      dotColor: "bg-[var(--bg-warning-primary)]",
    },
  ],
};

const insightById = Object.fromEntries(
  mockClients.map((c) => [c.id, clientInsights[c.id]])
);
const allocationById = Object.fromEntries(
  mockClients.map((c) => [c.id, assetAllocation[c.id] ?? []])
);
const interactionsById = Object.fromEntries(
  mockClients.map((c) => [c.id, recentInteractions[c.id] ?? []])
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function computeCashAmount(aum: string, pct: number): string {
  const match = aum.match(/([\d.]+)/);
  if (!match) return "";
  const cashM = (parseFloat(match[1]) * pct) / 100;
  return cashM >= 1
    ? `฿ ${cashM % 1 === 0 ? cashM.toFixed(0) : cashM.toFixed(1)}M`
    : `฿ ${(cashM * 1000).toFixed(0)}k`;
}

const LINE_AVAILABLE_RATIO = 320_000 / 9_400_000;

function parseAumToThb(aum: string): number {
  const match = aum.match(/([\d.]+)/);
  if (!match) return 0;
  return parseFloat(match[1]) * 1_000_000;
}

function parsePlYtdPct(plYtd: string): number {
  const match = plYtd.match(/([+-]?[\d.]+)/);
  return match ? Math.abs(parseFloat(match[1])) : 0;
}

function formatThbAmount(amount: number, withSign = false): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!withSign) return formatted;
  return `${amount >= 0 ? "+" : "-"}${formatted}`;
}

function formatThaiUpdatedAt(now: Date): { date: string; time: string } {
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

function buildHeroSummaryFromClients(clients: Client[]): AssetHeroSummary {
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

// ─── AI Score Badge ───────────────────────────────────────────────────────────

function AiScoreBadge({
  score,
  category,
}: {
  score: number;
  category: InsightCategory;
}) {
  const s = insightBadgeStyle[category];
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}
    >
      <span className={`text-[15px] font-bold leading-none ${s.text}`}>
        {score}
      </span>
    </div>
  );
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────

function ClientDetailPanel({
  client,
  onViewFull,
}: {
  client: Client;
  onViewFull: () => void;
}) {
  const pipelineDeals = usePipelineDeals();
  const nbaActions = useNBAActions();
  const deals = pipelineDeals.filter(
    (d) =>
      d.clientId === client.id &&
      d.stage !== "Closed Won" &&
      d.stage !== "Closed Lost",
  );
  const nba = nbaActions.find((a) => a.clientId === client.id);
  const insight = insightById[client.id] ?? { title: "—", description: "—", category: "stable" as InsightCategory };
  const allocation = allocationById[client.id] ?? [];
  const interactions = interactionsById[client.id] ?? [];
  const cashHighlight = client.cashIdlePct > 20;
  const cashAmount = computeCashAmount(client.aum, client.cashIdlePct);

  const kpis = [
    { label: "Total AUM", value: client.aum, sub: null, accent: null },
    {
      label: "Cash Idle",
      value: `${client.cashIdlePct}%`,
      sub: `${cashAmount} of portfolio`,
      accent: cashHighlight ? "text-warning" : "text-success",
    },
    {
      label: "P&L YTD",
      value: client.plYtd,
      sub: null,
      accent: client.plPositive ? "text-success" : "text-destructive",
    },
    {
      label: "AI Score",
      value: String(client.aiScore),
      sub: insight.title,
      accent: insightBadgeStyle[insight.category].text,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials={getInitials(client.name)} size="m" />
          <div className="flex-1 min-w-0">
            <p className="type-subtitle-1 text-foreground leading-tight">
              {client.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag
                text={client.tier}
                variant={client.tier === "UHNW" ? "blue" : "gray"}
                size="small"
              />
              <Tag text={client.riskProfile} variant="gray" size="small" />
            </div>
          </div>
          <div className="w-8 shrink-0" />
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <PhoneIcon size={20} />, label: "Call" },
            { icon: <ChatCircleIcon size={20} />, label: "Message" },
            { icon: <ClipboardTextIcon size={20} />, label: "Proposal" },
            { icon: <CalendarPlusIcon size={20} />, label: "Meet" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--bg-default-secondary)] border border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] transition-colors cursor-pointer"
            >
              <span className="text-primary-action">{icon}</span>
              <span className="text-[11px] font-medium text-primary-action leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 px-5 py-5 flex-1 overflow-y-auto bg-[var(--bg-default-secondary)]">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex flex-col justify-between gap-2 p-3 rounded-xl bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] min-h-[80px]"
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                {kpi.label}
              </p>
              <div className="flex flex-col gap-0.5">
                <p
                  className={`type-subtitle-1 font-bold leading-tight ${kpi.accent ?? "text-foreground"}`}
                >
                  {kpi.value}
                </p>
                {kpi.sub && (
                  <p
                    className={`text-[10px] font-semibold leading-none ${kpi.accent ?? "text-muted-foreground"}`}
                  >
                    {kpi.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Next Best Actions */}
        {nba && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                AI Next Best Actions
              </p>
              <div className="inline-flex items-center gap-1 bg-primary-action/10 rounded-full px-1.5 py-0.5">
                <SparkleIcon
                  size={9}
                  className="text-primary-action"
                  weight="fill"
                />
                <span className="text-[9px] font-bold text-primary-action">
                  AI
                </span>
              </div>
            </div>
            <div className="bg-[var(--primary-action-light)] border border-[var(--border-brand-primary)] rounded-xl px-3 py-3 flex flex-col gap-3">
              <p className="text-[12px] text-primary-action leading-relaxed">
                {nba.insight}
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                    Est. Revenue
                  </p>
                  <div className="flex items-center gap-1">
                    <CurrencyCircleDollarIcon
                      size={13}
                      weight="fill"
                      className="text-[var(--text-success-primary)]"
                    />
                    <span className="text-[13px] font-bold text-[var(--text-success-primary)] leading-none">
                      {nba.revenueImpact.replace(" est. revenue", "")}
                    </span>
                  </div>
                </div>
                <Button variant="primary" size="sm">
                  {nba.action}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Pipeline */}
        {deals.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Active Pipeline
            </p>
            <div className="flex flex-col gap-0.5">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between gap-2 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground leading-tight truncate">
                      {deal.product}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {deal.stage} · {deal.probability}% probability
                    </p>
                  </div>
                  <p className="text-[12px] font-bold text-foreground shrink-0">
                    {deal.dealSize}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset Allocation */}
        {allocation.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Asset Allocation
            </p>
            <div className="bg-[var(--bg-default-primary-medium)] border border-[var(--border-default)] rounded-xl px-3 py-3 flex flex-col gap-3">
              {allocation.map((slice) => (
                <div key={slice.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-foreground">
                      {slice.label}
                    </span>
                    <span className="text-[12px] font-bold text-foreground">
                      {slice.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--bg-default-secondary)]">
                    <div
                      className={`h-full rounded-full ${slice.color}`}
                      style={{ width: `${slice.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Interactions */}
        {interactions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Interaction
            </p>
            <div className="flex flex-col">
              {interactions.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${item.dotColor}`}
                    />
                    {i < interactions.length - 1 && (
                      <div className="w-px flex-1 bg-[var(--border-default)] my-1" />
                    )}
                  </div>
                  <div
                    className={`flex flex-col gap-0.5 ${i < interactions.length - 1 ? "pb-4" : ""}`}
                  >
                    <p className="text-[12px] font-semibold text-foreground leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-[var(--border-default)] px-5 py-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          leftIcon={<UserIcon size={16} />}
          onClick={onViewFull}
        >
          View Full Profile
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortDir = "none" | "asc" | "desc";
type SortKey =
  | "name"
  | "aum"
  | "cashIdlePct"
  | "plYtd"
  | "aiScore"
  | "status"
  | null;

const PAGE_SIZE = 10;

export default function ClientHubPage() {
  const router = useRouter();
  const clients = useClients();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [currentPage, setCurrentPage] = useState(1);

  const tabItems = [
    { id: "all", title: "All Clients" },
    {
      id: "priority",
      title: "High Priority",
      notification: clients.filter((c) => c.aiScore >= 90).length,
    },
    {
      id: "attention",
      title: "Requires Attention",
      notification: clients.filter(
        (c) => c.status === "error" || c.status === "hold",
      ).length,
    },
    { id: "uhnw", title: "UHNW Tier" },
  ];

  const dirFor = (k: SortKey): SortDir => (sortKey === k ? sortDir : "none");
  const handleSort = (k: SortKey) => (next: SortDir) => {
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    let list = clients;
    if (activeTab === "priority") list = list.filter((c) => c.aiScore >= 90);
    else if (activeTab === "attention")
      list = list.filter((c) => c.status === "error" || c.status === "hold");
    else if (activeTab === "uhnw") list = list.filter((c) => c.tier === "UHNW");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q) ||
          c.riskProfile.toLowerCase().includes(q),
      );
    }

    const key = sortKey as keyof Client | null;
    const dir = sortDir;
    if (key && dir !== "none") {
      list = [...list].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        return av < bv
          ? dir === "asc"
            ? -1
            : 1
          : av > bv
            ? dir === "asc"
              ? 1
              : -1
            : 0;
      });
    }

    return list;
  }, [activeTab, search, sortKey, sortDir, clients]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const heroSummary = useMemo(() => {
    const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    return buildHeroSummaryFromClients(visible);
  }, [sorted, safePage]);

  function openClient(client: Client) {
    setSelectedClient(client);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Tabs — hidden for now */}
        <div className="hidden">
          <TabGroup
            items={tabItems}
            activeId={activeTab}
            onChange={(id) => {
              setActiveTab(id);
              setCurrentPage(1);
            }}
            size="md"
          />
        </div>

        <AssetSummarySection heroSummary={heroSummary} />

        <section className="-mx-4 lg:-mx-6 -mb-4 lg:-mb-6 px-4 lg:px-6 flex flex-col gap-3 pt-4 lg:pt-6 pb-6 bg-white rounded-t-[16px] lg:rounded-t-2xl">
          <div className="flex justify-end lg:justify-end">
            <div className="w-full lg:w-56 lg:max-w-none">
              <SearchInput
                placeholder="Search clients…"
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
                onClear={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                size="sm"
              />
            </div>
          </div>

        {/* Table */}
        <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
          <Table className="table-fixed min-w-[700px]">
            <TableHead>
              <TableRow>
                <TableHeaderCell
                  className="w-[20%]"
                  sortDirection={dirFor("name")}
                  onSortChange={handleSort("name")}
                >
                  Client & Segment
                </TableHeaderCell>
                <TableHeaderCell
                  className="w-[20%]"
                  sortDirection={dirFor("aum")}
                  onSortChange={handleSort("aum")}
                >
                  AUM / Cash
                </TableHeaderCell>
                <TableHeaderCell
                  className="w-[16%]"
                  sortDirection={dirFor("plYtd")}
                  onSortChange={handleSort("plYtd")}
                >
                  P&L (YTD)
                </TableHeaderCell>
                <TableHeaderCell
                  sortDirection={dirFor("aiScore")}
                  onSortChange={handleSort("aiScore")}
                >
                  AI Insight & Score
                </TableHeaderCell>
                <TableHeaderCell
                  className="w-[18%]"
                  sortDirection={dirFor("status")}
                  onSortChange={handleSort("status")}
                >
                  Status & Contact
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((client) => {
                const insight = insightById[client.id] ?? { title: "—", description: "—", category: "stable" as InsightCategory };
                const cashAmount = computeCashAmount(
                  client.aum,
                  client.cashIdlePct,
                );
                const cashHighlight = client.cashIdlePct > 20;

                return (
                  <Tooltip
                    key={client.id}
                    content="View client profile"
                    side="top"
                    delayDuration={400}
                  >
                    <TableRow
                      className="cursor-pointer"
                      hoverable
                      onClick={() => openClient(client)}
                    >
                      {/* CLIENT & SEGMENT */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            type="text"
                            initials={getInitials(client.name)}
                            size="s"
                          />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[14px] font-semibold text-foreground leading-tight">
                              {client.name}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Tag
                                text={client.tier}
                                variant={
                                  client.tier === "UHNW" ? "blue" : "gray"
                                }
                                size="small"
                              />
                              <span className="text-[12px] text-muted-foreground">
                                {client.riskProfile}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* AUM / CASH */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[14px] font-semibold text-foreground">
                            {client.aum}
                          </p>
                          <div
                            className={`flex items-center gap-1 ${cashHighlight ? "text-warning" : "text-muted-foreground"}`}
                          >
                            {cashHighlight && (
                              <CurrencyCircleDollarIcon
                                size={12}
                                weight="fill"
                              />
                            )}
                            <span className="text-[12px]">
                              {cashAmount} Cash ({client.cashIdlePct}%)
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* P&L (YTD) */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <p
                            className={`text-[14px] font-semibold leading-tight ${client.plPositive ? "text-success" : "text-destructive"}`}
                          >
                            {client.plYtd}
                          </p>
                          <p className="text-[12px] text-muted-foreground">
                            {client.riskProfile} Risk
                          </p>
                        </div>
                      </TableCell>

                      {/* AI INSIGHT & SCORE */}
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <AiScoreBadge
                            score={client.aiScore}
                            category={insight.category}
                          />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                              {insight.title}
                            </p>
                            <p className="text-[12px] text-muted-foreground leading-tight truncate">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* STATUS & CONTACT */}
                      <TableCell>
                        {(() => {
                          const s =
                            statusConfig[client.status] ?? statusConfig.success;
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}
                                />
                                <p className="text-[13px] font-semibold text-foreground leading-tight">
                                  {s.label}
                                </p>
                              </div>
                              <p
                                className={`text-[12px] leading-tight ${s.contactColor ?? "text-muted-foreground"}`}
                              >
                                Last contact: {client.lastContact}
                              </p>
                            </div>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-4">
          <p className="text-[12px] text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min(safePage * PAGE_SIZE, sorted.length)}
            </span>
            {" of "}
            <span className="font-medium text-foreground">
              {sorted.length}
            </span>{" "}
            clients
          </p>
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </div>
        </section>
      </div>

      {/* Client Detail Drawer */}
      <Sheet
        modal={false}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedClient(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] sm:max-w-[420px] overflow-y-auto p-0"
        >
          {selectedClient && (
            <ClientDetailPanel
              client={selectedClient}
              onViewFull={() => router.push(`/client/${selectedClient.id}`)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
