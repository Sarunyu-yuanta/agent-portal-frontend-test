"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Card,
} from "@sarunyu/system-one";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema } from "@rjsf/utils";
import { customWidgets, FieldTemplate } from "./rjsf-widgets";

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
  return Object.keys(schema.properties ?? {}).slice(0, 4);
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [specError, setSpecError] = useState<string | null>(null);
  const [specLoading, setSpecLoading] = useState(true);

  const [activeIdx, setActiveIdx] = useState(0);
  const [items, setItems] = useState<ApiItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: ApiItem } | null>(null);
  const [saving, setSaving] = useState(false);
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
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

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
    if (!active || !API_BASE) { setItems([]); return; }
    setItemsLoading(true);
    fetch(`${API_BASE}${active.path}?pagination[pageSize]=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: unknown) => {
        const raw = json as Record<string, unknown>;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? (raw.data as ApiItem[]) : [];
        setItems(data);
      })
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  }, [active]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleDelete = async (id: number | string) => {
    if (!active || !API_BASE) return;
    if (!confirm(`Delete item #${id}?`)) return;
    const res = await fetch(`${API_BASE}${active.path}/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res || !res.ok) { alert("Delete failed"); return; }
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  };

  const handleSubmit = async (e: { formData?: Record<string, unknown> }) => {
    if (!active || !API_BASE || e.formData == null) return;
    const formData = e.formData;
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit" && modal.data?.id != null;
      const url = isEdit ? `${API_BASE}${active.path}/${modal!.data!.id}` : `${API_BASE}${active.path}`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: ApiItem };
      setModal(null);
      if (isEdit) {
        setItems((prev) => prev.map((item) => String(item.id) === String(modal!.data!.id) ? json.data : item));
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

  if (specLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-sm text-muted-foreground">Loading schema…</p>
      </div>
    );
  }

  if (specError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-sm text-destructive">{specError}</p>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-4">
        <h1 className="text-base font-semibold text-foreground">Admin Panel</h1>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => window.open("/api-docs", "_blank")}>
            API Docs
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-44 shrink-0 bg-card border-r border-border pt-3 flex flex-col gap-0.5 px-2">
          {resources.map((r, i) => (
            <button
              key={r.path}
              onClick={() => { setActiveIdx(i); setItems([]); setModal(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                i === activeIdx
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {r.name}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 p-6 min-w-0">
          <div className="max-w-[1600px] mx-auto">
          {active && (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{active.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{active.path}</p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModal({ mode: "add" })}
                  >
                    + Add New
                  </Button>
                </div>
              </div>

              {/* Table */}
              {itemsLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No items found.{" "}
                  {!API_BASE && <span className="text-warning">Set NEXT_PUBLIC_API_URL in .env.local.</span>}
                </p>
              ) : (
                <Card>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell
                        sortDirection={dirFor("id")}
                        onSortChange={handleSort("id")}
                      >
                        ID
                      </TableHeaderCell>
                      {previewColumns(active.schema).map((col) => (
                        <TableHeaderCell
                          key={col}
                          sortDirection={dirFor(col)}
                          onSortChange={handleSort(col)}
                        >
                          {col}
                        </TableHeaderCell>
                      ))}
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id} hoverable>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {String(item.id)}
                          </span>
                        </TableCell>
                        {previewColumns(active.schema).map((col) => (
                          <TableCell key={col}>
                            <span className="text-sm text-foreground">
                              {String(item[col] ?? "—")}
                            </span>
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModal({ mode: "edit", data: item })}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="plain"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <span className="text-destructive">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </Card>
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal && active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <Modal
            variant="content"
            title={`${modal.mode === "add" ? "Add" : "Edit"} ${active.name}`}
            className="w-[600px] max-w-[95vw]"
            actionLayout="none"
            onClose={() => setModal(null)}
          >
            <div className="overflow-y-auto max-h-[60vh] pr-1">
              <Form
                schema={active.schema}
                validator={validator}
                formData={modal.data as Record<string, unknown>}
                onSubmit={handleSubmit}
                disabled={saving}
                widgets={customWidgets}
                templates={{ FieldTemplate }}
                uiSchema={{
                  "ui:submitButtonOptions": {
                    submitText: saving ? "Saving…" : modal.mode === "add" ? "Create" : "Update",
                    props: {
                      className:
                        "mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer",
                      disabled: saving,
                    },
                  },
                }}
              />
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
