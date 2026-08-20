"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TabGroup, SearchInput, Pagination } from "@sarunyu/system-one";
import { useClients } from "@/hooks/use-api";
import { usePrivacy } from "@/contexts/privacy-context";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { setQueryState } from "@/lib/query-state";
import { useStoredIds } from "@/hooks/use-stored-ids";
import { NineBoxTab, type NineBoxCellInfo } from "./NineBoxTab";
import { ColumnVisibilityMenu } from "./ColumnVisibilityMenu";
import { CUSTOMER_COLUMNS } from "./columns";
import { getSortValue, getProductSortValue, buildProductRows } from "./client-hub-data";
import { compareBy, useTableSort } from "./use-table-sort";
import { ClientSummaryCards } from "./ClientSummaryCards";
import { CustomerTable } from "./CustomerTable";
import { ProductTable } from "./ProductTable";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { NineBoxCellDrawer } from "./NineBoxCellDrawer";
import { ClientDetailPanel } from "./ClientDetailPanel";
import type { ColumnId, ProductSortKey, SortKey, ViewFilter } from "./types";
import type { Client, ProductRow } from "@/types/domain";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * The Columns menu is remembered as the set of *hidden* columns, not visible
 * ones: an empty preference then means "show everything", which is both the
 * default and what a column added later should do for someone who set their
 * preference before it existed.
 */
const HIDDEN_COLUMNS_PREF = "client-hub:hidden-columns";
const isColumnId = (id: string) => CUSTOMER_COLUMNS.some((c) => c.id === id);

export default function ClientHubPage() {
  return (
    <Suspense fallback={null}>
      <ClientHubPageInner />
    </Suspense>
  );
}

function ClientHubPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clients = useClients();
  const { isPrivate } = usePrivacy();

  // Customer view
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("customer");
  const [hiddenColumns, setHiddenColumns] = useStoredIds<ColumnId>(
    HIDDEN_COLUMNS_PREF,
    isColumnId,
  );
  const visibleColumns = useMemo(
    () =>
      new Set(
        CUSTOMER_COLUMNS.filter((c) => !hiddenColumns.has(c.id)).map((c) => c.id),
      ),
    [hiddenColumns],
  );

  // Product view
  const [productSearch, setProductSearch] = useState("");


  // Client quick view — URL-owned (`?client=110001`) so refresh, browser back
  // and a shared link all land on the same open panel.
  const clientParam = searchParams.get("client");
  const selectedClient =
    (clientParam && clients.find((c) => c.id === clientParam)) || null;
  const drawerOpen = !!selectedClient;
  // The drawer animates out after the param is gone — keep the last client
  // around so it slides away with content instead of collapsing to blank.
  const [panelClient, setPanelClient] = useState<Client | null>(selectedClient);
  if (selectedClient && selectedClient !== panelClient) setPanelClient(selectedClient);
  // Only rewind history if we're the ones who pushed the panel onto it —
  // arriving straight on `?client=…` must not bounce out of the app.
  const pushedPanelRef = useRef(false);

  // Drawers
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [nineBoxCell, setNineBoxCell] = useState<NineBoxCellInfo | null>(null);
  const [nineBoxDrawerOpen, setNineBoxDrawerOpen] = useState(false);

  const toggleColumn = (id: ColumnId) => {
    if (CUSTOMER_COLUMNS.find((c) => c.id === id)?.required) return;
    const next = new Set(hiddenColumns);
    if (next.has(id)) next.delete(id); else next.add(id);
    setHiddenColumns(next);
  };

  const tableWidth = useMemo(() => {
    const NO_COL_WIDTH = 60;
    return NO_COL_WIDTH + CUSTOMER_COLUMNS.reduce(
      (sum, c) => sum + (visibleColumns.has(c.id) ? c.width : 0),
      0,
    );
  }, [visibleColumns]);

  // Sorting moves rows across pages, so start again from the first one.
  const customerSort = useTableSort<SortKey>(() => setCurrentPage(1));
  const productSort = useTableSort<ProductSortKey>();

  const sorted = useMemo(() => {
    let list = clients;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q) ||
          c.riskProfile.toLowerCase().includes(q),
      );
    }

    const { key, dir } = customerSort;
    if (key && dir !== "none") {
      const origIdx = key === "rowIndex"
        ? new Map(clients.map((c, i) => [c.id, i]))
        : null;
      list = [...list].sort((a, b) =>
        compareBy(
          origIdx ? (origIdx.get(a.id) ?? 0) : getSortValue(a, key),
          origIdx ? (origIdx.get(b.id) ?? 0) : getSortValue(b, key),
          dir,
        ),
      );
    }

    return list;
  }, [search, customerSort, clients]);

  const originalIndexMap = useMemo(
    () => new Map(clients.map((c, i) => [c.id, i + 1])),
    [clients],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const productRows = useMemo(() => buildProductRows(clients), [clients]);

  /** Row numbers from the unsorted list, so "No." identifies a product, not a position. */
  const productIndexMap = useMemo(
    () => new Map(productRows.map((r, i) => [r.label, i + 1])),
    [productRows],
  );

  const filteredProductRows = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    let list = q
      ? productRows.filter((r) => r.label.toLowerCase().includes(q))
      : productRows;

    const { key, dir } = productSort;
    if (key && dir !== "none") {
      const valueOf = (r: ProductRow) =>
        key === "rowIndex"
          ? (productIndexMap.get(r.label) ?? 0)
          : getProductSortValue(r, key);
      list = [...list].sort((a, b) => compareBy(valueOf(a), valueOf(b), dir));
    }

    return list;
  }, [productRows, productSearch, productSort, productIndexMap]);

  function openClient(client: Client) {
    const href = `/client-hub?client=${encodeURIComponent(client.id)}`;
    // Row-to-row within an already-open panel swaps the view rather than
    // stacking history entries the user would have to unwind one by one.
    if (drawerOpen) {
      setQueryState(href, "replace");
    } else {
      pushedPanelRef.current = true;
      setQueryState(href, "push");
    }
  }

  function closeClient() {
    // Back only rewinds the entry we added; landing directly on `?client=…`
    // (refresh, shared link, session restore) must not bounce out of the app.
    if (pushedPanelRef.current) {
      pushedPanelRef.current = false;
      router.back();
    } else {
      setQueryState("/client-hub", "replace");
    }
  }

  const goToProfile = (clientId: string) => router.push(`/client/${clientId}`);

  return (
    <>
      {/* Hero — own padding + max-width */}
      <div className="pt-4 pb-2 xl:pt-6 xl:pb-2">
        <div className="max-w-[1280px] mx-auto px-4 xl:px-6 flex flex-col gap-4">
          <ClientSummaryCards clients={clients} />
        </div>
      </div>

      {/* White section — full-width background, content constrained to max-w */}
      <section className="flex-1 bg-white rounded-t-[16px] xl:rounded-t-2xl">
        <div className="max-w-[1280px] mx-auto px-4 xl:px-6 flex flex-col gap-3 pt-4 xl:pt-6 pb-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 min-h-10">
            <TabGroup
              items={[
                { id: "customer", title: `Customer (${sorted.length})` },
                { id: "product", title: `Product (${filteredProductRows.length})` },
              ]}
              activeId={viewFilter}
              size="md"
              onChange={(id) => setViewFilter(id as ViewFilter)}
            />
            {viewFilter === "customer" && (
              <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
                <ColumnVisibilityMenu
                  columns={CUSTOMER_COLUMNS}
                  visibleColumns={visibleColumns}
                  onToggle={toggleColumn}
                  onReset={() => setHiddenColumns(new Set())}
                />
                <div className="flex-1 lg:w-64">
                  <SearchInput
                    size="sm"
                    className="!h-10"
                    placeholder="Search clients…"
                    value={search}
                    onChange={(val) => {
                      setSearch(val);
                      setCurrentPage(1);
                    }}
                    onClear={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            )}
            {viewFilter === "product" && (
              <div className="w-full lg:w-56 lg:ml-auto">
                <SearchInput
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={setProductSearch}
                  onClear={() => setProductSearch("")}
                  size="sm"
                />
              </div>
            )}
          </div>

          {viewFilter === "nine-box" ? (
            <NineBoxTab
              clients={sorted}
              onCellOpen={(info) => {
                setNineBoxCell(info);
                setNineBoxDrawerOpen(true);
              }}
            />
          ) : viewFilter === "customer" ? (
            <>
              <CustomerTable
                rows={paged}
                visibleColumns={visibleColumns}
                originalIndexMap={originalIndexMap}
                tableWidth={tableWidth}
                isPrivate={isPrivate}
                dirFor={customerSort.dirFor}
                onSort={customerSort.onSortChange}
                onRowClick={openClient}
              />

              <div className="flex flex-wrap-reverse items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-muted-foreground whitespace-nowrap">Show per page</p>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-[12px] border border-border rounded-md px-2 py-1 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-action"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[12px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(safePage - 1) * pageSize + 1}
                    </span>
                    {" – "}
                    <span className="font-medium text-foreground">
                      {Math.min(safePage * pageSize, sorted.length)}
                    </span>
                    {" of "}
                    <span className="font-medium text-foreground">
                      {sorted.length}
                    </span>{" "}
                    clients
                  </p>
                  <Pagination
                    totalPages={totalPages}
                    currentPage={safePage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          ) : (
            <ProductTable
              rows={filteredProductRows}
              originalIndexMap={productIndexMap}
              dirFor={productSort.dirFor}
              onSort={productSort.onSortChange}
              onRowClick={(row) => {
                setSelectedProduct(row);
                setProductDrawerOpen(true);
              }}
            />
          )}
        </div>
      </section>

      {/* Client Detail Drawer */}
      <DetailDrawer
        className="overflow-hidden flex flex-col"
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeClient();
        }}
      >
        {panelClient && (
          <ClientDetailPanel
            client={panelClient}
            onViewFull={() => goToProfile(panelClient.id)}
          />
        )}
      </DetailDrawer>

      {/* Product Detail Drawer */}
      <DetailDrawer
        className="overflow-hidden flex flex-col"
        open={productDrawerOpen}
        onOpenChange={(open) => {
          setProductDrawerOpen(open);
          if (!open) setSelectedProduct(null);
        }}
      >
        {selectedProduct && (
          <ProductDetailDrawer
            product={selectedProduct}
            clients={clients}
            onViewFullProfile={goToProfile}
          />
        )}
      </DetailDrawer>

      {/* Nine Box Cell Drawer */}
      <DetailDrawer
        className="overflow-hidden flex flex-col"
        open={nineBoxDrawerOpen}
        onOpenChange={(open) => {
          setNineBoxDrawerOpen(open);
          if (!open) setNineBoxCell(null);
        }}
      >
        {nineBoxCell && (
          <NineBoxCellDrawer cell={nineBoxCell} onViewFullProfile={goToProfile} />
        )}
      </DetailDrawer>
    </>
  );
}
