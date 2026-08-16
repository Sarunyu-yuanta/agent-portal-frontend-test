"use client";

import { useEffect, useState } from "react";
import { Button, Modal, SearchInput, Toaster } from "@sarunyu/system-one";
import type { ToastProps } from "@sarunyu/system-one";
import {
  ChevronRight,
  Database,
  ExternalLink,
  Loader2,
  Plus,
} from "lucide-react";
import {
  API_BASE,
  extractResources,
  type ApiItem,
  type OpenAPISpec,
  type Resource,
} from "./admin-utils";
import { EmptyState, ErrorScreen, LoadingScreen } from "./admin-states";
import { ResourceTable, tableFilteredCount } from "./ResourceTable";
import { RecordFormModal, type RecordFormMode } from "./RecordFormModal";

export default function AdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [specError, setSpecError] = useState<string | null>(null);
  const [specLoading, setSpecLoading] = useState(true);

  const [activeIdx, setActiveIdx] = useState(0);
  const [items, setItems] = useState<ApiItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<{ mode: RecordFormMode; data?: ApiItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const toast = (message: string, status: ToastProps["status"] = "success") => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, message, status }]);
  };

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
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    setItems([]);
    setItemsLoading(!!(active && API_BASE));
  }

  useEffect(() => {
    if (!active || !API_BASE) return;
    let cancelled = false;
    fetch(`${API_BASE}${active.path}?pagination[pageSize]=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: unknown) => {
        if (cancelled) return;
        const raw = json as Record<string, unknown>;
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? (raw.data as ApiItem[])
          : [];
        setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const confirmDelete = async () => {
    if (!active || !API_BASE || deleteTarget == null) return;
    setDeleting(true);
    const res = await fetch(`${API_BASE}${active.path}/${deleteTarget}`, { method: "DELETE" }).catch(() => null);
    setDeleting(false);
    setDeleteTarget(null);
    if (!res || !res.ok) { toast("Delete failed", "critical"); return; }
    setItems((prev) => prev.filter((i) => String(i.id) !== String(deleteTarget)));
    toast("Deleted successfully", "success");
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
            String(item.id) === String(modal!.data!.id) ? json.data : item,
          ),
        );
        toast("Updated successfully", "success");
      } else {
        setItems((prev) => [...prev, json.data]);
        toast("Created successfully", "success");
      }
    } catch (err) {
      toast(`Save failed: ${err}`, "critical");
    } finally {
      setSaving(false);
    }
  };

  if (specLoading) return <LoadingScreen />;
  if (specError) return <ErrorScreen message={specError} />;

  const filteredCount = tableFilteredCount(items, search);

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

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Dashboard
          </Button>
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
                      {filteredCount}
                      {search && items.length !== filteredCount ? ` / ${items.length}` : ""}
                    </span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2">
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
                  <ResourceTable
                    active={active}
                    items={items}
                    search={search}
                    onEdit={(item) => setModal({ mode: "edit", data: item })}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && active && (
        <RecordFormModal
          active={active}
          mode={modal.mode}
          initialData={modal.data}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Modal
            variant="alert"
            alertStatus="danger"
            title="Delete item?"
            description={`Item #${deleteTarget} will be permanently removed.`}
            actionLayout="double"
            primaryLabel={deleting ? "Deleting…" : "Delete"}
            secondaryLabel="Cancel"
            onPrimaryClick={confirmDelete}
            onSecondaryClick={() => setDeleteTarget(null)}
            onClose={() => setDeleteTarget(null)}
          />
        </div>
      )}

      <Toaster
        items={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
