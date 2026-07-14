"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TabGroup,
  Button,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Pagination,
  SearchInput,
  Tooltip,
} from "@sarunyu/system-one";
import {
  PhoneListIcon,
  EnvelopeSimpleIcon,
  UserIcon,
  ClipboardTextIcon,
  CalendarPlusIcon,
  ArrowLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails } from "@/lib/mock-data";
import { ALLOCATION_SLICES } from "@/components/AssetSummarySection";
import { useClients } from "@/hooks/use-api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AssetSummarySection, type AssetHeroSummary } from "@/components/AssetSummarySection";
import { ClientAssetSidebarContent, type AssetListViewMode } from "@/components/ClientAssetSidebarContent";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import {
  getAssetAccountDetail,
  getAssetProductDetail,
  type AssetAccountItem,
} from "@/data/asset-account-details";
import {
  LINE_AVAILABLE_RATIO,
  LIABILITIES_MULTIPLIER,
  parseAumToThb,
  parsePlYtdPct,
  formatThbAmount,
  formatThaiUpdatedAt,
} from "@/lib/client-utils";

type Client = (typeof mockClients)[number];

// ─── Product view types ───────────────────────────────────────────────────────

type ProductHolder = {
  clientId: string;
  clientName: string;
  tier: string;
  allocationPct: number;
  amountThb: number;
};

type ProductRow = {
  label: string;
  statusIcon: string;
  clientCount: number;
  totalAmountThb: number;
  avgAllocationPct: number;
  holders: ProductHolder[];
};

