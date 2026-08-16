"use client";

import { useCallback, useEffect, useState } from "react";
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
 */
function useResource<T>(
  label: string,
  fetcher: () => Promise<T>,
  fallback: T,
): T {
  const [data, setData] = useState<T>(fallback);

  const load = useCallback(() => {
    fetcher()
      .then(setData)
      .catch((err) => console.warn(`[${label}]`, err));
  }, [fetcher, label]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return data;
}

export function useClients() {
  const fetcher = useCallback(() => fetchClients(), []);
  return useResource("useClients", fetcher, mockClients);
}

export function useNBAActions(clients = mockClients) {
  const fetcher = useCallback(() => fetchNBAActions(clients), [clients]);
  return useResource("useNBAActions", fetcher, mockNBAActions);
}

export function usePipelineDeals(clients = mockClients) {
  const fetcher = useCallback(() => fetchPipelineDeals(clients), [clients]);
  return useResource("usePipelineDeals", fetcher, mockPipelineDeals);
}

export function useMiniKanban(clients = mockClients) {
  const fetcher = useCallback(() => fetchMiniKanban(clients), [clients]);
  return useResource("useMiniKanban", fetcher, mockMiniKanban);
}
