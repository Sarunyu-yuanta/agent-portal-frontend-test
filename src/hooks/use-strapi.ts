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
} from "@/lib/strapi";

const POLL_MS = 10_000;

export function useStrapiClients() {
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

export function useStrapiNBAActions(clients = mockClients) {
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

export function useStrapiPipelineDeals(clients = mockClients) {
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

export function useStrapiMiniKanban(clients = mockClients) {
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
