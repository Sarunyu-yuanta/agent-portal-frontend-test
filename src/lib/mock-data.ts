import clientsRaw from "@/data/clients.json";
import nbaActionsRaw from "@/data/nba-actions.json";
import pipelineDealsRaw from "@/data/pipeline-deals.json";
import miniKanbanRaw from "@/data/mini-kanban.json";
import insightsRaw from "@/data/insights.json";
import complianceAlertsRaw from "@/data/compliance-alerts.json";
import kycDataRaw from "@/data/kyc-data.json";
import houseViewStrategiesRaw from "@/data/house-view-strategies.json";
import performanceRaw from "@/data/performance.json";
import clientDetailsRaw from "@/data/client-details.json";
import notificationsRaw from "@/data/notifications.json";

// ── Narrow string-literal types that JSON cannot express ──────────────────────

type ClientStatus    = "success" | "error" | "hold" | "processing";
type PriorityVariant = "red" | "yellow" | "blue";
type ComplianceType  = "critical" | "warning";
type KYCStatus       = "success" | "error" | "hold" | "processing";
type ConvictionVariant = "green" | "yellow" | "red";
type NotificationType  = "icon";
type PerformanceStatus = "Lagging" | "On Track";

// ── Single source of truth: client name lives only in clients.json ────────────

export const mockClients = clientsRaw as Array<
  Omit<(typeof clientsRaw)[number], "status"> & { status: ClientStatus }
>;

// Lookup map — used below to enrich all other datasets
const nameById = Object.fromEntries(mockClients.map((c) => [c.id, c.name]));

// Abbreviated name: "Somchai Rattanakul" → "Somchai R."
const shortName = (id: string) => {
  const full = nameById[id] ?? id;
  const parts = full.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
};

// ── Enriched exports (clientId → clientName/client derived at import time) ────

export const mockNBAActions = nbaActionsRaw.map((a) => ({
  ...a,
  clientName: nameById[a.clientId] ?? a.clientId,
  priorityVariant: a.priorityVariant as PriorityVariant,
}));

export const mockPipelineDeals = pipelineDealsRaw.map((d) => ({
  ...d,
  client: nameById[d.clientId] ?? d.clientId,
}));

export const mockMiniKanban = miniKanbanRaw.map((k) => ({
  ...k,
  client: shortName(k.clientId),
}));

export const mockInsights = insightsRaw.map((i) => ({
  ...i,
  clientName: nameById[i.clientId] ?? i.clientId,
}));

export const mockKYCData = kycDataRaw.map((k) => ({
  ...k,
  client: nameById[k.clientId] ?? k.clientId,
  kycStatus: k.kycStatus as KYCStatus,
}));

export const mockComplianceAlerts = complianceAlertsRaw.map((a) => ({
  ...a,
  // "Unknown" entries have no clientId — fall back to the literal "client" field
  client: a.clientId ? (nameById[a.clientId] ?? a.clientId) : (a.client ?? "Unknown"),
  type: a.type as ComplianceType,
}));

export const mockHouseViewStrategies = houseViewStrategiesRaw as Array<
  Omit<(typeof houseViewStrategiesRaw)[number], "convictionVariant"> & { convictionVariant: ConvictionVariant }
>;

export const mockPerformanceData = performanceRaw as typeof performanceRaw & {
  revenueYtd:         { status: PerformanceStatus };
  aumGrowth:          { status: PerformanceStatus };
  netNewMoney:        { status: PerformanceStatus };
  productPenetration: { status: PerformanceStatus };
};

// ── ClientDetail types (kept here for page imports) ───────────────────────────

type AllocationSlice = { name: string; value: number; fill: string };
type AllocationKpi   = { label: string; value: string; ytd: string; ytdPositive: boolean; warning?: string };
type AssetAllocationSlice = { label: string; percent: number; statusIcon: string };
type AssetSummary    = {
  netValue: string;
  changeAmount: string;
  changePercent: string;
  changePositive: boolean;
  lineAvailable: string;
  cash: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  allocationSlices?: AssetAllocationSlice[];
};
type Holding         = { asset: string; value: string; pnl: string; pnlPct: string; positive: boolean; pct: string };
type AIAlert         = { title: string; message: string; primaryAction: string; secondaryAction: string };

export type ClientDetail = {
  assetSummary?:     AssetSummary;
  allocationData:    AllocationSlice[];
  allocationBreakdown: AllocationKpi[];
  topHoldings:       Holding[];
  behavioralProfile: { label: string; value: string }[];
  tasks:             { id: string; done: boolean; task: string; urgent: boolean }[];
  recentActivity:    { label: string; description: string; date: string; dotColor: string }[];
  aiHighPriority:    AIAlert | null;
  aiRiskAlert:       { title: string; message: string; action: string } | null;
};

export const mockClientDetails = clientDetailsRaw as Record<string, ClientDetail>;

export const notificationGroups = notificationsRaw as Array<{
  label: string;
  items: Array<{
    id: string; title: string; description: string;
    time: string; unread: boolean; type: NotificationType;
  }>;
}>;
