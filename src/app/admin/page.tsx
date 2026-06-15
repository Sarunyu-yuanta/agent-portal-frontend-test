"use client";

import { useState, useEffect, useCallback } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema } from "@rjsf/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OpenAPISpec {
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, RJSFSchema>;
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
}

interface Operation {
  tags?: string[];
  requestBody?: {
    content?: {
      "application/json"?: {
        schema?: { $ref?: string };
      };
    };
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
    const ref =
      postOp.requestBody.content?.["application/json"]?.schema?.$ref;
    if (!ref) continue;
    const schema = resolveRef(ref, spec);
    if (!schema) continue;
    const name =
      postOp.tags?.[0] ?? item.get?.tags?.[0] ?? path.replace(/^\//, "");
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

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    data?: ApiItem;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Load spec once on mount
  useEffect(() => {
    fetch("/api/openapi")
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

  // Reload items whenever the active resource changes
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
    const res = await fetch(`${API_BASE}${active.path}/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res || !res.ok) { alert("Delete failed"); return; }
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  };

  const handleSubmit = async (
    e: { formData?: Record<string, unknown> }
  ) => {
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

  if (specLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-sm text-gray-400">Loading schema…</p>
      </div>
    );
  }

  if (specError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-sm text-red-500">{specError}</p>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            {API_BASE || (
              <span className="text-amber-500">
                NEXT_PUBLIC_API_URL not set
              </span>
            )}
          </p>
        </div>
        <a
          href="/api-docs"
          className="ml-auto text-xs text-blue-600 hover:underline"
        >
          API Docs →
        </a>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-44 shrink-0 bg-white border-r border-gray-200 pt-4">
          {resources.map((r, i) => (
            <button
              key={r.path}
              onClick={() => {
                setActiveIdx(i);
                setItems([]);
                setModal(null);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i === activeIdx
                  ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r.name}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 p-6 min-w-0">
          {active && (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-medium text-gray-900">
                  {active.name}
                  <span className="ml-2 text-xs font-normal text-gray-400 font-mono">
                    {active.path}
                  </span>
                </h2>
                <button
                  onClick={() => setModal({ mode: "add" })}
                  className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add New
                </button>
              </div>

              {/* Table */}
              {itemsLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No items found.{" "}
                  {!API_BASE && (
                    <span className="text-amber-500">
                      Set NEXT_PUBLIC_API_URL in .env.local to connect an API.
                    </span>
                  )}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left">
                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          ID
                        </th>
                        {previewColumns(active.schema).map((col) => (
                          <th
                            key={col}
                            className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide"
                          >
                            {col}
                          </th>
                        ))}
                        <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-400">
                            {String(item.id)}
                          </td>
                          {previewColumns(active.schema).map((col) => (
                            <td
                              key={col}
                              className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate"
                              title={String(item[col] ?? "")}
                            >
                              {String(item[col] ?? "—")}
                            </td>
                          ))}
                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setModal({ mode: "edit", data: item })
                              }
                              className="text-blue-600 hover:text-blue-800 text-xs mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && active && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-900">
                {modal.mode === "add" ? "Add" : "Edit"} {active.name}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 overflow-y-auto">
              <Form
                schema={active.schema}
                validator={validator}
                formData={modal.data as Record<string, unknown>}
                onSubmit={handleSubmit}
                disabled={saving}
                uiSchema={{
                  "ui:submitButtonOptions": {
                    submitText: saving
                      ? "Saving…"
                      : modal.mode === "add"
                      ? "Create"
                      : "Update",
                    props: {
                      className:
                        "mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer",
                      disabled: saving,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
