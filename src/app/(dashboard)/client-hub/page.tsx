"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TabGroup, SearchInput, Pagination } from "@sarunyu/system-one";
import { useClients } from "@/hooks/use-api";
import { usePrivacy } from "@/contexts/privacy-context";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { NineBoxTab, type NineBoxCellInfo } from "./NineBoxTab";
import { CUSTOMER_COLUMNS } from "./columns";
import { getSortValue, buildProductRows } from "./client-hub-data";
import { ClientSummaryCards } from "./ClientSummaryCards";
import { CustomerTable } from "./CustomerTable";
import { ProductTable } from "./ProductTable";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { NineBoxCellDrawer } from "./NineBoxCellDrawer";
import { ClientDetailPanel } from "./ClientDetailPanel";
import type { ColumnId, SortDir, SortKey, ViewFilter } from "./types";
import type { Client, ProductRow } from "@/types/domain";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ClientHubPage() {
  const router = useRouter();
  const clients = useClients();
  const { isPrivate } = usePrivacy();

  // Customer view
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("customer");
  const [visibleColumns] = useState<Set<ColumnId>>(
    () => new Set(CUSTOMER_COLUMNS.map((c) => c.id)),
  );

  // Product view
  const [productSearch, setProductSearch] = useState("");

  // Drawers
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [nineBoxCell, setNineBoxCell] = useState<NineBoxCellInfo | null>(null);
  const [nineBoxDrawerOpen, setNineBoxDrawerOpen] = useState(false);


  const tableWidth = useMemo(() => {
    const NO_COL_WIDTH = 60;
    return NO_COL_WIDTH + CUSTOMER_COLUMNS.reduce(
      (sum, c) => sum + (visibleColumns.has(c.id) ? c.width : 0),
      0,
    );
  }, [visibleColumns]);

  const dirFor = (k: SortKey): SortDir => (sortKey === k ? sortDir : "none");
  const handleSort = (k: SortKey) => (next: SortDir) => {
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
    setCurrentPage(1);
  };

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

    if (sortKey && sortDir !== "none") {
      const origIdx = sortKey === "rowIndex"
        ? new Map(clients.map((c, i) => [c.id, i]))
        : null;
      list = [...list].sort((a, b) => {
        const av = origIdx ? (origIdx.get(a.id) ?? 0) : getSortValue(a, sortKey);
        const bv = origIdx ? (origIdx.get(b.id) ?? 0) : getSortValue(b, sortKey);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [search, sortKey, sortDir, clients]);

  const originalIndexMap = useMemo(
    () => new Map(clients.map((c, i) => [c.id, i + 1])),
    [clients],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const productRows = useMemo(() => buildProductRows(clients), [clients]);
  const filteredProductRows = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return q ? productRows.filter((r) => r.label.toLowerCase().includes(q)) : productRows;
  }, [productRows, productSearch]);

  function openClient(client: Client) {
    setSelectedClient(client);
    setDrawerOpen(true);
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
                dirFor={dirFor}
                onSort={handleSort}
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
          setDrawerOpen(open);
          if (!open) setSelectedClient(null);
        }}
      >
        {selectedClient && (
          <ClientDetailPanel
            client={selectedClient}
            onViewFull={() => goToProfile(selectedClient.id)}
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
