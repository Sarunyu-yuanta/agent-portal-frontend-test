"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Button,
  SearchInput,
  Modal,
} from "@sarunyu/system-one";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema } from "@rjsf/utils";
import { customWidgets, FieldTemplate, SubmitButton } from "./rjsf-widgets";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Database,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OpenAPISpec {
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, RJSFSchema> };
}
interface PathItem {
  get?: Operation;
  post?: Operation;
}
interface Operation {
  tags?: string[];
  requestBody?: {
    content?: { "application/json"?: { schema?: { $ref?: string } } };
  };
}
interface Resource {
  path: string;
  name: string;
  schema: RJSFSchema;
}
interface ApiItem {
  id: number | string;
  [key: string]: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveRef(ref: string, spec: OpenAPISpec): RJSFSchema | null {
  const parts = ref.split("/").filter((p) => p !== "#");
  let node: unknown = spec;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return null;
    node = (node as Record<string, unknown>)[part];
  }
  return (node as RJSFSchema) ?? null;
}

function extractResources(spec: OpenAPISpec): Resource[] {
  const result: Resource[] = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    if (path.includes("{")) continue;
    const postOp = item.post;
    if (!postOp?.requestBody) continue;
    const ref = postOp.requestBody.content?.["application/json"]?.schema?.$ref;
    if (!ref) continue;
    const schema = resolveRef(ref, spec);
    if (!schema) continue;
    const name = postOp.tags?.[0] ?? item.get?.tags?.[0] ?? path.replace(/^\//, "");
    result.push({ path, name, schema });
  }
  return result;
}

function previewColumns(schema: RJSFSchema): string[] {
  return Object.keys(schema.properties ?? {});
}

