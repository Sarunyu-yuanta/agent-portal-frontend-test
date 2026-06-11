"use client";
import { useState, useEffect } from "react";
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
} from "@/lib/strapi";

const POLL_INTERVAL = 10_000;

function useStrapi<T>(fetcher: () => Promise<T[]>, initial: T[]) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    fetcher().then(setData).catch(() => {});
    const id = setInterval(() => {
      fetcher().then(setData).catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return data;
}

export function useStrapiClients() {
  return useStrapi(fetchClients, mockClients);
}

export function useStrapiNBAActions() {
  return useStrapi(fetchNBAActions, mockNBAActions);
}

export function useStrapiPipelineDeals() {
  return useStrapi(fetchPipelineDeals, mockPipelineDeals);
}

export function useStrapiMiniKanban() {
  return useStrapi(fetchMiniKanban, mockMiniKanban);
}
