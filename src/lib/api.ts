import type {
  ApiClient,
  ApiCollectionResponse,
  ApiMiniKanban,
  ApiNBAAction,
  ApiPipelineDeal,
  ClientStatus,
  PriorityVariant,
} from "@/types/api";
import type { MembershipTier } from "@/components/ui/tier-badge";

/**
 * Relative by default, so requests go to whatever origin the app is actually
 * served from.
 *
 * An absolute `http://localhost:3000/...` silently targets a *different* server
 * whenever Next picks another port (it does that on its own when 3000 is taken),
 * and if something unrelated is listening there the request can hang instead of
 * failing — which used to pin the dashboard's loading skeletons forever.
 *
 * Safe to be relative: every call below runs from `useResource`'s effect, i.e.
 * in the browser only, never during SSR.
 */
export const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "/api/mock").replace(/\/$/, "");

/** A stalled request must not outlive the UI's patience — callers all fall back
 *  to mock data, so giving up beats hanging. */
const REQUEST_TIMEOUT_MS = 8_000;

async function apiGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${BASE}/${path}?pagination[pageSize]=100`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`API /${path}: ${res.status}`);
  const { data } = (await res.json()) as ApiCollectionResponse<T>;
  return data;
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatBaht(millions: number): string {
  if (millions >= 1000) return `฿ ${(millions / 1000).toFixed(1).replace(/\.0$/, "")}B`;
  return `฿ ${millions}M`;
}

function formatLastContact(isoDate: string): string {
  const date = new Date(isoDate);
  // `src/data/clients.json` already stores display strings ("2 days ago",
  // "Today"), and it doubles as both the API seed and the mock fallback. An
  // unparseable value has to pass straight through: `new Date("2 days ago")`
  // yields an Invalid Date rather than throwing, so the arithmetic below would
  // otherwise render every row as "NaN months ago".
  if (Number.isNaN(date.getTime())) return isoDate;

  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

/** "Somchai Rattanakul" → "Somchai R." */
function shortenName(full: string): string {
  const parts = full.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
}

type NameLookup = { readonly [clientId: string]: string };

function buildNameLookup(clients: readonly { id: string; name: string }[]): NameLookup {
  return Object.fromEntries(clients.map((c) => [c.id, c.name]));
}

// ── Clients ───────────────────────────────────────────────────────────────────

export async function fetchClients() {
  const items = await apiGet<ApiClient>("clients");
  return items.map((item) => ({
    id: String(item.id),
    name: item.name,
    tier: item.tier,
    membershipTier: item.membershipTier as MembershipTier,
    aum: typeof item.aum === "string" ? item.aum : formatBaht(item.aum),
    cashIdlePct: item.cashIdlePct,
    plYtd: String(item.plYtd),
    plPositive: !String(item.plYtd).startsWith("-"),
    aiScore: item.aiScore,
    status: item.status as ClientStatus,
    lastContact: formatLastContact(item.lastContact),
    riskProfile: item.riskProfile,
  }));
}

type Clients = Awaited<ReturnType<typeof fetchClients>>;

// ── NBA Actions ───────────────────────────────────────────────────────────────

export async function fetchNBAActions(clients: Clients) {
  const nameById = buildNameLookup(clients);
  const items = await apiGet<ApiNBAAction>("nba-actions");
  return items.map((item) => ({
    id: String(item.id),
    clientId: item.clientId,
    clientName: nameById[item.clientId] ?? item.clientId,
    tier: item.tier,
    priority: item.priority,
    priorityVariant: item.priorityVariant as PriorityVariant,
    insight: item.insight,
    aiDraft: item.aiDraft,
    action: item.action,
    revenueImpact: item.revenueImpact,
  }));
}

// ── Pipeline Deals ────────────────────────────────────────────────────────────

export async function fetchPipelineDeals(clients: Clients) {
  const nameById = buildNameLookup(clients);
  const items = await apiGet<ApiPipelineDeal>("pipeline-deals");
  return items.map((item) => ({
    id: `p${item.id}`,
    clientId: item.clientId,
    client: nameById[item.clientId] ?? item.clientId,
    product: item.product,
    dealSize: formatBaht(item.dealSize),
    probability: item.probability,
    stage: item.stage,
    daysInStage: item.daysInStage,
    stalled: item.stalled,
  }));
}

// ── Mini Kanban ───────────────────────────────────────────────────────────────

export async function fetchMiniKanban(clients: Clients) {
  const nameById = buildNameLookup(clients);
  const items = await apiGet<ApiMiniKanban>("mini-kanbans");
  return items.map((item) => ({
    id: `k${item.id}`,
    clientId: item.clientId,
    client: shortenName(nameById[item.clientId] ?? item.clientId),
    dealName: item.dealName,
    dealSize: formatBaht(item.dealSize),
    stage: item.stage,
  }));
}