function formatColName(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .trim();
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// ── Sub-components ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading resources…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="bg-white rounded-xl border border-border p-8 max-w-sm text-center shadow-sm">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
          <Database className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Connection Error</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ hasApiBase, onAdd }: { hasApiBase: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <LayoutGrid className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No records yet</p>
      {!hasApiBase ? (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Set <code className="bg-muted px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_API_URL</code> in{" "}
          <code className="bg-muted px-1 py-0.5 rounded font-mono">.env.local</code> to connect.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">Add your first record to get started.</p>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Record
          </Button>
        </>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [specError, setSpecError] = useState<string | null>(null);
  const [specLoading, setSpecLoading] = useState(true);

  const [activeIdx, setActiveIdx] = useState(0);
  const [items, setItems] = useState<ApiItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: ApiItem } | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<Form>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasRightOverflow, setHasRightOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setHasRightOverflow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [items, activeIdx]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"none" | "asc" | "desc">("none");

  const dirFor = (k: string): "none" | "asc" | "desc" => (sortKey === k ? sortDir : "none");
  const handleSort = (k: string) => (next: "none" | "asc" | "desc") => {
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
  };

  const sortedItems = useMemo(() => {
    if (!sortKey || sortDir === "none") return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return sortedItems;
    const q = search.toLowerCase();
    return sortedItems.filter((item) =>
      Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [sortedItems, search]);

  useEffect(() => {
    fetch("/api/openapi", { cache: "no-store" })
      .then((r) => r.json())
      .then((spec: OpenAPISpec) => {
        setResources(extractResources(spec));
        setSpecLoading(false);
      })
      .catch(() => {
        setSpecError("Failed to load /api/openapi — is the dev server running?");
        setSpecLoading(false);
      });
  }, []);

  const active = resources[activeIdx];

  const loadItems = useCallback(() => {
    if (!active || !API_BASE) {
      setItems([]);
      return;
    }
    setItemsLoading(true);
    fetch(`${API_BASE}${active.path}?pagination[pageSize]=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: unknown) => {
        const raw = json as Record<string, unknown>;
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? (raw.data as ApiItem[])
          : [];
        setItems(data);
      })
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  }, [active]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: number | string) => {
    if (!active || !API_BASE) return;
    if (!confirm(`Delete item #${id}?`)) return;
    const res = await fetch(`${API_BASE}${active.path}/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (!res || !res.ok) {
      alert("Delete failed");
      return;
    }
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  };

  const handleSubmit = async (e: { formData?: Record<string, unknown> }) => {
    if (!active || !API_BASE || e.formData == null) return;
    const formData = e.formData;
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit" && modal.data?.id != null;
      const url = isEdit
        ? `${API_BASE}${active.path}/${modal!.data!.id}`
        : `${API_BASE}${active.path}`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: ApiItem };
      setModal(null);
      if (isEdit) {
        setItems((prev) =>
          prev.map((item) =>
            String(item.id) === String(modal!.data!.id) ? json.data : item
          )
        );
      } else {
        setItems((prev) => [...prev, json.data]);
      }
    } catch (err) {
      alert(`Save failed: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Render states ────────────────────────────────────────────────────────────

  if (specLoading) return <LoadingScreen />;
  if (specError) return <ErrorScreen message={specError} />;

  // ── Main UI ──────────────────────────────────────────────────────────────────

  const cols = active ? previewColumns(active.schema) : [];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">

      {/* Top Bar */}
      <header className="h-12 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Mock Data Studio</span>
        </div>

        {active && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{active.name}</span>
          </div>
        )}

        <div className="ml-auto">
          <Button
            variant="plain-black"
            size="sm"
            onClick={() => window.open("/api-docs", "_blank")}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            API Docs
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-r border-border flex flex-col">
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
              Resources
            </p>
          </div>
          <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto">
            {resources.map((r, i) => (
              <button
                key={r.path}
                onClick={() => {
                  setActiveIdx(i);
                  setItems([]);
                  setModal(null);
                  setSearch("");
                }}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  i === activeIdx
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {active && (
            <>
              {/* Content Header */}
              <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-foreground">{active.name}</h1>
                  {!itemsLoading && items.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                      {filteredItems.length}
                      {search && items.length !== filteredItems.length
                        ? ` / ${items.length}`
                        : ""}
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* Search */}
                  <SearchInput
                    placeholder="Search records…"
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch("")}
                    size="sm"
                    className="w-72"
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setModal({ mode: "add" })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Record
                  </Button>
                </div>
              </div>

              {/* Table area */}
              <div className="flex-1 overflow-auto p-5">
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border shadow-sm">
                    <EmptyState hasApiBase={!!API_BASE} onAdd={() => setModal({ mode: "add" })} />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <div ref={scrollRef} className="overflow-x-auto">
                      <table className="border-separate border-spacing-0 text-sm whitespace-nowrap min-w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border w-[52px]">
                              #
                            </th>
                            {cols.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border">
                                <button
                                  onClick={() => {
                                    const cur = dirFor(col);
                                    const next = cur === "none" ? "asc" : cur === "asc" ? "desc" : "none";
                                    handleSort(col)(next);
                                  }}
                                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                  {formatColName(col)}
                                  {dirFor(col) === "asc" ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : dirFor(col) === "desc" ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronsUpDown className="w-3 h-3 opacity-40" />
                                  )}
                                </button>
                              </th>
                            ))}
                            <th className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground border-b border-border w-20 ${hasRightOverflow ? "sticky right-0 bg-gray-50 border-l shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]" : "bg-muted/40"}`}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.length === 0 ? (
                            <tr>
                              <td colSpan={cols.length + 2} className="px-4 py-10 text-center text-xs text-muted-foreground">
                                No results for &ldquo;{search}&rdquo;
                              </td>
                            </tr>
                          ) : (
                            filteredItems.map((item, idx) => (
                              <tr
                                key={item.id}
                                className={`group hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                              >
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-b border-border w-[52px]">
                                  {String(item.id)}
                                </td>
                                {cols.map((col) => (
                                  <td key={col} className="px-4 py-3 text-sm text-foreground max-w-[200px] border-b border-border">
                                    <span className="truncate block">{String(item[col] ?? "—")}</span>
                                  </td>
                                ))}
                                <td className={`px-4 py-3 border-b border-border transition-colors ${hasRightOverflow ? "sticky right-0 bg-white group-hover:bg-gray-50 border-l shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]" : ""}`}>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="plain"
                                      size="icon-sm"
                                      onClick={() => setModal({ mode: "edit", data: item })}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="plain"
                                      size="icon-sm"
                                      onClick={() => handleDelete(item.id)}
                                      className="text-destructive [&_svg]:text-destructive"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    {!search && (
                      <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center">
                        <p className="text-xs text-muted-foreground">
                          {items.length} {items.length === 1 ? "record" : "records"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <Modal
            variant="content"
            title={`${modal.mode === "add" ? "Add" : "Edit"} ${active.name}`}
            className="w-[560px] max-w-[95vw]"
            actionLayout="none"
            onClose={() => setModal(null)}
          >
            <div className="overflow-y-auto max-h-[60vh] pr-1 pl-px py-px">
              <Form
                ref={formRef}
                schema={active.schema}
                validator={validator}
                formData={modal.data as Record<string, unknown>}
                onSubmit={handleSubmit}
                disabled={saving}
                showErrorList={false}
                widgets={customWidgets}
                templates={{ FieldTemplate, ButtonTemplates: { SubmitButton } }}
                uiSchema={{
                  "ui:submitButtonOptions": { norender: true },
                }}
              />
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setModal(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                disabled={saving}
                onClick={() => formRef.current?.submit()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : modal.mode === "add" ? (
                  "Create Record"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
