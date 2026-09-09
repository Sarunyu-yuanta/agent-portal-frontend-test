"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  mockClients,
  mockNBAActions,
  mockPipelineDeals,
  mockMiniKanban,
} from "@/lib/mock-data";
import {
  fetchClients,
  fetchNBAActions,
  fetchPipelineDeals,
  fetchMiniKanban,
} from "@/lib/api";

const POLL_MS = 300_000;

/**
 * What every screen in this app reads data through: the value, plus whether it
 * is still on its way.
 *
 * The point of naming it is that a component never has to care which half of
 * the app it is in. It reads `isLoading` and renders its skeleton; whether that
 * flag comes from {@link useResource} (a real request) or {@link useStatic}
 * (data already in the bundle) is the data layer's business, not the view's.
 */
export type Resource<T> = { data: T; isLoading: boolean };

/**
 * Data that ships in the bundle, wearing the same shape as a fetched resource.
 * `isLoading` is `false` because there is genuinely nothing to wait for.
 *
 * ─── This is the backend seam ────────────────────────────────────────────────
 * Screens that have no endpoint yet still consume a {@link Resource}, so giving
 * one an endpoint is a change *here* rather than in the view:
 *
 * ```diff
 * - export function useTopIdeas() { return useStatic(ALL_TOP_IDEAS); }
 * + export function useTopIdeas() {
 * +   const fetcher = useCallback(() => fetchTopIdeas(), []);
 * +   return useResource("useTopIdeas", fetcher, ALL_TOP_IDEAS);
 * + }
 * ```
 *
 * The moment that swap happens `isLoading` starts going `true` on the first
 * render and the skeleton already wired to it appears — no component edited, no
 * switch to remember to flip. That is the whole reason this returns a resource
 * instead of the bare value: it costs one line of indirection now and saves
 * having to re-plumb every screen later.
 *
 * See `@/hooks/use-catalog`, which is where these live.
 */
export function useStatic<T>(data: T): Resource<T> {
  return { data, isLoading: false };
}

/**
 * Polls `fetcher` every {@link POLL_MS} and returns the latest value,
 * falling back to `fallback` until the first fetch resolves.
 * Rejections are logged (label) but don't reset the state.
 *
 * `isLoading` is only true up to the *first* fetch attempt settling — later
 * background polls swap `data` in silently rather than re-triggering a
 * loading state. A rejection still clears it: `fallback` is already valid
 * data to show, so there's nothing left to block the skeleton on.
 */
export function useResource<T>(
  label: string,
  fetcher: () => Promise<T>,
  fallback: T,
): Resource<T> {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedOnce = useRef(false);

  const settleOnce = useCallback(() => {
    if (!resolvedOnce.current) {
      resolvedOnce.current = true;
      setIsLoading(false);
    }
  }, []);

  const load = useCallback(() => {
    fetcher()
      .then((next) => {
        setData(next);
        settleOnce();
      })
      .catch((err) => {
        console.warn(`[${label}]`, err);
        settleOnce();
      });
  }, [fetcher, label, settleOnce]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, isLoading };
}

/** The client list, plus whether the first real fetch has resolved. */
export function useClientsResource() {
  const fetcher = useCallback(() => fetchClients(), []);
  return useResource("useClients", fetcher, mockClients);
}

/** Just the client list — use {@link useClientsResource} when you also need `isLoading`. */
export function useClients() {
  return useClientsResource().data;
}

export function useNBAActions(clients = mockClients) {
  const fetcher = useCallback(() => fetchNBAActions(clients), [clients]);
  return useResource("useNBAActions", fetcher, mockNBAActions).data;
}

export function usePipelineDeals(clients = mockClients) {
  const fetcher = useCallback(() => fetchPipelineDeals(clients), [clients]);
  return useResource("usePipelineDeals", fetcher, mockPipelineDeals).data;
}

export function useMiniKanban(clients = mockClients) {
  const fetcher = useCallback(() => fetchMiniKanban(clients), [clients]);
  return useResource("useMiniKanban", fetcher, mockMiniKanban).data;
}
