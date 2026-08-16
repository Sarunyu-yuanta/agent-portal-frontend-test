/**
 * Wire-shape types — the raw JSON documents returned from `/api/mock/*`.
 * These mirror the OpenAPI spec at `public/openapi.yaml`.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * When a real endpoint replaces the mock route, keep these shapes stable — the
 * transform layer in `src/lib/api.ts` maps them to the UI-facing types in
 * `src/types/domain.ts`.
 */

export type ClientStatus = "success" | "error" | "hold" | "processing";
export type PriorityVariant = "red" | "yellow" | "blue";

export interface ApiClient {
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

export interface ApiNBAAction {
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

export interface ApiPipelineDeal {
  id: number;
  clientId: string;
  product: string;
  dealSize: number;
  probability: number;
  stage: string;
  daysInStage: number;
  stalled: boolean;
}

export interface ApiMiniKanban {
  id: number;
  clientId: string;
  dealName: string;
  dealSize: number;
  stage: string;
}

export interface ApiCollectionResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
