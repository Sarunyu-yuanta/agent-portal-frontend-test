const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/mock").replace(/\/$/, "");

async function apiGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${BASE}/${path}?pagination[pageSize]=100`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API /${path}: ${res.status}`);
  const { data } = (await res.json()) as { data: T[] };
  return data;
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatAUM(millions: number): string {
  if (millions >= 1000) return `฿ ${(millions / 1000).toFixed(1).replace(/\.0$/, "")}B`;
  return `฿ ${millions}M`;
}

function formatPlYtd(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatDealSize(millions: number): string {
  if (millions >= 1000) return `฿ ${(millions / 1000).toFixed(1).replace(/\.0$/, "")}B`;
  return `฿ ${millions}M`;
}

function formatLastContact(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 14) return "1 week ago";
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  } catch {
    return isoDate;
  }
}

// ── Clients ───────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  name: string;
  tier: string;
  aum: number;
  cashIdlePct: number;
  plYtd: number;
  aiScore: number;
  status: string;
  lastContact: string;
  riskProfile: string;
}

export async function fetchClients() {
  const items = await apiGet<Client>("clients");
  return items.map((item: Client) => ({
    id: String(item.id),
    name: item.name,
    tier: item.tier,
    aum: formatAUM(item.aum),
    cashIdlePct: item.cashIdlePct,
    plYtd: String(item.plYtd),
    plPositive: !String(item.plYtd).startsWith("-"),
    aiScore: item.aiScore,
    status: item.status as "success" | "error" | "hold" | "processing",
    lastContact: formatLastContact(item.lastContact),
    riskProfile: item.riskProfile,
  }));
}

// ── NBA Actions ───────────────────────────────────────────────────────────────

interface NBAAction {
  id: number;
  clientId: string;
  tier: string;
  priority: string;
  priorityVariant: string;
  insight: string;
  aiDraft: string;
  action: string;
  revenueImpact: string;
}

export async function fetchNBAActions(clients: Awaited<ReturnType<typeof fetchClients>>) {
  const nameById = Object.fromEntries(clients.map((c: { id: string; name: string }) => [c.id, c.name]));
  const items = await apiGet<NBAAction>("nba-actions");
  return items.map((item: NBAAction) => ({
    id: String(item.id),
    clientId: item.clientId,
    clientName: nameById[item.clientId] ?? item.clientId,
    tier: item.tier,
    priority: item.priority,
    priorityVariant: item.priorityVariant as "red" | "yellow" | "blue",
    insight: item.insight,
    aiDraft: item.aiDraft,
    action: item.action,
    revenueImpact: item.revenueImpact,
  }));
}

// ── Pipeline Deals ────────────────────────────────────────────────────────────

interface PipelineDeal {
  id: number;
  clientId: string;
  product: string;
  dealSize: number;
  probability: number;
  stage: string;
  daysInStage: number;
  stalled: boolean;
}

export async function fetchPipelineDeals(clients: Awaited<ReturnType<typeof fetchClients>>) {
  const nameById = Object.fromEntries(clients.map((c: { id: string; name: string }) => [c.id, c.name]));
  const items = await apiGet<PipelineDeal>("pipeline-deals");
  return items.map((item: PipelineDeal) => ({
    id: `p${item.id}`,
    clientId: item.clientId,
    client: nameById[item.clientId] ?? item.clientId,
    product: item.product,
    dealSize: formatDealSize(item.dealSize),
    probability: item.probability,
    stage: item.stage,
    daysInStage: item.daysInStage,
    stalled: item.stalled,
  }));
}

// ── Mini Kanban ───────────────────────────────────────────────────────────────

interface MiniKanban {
  id: number;
  clientId: string;
  dealName: string;
  dealSize: number;
  stage: string;
}

export async function fetchMiniKanban(clients: Awaited<ReturnType<typeof fetchClients>>) {
  const nameById = Object.fromEntries(clients.map((c: { id: string; name: string }) => [c.id, c.name]));
  const items = await apiGet<MiniKanban>("mini-kanbans");
  return items.map((item: MiniKanban) => {
    const full = nameById[item.clientId] ?? item.clientId;
    const parts = full.split(" ");
    const short = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
    return {
      id: `k${item.id}`,
      clientId: item.clientId,
      client: short,
      dealName: item.dealName,
      dealSize: formatDealSize(item.dealSize),
      stage: item.stage,
    };
  });
}
