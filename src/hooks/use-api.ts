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
 * Polls `fetcher` every {@link POLL_MS} and returns the latest value,
 * falling back to `fallback` until the first fetch resolves.
 * Rejections are logged (label) but don't reset the state.
 *
 * `isLoading` is only true up to the *first* fetch attempt settling — later
 * background polls swap `data` in silently rather than re-triggering a
 * loading state. A rejection still clears it: `fallback` is already valid
 * data to show, so there's nothing left to block the skeleton on.
 */
function useResource<T>(
  label: string,
  fetcher: () => Promise<T>,
  fallback: T,
): { data: T; isLoading: boolean } {
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
