const BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

async function strapiGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${BASE}/api/${path}?pagination[pageSize]=100`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Strapi /${path}: ${res.status}`);
  const { data } = (await res.json()) as { data: T[] };
  return data;
}

// ── Clients ───────────────────────────────────────────────────────────────────

interface StrapiClient {
  id: number;
  name: string;
  tier: string;
  aum: string;
  cashIdlePct: number;
  plYtd: string;
  plPositive: boolean;
  aiScore: number;
  healthStatus: string;
  lastContact: string;
  riskProfile: string;
}

export async function fetchClients() {
  const items = await strapiGet<StrapiClient>("clients");
  return items.map((item) => ({
    id: String(item.id),
    name: item.name,
    tier: item.tier,
    aum: item.aum,
    cashIdlePct: item.cashIdlePct,
    plYtd: item.plYtd,
    plPositive: item.plPositive,
    aiScore: item.aiScore,
    status: item.healthStatus as "success" | "error" | "hold" | "processing",
    lastContact: item.lastContact,
    riskProfile: item.riskProfile,
  }));
}

// ── NBA Actions ───────────────────────────────────────────────────────────────

interface StrapiNBAAction {
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
  const nameById = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const items = await strapiGet<StrapiNBAAction>("nba-actions");
  return items.map((item) => ({
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

interface StrapiPipelineDeal {
  id: number;
  clientId: string;
  product: string;
  dealSize: string;
  probability: number;
  stage: string;
  daysInStage: number;
  stalled: boolean;
}

export async function fetchPipelineDeals(clients: Awaited<ReturnType<typeof fetchClients>>) {
  const nameById = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const items = await strapiGet<StrapiPipelineDeal>("pipeline-deals");
  return items.map((item) => ({
    id: `p${item.id}`,
    clientId: item.clientId,
    client: nameById[item.clientId] ?? item.clientId,
    product: item.product,
    dealSize: item.dealSize,
    probability: item.probability,
    stage: item.stage,
    daysInStage: item.daysInStage,
    stalled: item.stalled,
  }));
}

// ── Mini Kanban ───────────────────────────────────────────────────────────────

interface StrapiMiniKanban {
  id: number;
  clientId: string;
  deal: string;
  stage: string;
}

export async function fetchMiniKanban(clients: Awaited<ReturnType<typeof fetchClients>>) {
  const nameById = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const items = await strapiGet<StrapiMiniKanban>("mini-kanbans");
  return items.map((item) => {
    const full = nameById[item.clientId] ?? item.clientId;
    const parts = full.split(" ");
    const short = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
    return { id: `k${item.id}`, clientId: item.clientId, client: short, deal: item.deal, stage: item.stage };
  });
}
