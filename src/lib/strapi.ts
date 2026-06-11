const BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

async function strapiGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${BASE}/api/${path}?pagination[pageSize]=100`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Strapi /${path}: ${res.status}`);
  const json = (await res.json()) as { data: T[] };
  return json.data;
}

interface StrapiClient {
  id: number;
  name: string;
  tier: string;
  aum: string;
  cashIdlePct: number;
  plYtd: string;
  plPositive: boolean;
  aiScore: number;
  clientStatus: string;
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
    status: item.clientStatus as "success" | "error" | "hold" | "processing",
    lastContact: item.lastContact,
    riskProfile: item.riskProfile,
  }));
}

interface StrapiNBAAction {
  id: number;
  clientName: string;
  tier: string;
  priority: string;
  priorityVariant: string;
  insight: string;
  aiDraft: string;
  actionLabel: string;
  revenueImpact: string;
}

export async function fetchNBAActions() {
  const items = await strapiGet<StrapiNBAAction>("nba-actions");
  return items.map((item) => ({
    id: String(item.id),
    clientName: item.clientName,
    tier: item.tier,
    priority: item.priority,
    priorityVariant: item.priorityVariant as "red" | "yellow" | "blue",
    insight: item.insight,
    aiDraft: item.aiDraft,
    action: item.actionLabel,
    revenueImpact: item.revenueImpact,
  }));
}

interface StrapiPipelineDeal {
  id: number;
  client: string;
  product: string;
  dealSize: string;
  probability: number;
  stage: string;
  daysInStage: number;
  stalled: boolean;
}

export async function fetchPipelineDeals() {
  const items = await strapiGet<StrapiPipelineDeal>("pipeline-deals");
  return items.map((item) => ({
    id: `p${item.id}`,
    client: item.client,
    product: item.product,
    dealSize: item.dealSize,
    probability: item.probability,
    stage: item.stage,
    daysInStage: item.daysInStage,
    stalled: item.stalled,
  }));
}

interface StrapiMiniKanban {
  id: number;
  client: string;
  deal: string;
  stage: string;
}

export async function fetchMiniKanban() {
  const items = await strapiGet<StrapiMiniKanban>("mini-kanbans");
  return items.map((item) => ({
    id: `k${item.id}`,
    client: item.client,
    deal: item.deal,
    stage: item.stage,
  }));
}