type ViewFilter = "customer" | "product";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildHeroSummaryFromClients(clients: Client[]): AssetHeroSummary {
  const updatedAt = formatThaiUpdatedAt(new Date());

  if (clients.length === 0) {
    return {
      netValue: "0.00",
      changeAmount: "+0.00",
      changePercent: "0.00",
      changePositive: true,
      lineAvailable: "0.00",
      cash: "0.00",
      lastUpdatedDate: updatedAt.date,
      lastUpdatedTime: updatedAt.time,
    };
  }

  let netValue = 0;
  let cash = 0;
  let lineAvailable = 0;
  let plChange = 0;

  for (const client of clients) {
    const aumThb = parseAumToThb(client.aum);
    netValue += aumThb;
    cash += aumThb * (client.cashIdlePct / 100);
    lineAvailable += aumThb * LINE_AVAILABLE_RATIO;

    const pct = parsePlYtdPct(client.plYtd);
    const sign = client.plPositive ? 1 : -1;
    plChange += aumThb * (pct / 100) * sign;
  }

  const changePercent = netValue > 0 ? (plChange / netValue) * 100 : 0;

  return {
    netValue: formatThbAmount(netValue),
    changeAmount: formatThbAmount(plChange, true),
    changePercent: Math.abs(changePercent).toFixed(2),
    changePositive: plChange >= 0,
    lineAvailable: formatThbAmount(lineAvailable),
    cash: formatThbAmount(cash),
    lastUpdatedDate: updatedAt.date,
    lastUpdatedTime: updatedAt.time,
  };
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────

function ClientDetailPanel({
  client,
  onViewFull,
  onBack,
}: {
  client: Client;
  onViewFull: () => void;
  onBack?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetAccountItem | null>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<AssetListViewMode>("product");
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    setCompact(false);
    setDetailVisible(false);
    setDetailMounted(false);
    setSelectedItem(null);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [client.id]);

  const handleItemClick = (item: AssetAccountItem, viewMode: AssetListViewMode) => {
    setSelectedItem(item);
    setSelectedViewMode(viewMode);
    setDetailMounted(true);
    requestAnimationFrame(() => setDetailVisible(true));
  };

  const handleBack = () => {
    setDetailVisible(false);
    setTimeout(() => {
      setDetailMounted(false);
      setSelectedItem(null);
    }, 300);
  };

  const holdingDetail = selectedItem
    ? selectedViewMode === "account"
      ? getAssetAccountDetail(selectedItem.accountNo)
      : getAssetProductDetail(selectedItem.name)
    : null;

  const detailTitle = holdingDetail?.viewByLabel.replace(/^view by /i, "") ?? "";

  const handleScroll = useCallback(() => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setCompact((prev) => {
      if (prev && top <= 4) return false;
      if (!prev && top > 12) return true;
      return prev;
    });
  }, []);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        className={`flex flex-col shrink-0 border-b border-[var(--border-default)] transition-[padding,gap] duration-300 ease-out ${
          compact ? "px-5 py-3 gap-0" : "px-5 pt-5 pb-4 gap-4"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
          )}
          <Avatar
            type="text"
            initials={getInitials(client.name)}
            size={compact ? "s" : "m"}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-foreground leading-tight transition-all duration-300 ${
                compact ? "type-subtitle-2 font-bold" : "type-subtitle-1"
              }`}
            >
              {client.name}
            </p>
            <p className="type-caption text-muted-foreground">{client.id}</p>
          </div>
          {compact ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 mr-8 whitespace-nowrap"
              leftIcon={<UserIcon size={14} />}
              disabled
            >
              View Full Profile
            </Button>
          ) : (
            <div className="w-10 shrink-0" />
          )}
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <PhoneListIcon size={20} />, label: "Call log" },
                { icon: <EnvelopeSimpleIcon size={20} />, label: "Mail" },
                { icon: <ClipboardTextIcon size={20} />, label: "Proposal" },
                { icon: <CalendarPlusIcon size={20} />, label: "Meet" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => {}}
                  className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--bg-default-secondary)] border border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] transition-colors cursor-pointer"
                >
                  <span className="text-primary-action">{icon}</span>
                  <span className="text-[11px] font-medium text-primary-action leading-none">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              leftIcon={<UserIcon size={16} />}
              disabled
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto hide-scrollbar"
      >
        <ClientAssetSidebarContent
          clientId={client.id}
          client={client}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Detail view — covers entire panel including sticky header */}
      {detailMounted && holdingDetail && (
        <div
          className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
            detailVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] flex-1 min-w-0 truncate">
              {detailTitle}
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            <HoldingDetailContent detail={holdingDetail} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortDir = "none" | "asc" | "desc";
type SortKey =
  | "name"
  | "aum"
  | "plYtd"
  | null;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ClientHubPage() {
  const router = useRouter();
  const clients = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("customer");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [productPushClient, setProductPushClient] = useState<Client | null>(null);
  const [productPushMounted, setProductPushMounted] = useState(false);
  const [productPushVisible, setProductPushVisible] = useState(false);

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

    const key = sortKey as keyof Client | null;
    const dir = sortDir;
    if (key && dir !== "none") {
      list = [...list].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        return av < bv
          ? dir === "asc"
            ? -1
            : 1
          : av > bv
            ? dir === "asc"
              ? 1
              : -1
            : 0;
      });
    }

    return list;
  }, [search, sortKey, sortDir, clients]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const heroSummary = useMemo(() => {
    const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
    return buildHeroSummaryFromClients(visible);
  }, [sorted, safePage]);

  const productRows = useMemo((): ProductRow[] => {
    const map = new Map<string, { statusIcon: string; holders: ProductHolder[] }>();
    for (const client of clients) {
      const detail = mockClientDetails[client.id];
      const slices = detail?.assetSummary?.allocationSlices?.length
        ? detail.assetSummary.allocationSlices
        : ALLOCATION_SLICES;
      const aumThb = parseAumToThb(client.aum);
      for (const slice of slices) {
        if (slice.percent <= 0) continue;
        if (!map.has(slice.label)) map.set(slice.label, { statusIcon: slice.statusIcon, holders: [] });
        map.get(slice.label)!.holders.push({
          clientId: client.id,
          clientName: client.name,
          tier: client.tier,
          allocationPct: slice.percent,
          amountThb: aumThb * (slice.percent / 100),
        });
      }
    }
    return Array.from(map.entries())
      .map(([label, { statusIcon, holders }]) => ({
        label,
        statusIcon,
        clientCount: holders.length,
        totalAmountThb: holders.reduce((s, h) => s + h.amountThb, 0),
        avgAllocationPct: holders.reduce((s, h) => s + h.allocationPct, 0) / holders.length,
        holders: [...holders].sort((a, b) => b.amountThb - a.amountThb),
      }))
      .sort((a, b) => b.totalAmountThb - a.totalAmountThb);
  }, [clients]);

  function openClient(client: Client) {
    setSelectedClient(client);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <AssetSummarySection heroSummary={heroSummary} />

        <section className="-mx-4 lg:-mx-6 -mb-4 lg:-mb-6 px-4 lg:px-6 flex flex-col gap-3 pt-4 lg:pt-6 pb-6 bg-white rounded-t-[16px] lg:rounded-t-2xl">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <TabGroup
              items={[
                { id: "customer", title: `Customer (${sorted.length})` },
                { id: "product", title: `Product (${productRows.length})` },
              ]}
              activeId={viewFilter}
              size="md"
              onChange={(id) => setViewFilter(id as ViewFilter)}
            />
            {viewFilter === "customer" && (
              <div className="flex-1 min-w-[200px] lg:flex-none lg:w-56">
                <SearchInput
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
                  size="sm"
                />
              </div>
            )}
          </div>

          {viewFilter === "customer" ? (
            <>
              {/* Customer Table */}
              <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
                <Table className="table-fixed min-w-[960px]">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="w-[6%]">
                        No.
                      </TableHeaderCell>
                      <TableHeaderCell className="w-[9%] whitespace-nowrap">
                        Client ID
                      </TableHeaderCell>
                      <TableHeaderCell
                        className="w-[20%]"
                        sortDirection={dirFor("name")}
                        onSortChange={handleSort("name")}
                      >
                        Client
                      </TableHeaderCell>
                      <TableHeaderCell
                        className="w-[14%]"
                        sortDirection={dirFor("aum")}
                        onSortChange={handleSort("aum")}
                      >
                        AUM (THB)
                      </TableHeaderCell>
                      <TableHeaderCell
                        className="w-[11%]"
                        sortDirection={dirFor("plYtd")}
                        onSortChange={handleSort("plYtd")}
                      >
                        P&L (YTD)
                      </TableHeaderCell>
                      <TableHeaderCell className="w-[13%]">
                        Liabilities (THB)
                      </TableHeaderCell>
                      <TableHeaderCell className="whitespace-nowrap">
                        เงินสด (THB)
                      </TableHeaderCell>
                      <TableHeaderCell className="w-[11%] whitespace-nowrap">
                        AI Score
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((client, index) => {
                      const rowNo = (safePage - 1) * pageSize + index + 1;

                      return (
                        <Tooltip
                          key={client.id}
                          content="View client profile"
                          side="top"
                          delayDuration={400}
                        >
                          <TableRow
                            className="cursor-pointer"
                            hoverable
                            onClick={() => openClient(client)}
                          >
                            <TableCell>
                              <p className="text-[13px] text-muted-foreground">
                                {rowNo}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-[13px] text-muted-foreground font-mono">
                                {client.id}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  type="text"
                                  initials={getInitials(client.name)}
                                  size="s"
                                />
                                <p className="text-[14px] font-semibold text-foreground leading-tight truncate">
                                  {client.name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-[14px] font-semibold text-foreground">
                                {formatThbAmount(parseAumToThb(client.aum))}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p
                                className={`text-[14px] font-semibold leading-tight ${client.plPositive ? "text-success" : "text-destructive"}`}
                              >
                                {client.plYtd}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-[14px] font-semibold text-foreground">
                                {formatThbAmount(parseAumToThb(client.aum) * LIABILITIES_MULTIPLIER)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-[14px] font-semibold text-foreground">
                                {formatThbAmount(parseAumToThb(client.aum) * (client.cashIdlePct / 100))}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-default-secondary)] flex items-center justify-center">
                                  <span className="text-[13px] font-bold text-muted-foreground/40">—</span>
                                </div>
                                <span className="text-[11px] font-medium text-muted-foreground/50 italic leading-tight">
                                  Coming<br />soon
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </Tooltip>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

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
            /* Product Table */
            <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
              <Table className="table-fixed min-w-[640px]">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                    <TableHeaderCell className="w-[30%]">Product</TableHeaderCell>
                    <TableHeaderCell className="w-[18%] whitespace-nowrap"># Clients</TableHeaderCell>
                    <TableHeaderCell className="w-[26%] whitespace-nowrap">Total AUM (THB)</TableHeaderCell>
                    <TableHeaderCell className="w-[21%] whitespace-nowrap">Avg Allocation</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productRows.map((row, index) => (
                    <TableRow
                      key={row.label}
                      className="cursor-pointer"
                      hoverable
                      onClick={() => {
                        setSelectedProduct(row);
                        setProductDrawerOpen(true);
                      }}
                    >
                      <TableCell>
                        <p className="text-[13px] text-muted-foreground">{index + 1}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="relative shrink-0 size-2">
                            <img alt="" className="block size-full max-w-none" src={row.statusIcon} />
                          </span>
                          <p className="text-[14px] font-semibold text-foreground truncate">{row.label}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{row.clientCount}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{formatThbAmount(row.totalAmountThb)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">{row.avgAllocationPct.toFixed(1)}%</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      {/* Client Detail Drawer */}
      <Sheet
        modal={false}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedClient(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full lg:w-[30vw] lg:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {selectedClient && (
            <ClientDetailPanel
              client={selectedClient}
              onViewFull={() => router.push(`/client/${selectedClient.id}`)}
              onBack={undefined}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Drawer */}
      <Sheet
        modal={false}
        open={productDrawerOpen}
        onOpenChange={(open) => {
          setProductDrawerOpen(open);
          if (!open) {
            setSelectedProduct(null);
            setProductPushClient(null);
            setProductPushMounted(false);
            setProductPushVisible(false);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full lg:w-[30vw] lg:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {selectedProduct && (
            <div className="flex flex-col h-full relative overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-default)] shrink-0">
                <span className="relative shrink-0 size-3">
                  <img alt="" className="block size-full max-w-none" src={selectedProduct.statusIcon} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="type-subtitle-1 font-bold text-foreground truncate">{selectedProduct.label}</p>
                  <p className="type-caption text-muted-foreground">{selectedProduct.clientCount} clients</p>
                </div>
              </div>
              <div className="flex gap-3 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-default-secondary)] shrink-0">
                <div className="flex-1 flex flex-col gap-0.5 px-4 py-3 bg-white rounded-xl border border-[var(--border-default)]">
                  <p className="type-caption text-muted-foreground">Total AUM</p>
                  <p className="type-subtitle-2 font-bold text-foreground">
                    {formatThbAmount(selectedProduct.totalAmountThb)}{" "}
                    <span className="type-body-2 font-normal text-muted-foreground">THB</span>
                  </p>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 px-4 py-3 bg-white rounded-xl border border-[var(--border-default)]">
                  <p className="type-caption text-muted-foreground">Avg Allocation</p>
                  <p className="type-subtitle-2 font-bold text-foreground">{selectedProduct.avgAllocationPct.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-2 p-4">
                  {selectedProduct.holders.map((holder, i) => (
                    <button
                      key={holder.clientId}
                      type="button"
                      className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-3 flex items-center gap-3 w-full text-left hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                      onClick={() => {
                        const c = clients.find((cl) => cl.id === holder.clientId);
                        if (c) {
                          setProductPushClient(c);
                          setProductPushMounted(true);
                          requestAnimationFrame(() => setProductPushVisible(true));
                        }
                      }}
                    >
                      <Avatar type="text" initials={getInitials(holder.clientName)} size="s" />
                      <div className="flex-1 min-w-0">
                        <p className="type-subtitle-2 font-semibold text-foreground truncate">{holder.clientName}</p>
                        <p className="type-caption text-muted-foreground">{holder.clientId} · {holder.tier}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="type-subtitle-2 font-bold text-foreground">{holder.allocationPct.toFixed(1)}%</p>
                        <p className="type-caption text-muted-foreground">{formatThbAmount(holder.amountThb)} THB</p>
                      </div>
                      <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Push overlay: client detail */}
              {productPushMounted && productPushClient && (
                <div
                  className={`absolute inset-0 z-20 bg-white flex flex-col transition-transform duration-300 ease-out ${
                    productPushVisible ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <ClientDetailPanel
                    client={productPushClient}
                    onViewFull={() => router.push(`/client/${productPushClient.id}`)}
                    onBack={() => {
                      setProductPushVisible(false);
                      setTimeout(() => {
                        setProductPushMounted(false);
                        setProductPushClient(null);
                      }, 300);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
