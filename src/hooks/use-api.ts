"use client";
import { useState, useEffect, useCallback } from "react";
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

export function useClients() {
  const [data, setData] = useState(mockClients);
  const load = useCallback(() => {
    fetchClients().then(setData).catch(() => {});
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);
  return data;
}

export function useNBAActions(clients = mockClients) {
  const [data, setData] = useState(mockNBAActions);
  const load = useCallback(() => {
    fetchNBAActions(clients).then(setData).catch(() => {});
  }, [clients]);
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);
  return data;
}

export function usePipelineDeals(clients = mockClients) {
  const [data, setData] = useState(mockPipelineDeals);
  const load = useCallback(() => {
    fetchPipelineDeals(clients).then(setData).catch(() => {});
  }, [clients]);
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);
  return data;
}

export function useMiniKanban(clients = mockClients) {
  const [data, setData] = useState(mockMiniKanban);
  const load = useCallback(() => {
    fetchMiniKanban(clients).then(setData).catch(() => {});
  }, [clients]);
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);
  return data;
}
