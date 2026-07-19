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
  CaretDownIcon,
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails } from "@/lib/mock-data";
import { ALLOCATION_SLICES } from "@/components/AssetSummarySection";
import { useClients } from "@/hooks/use-api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatCardRow } from "@/components/ui/finance-ui";
import { AssetSummarySection, type AssetHeroSummary } from "@/components/AssetSummarySection";
import { ClientAssetSidebarContent, type AssetListViewMode } from "@/components/ClientAssetSidebarContent";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import { NineBoxTab } from "./NineBoxTab";
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
import { PRODUCT_SUB_DATA, type SubProduct } from "@/data/product-sub-data";

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

type ViewFilter = "customer" | "product" | "nine-box";

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
              onClick={onViewFull}
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
              onClick={onViewFull}
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
  | "rowIndex"
  | "id"
  | "name"
  | "aum"
  | "plYtd"
  | "liabilities"
  | "cashIdle"
  | null;

function getSortValue(c: Client, key: SortKey): number | string {
  switch (key) {
    case "id": return c.id;
    case "name": return c.name;
    case "aum": return parseAumToThb(c.aum);
    case "plYtd": { const m = c.plYtd.match(/([+-]?[\d.]+)/); return m ? parseFloat(m[1]) : 0; }
    case "liabilities": return parseAumToThb(c.aum) * LIABILITIES_MULTIPLIER;
    case "cashIdle": return parseAumToThb(c.aum) * (c.cashIdlePct / 100);
    default: return 0;
  }
}

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
  const [productSearch, setProductSearch] = useState("");
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [productDetailTab, setProductDetailTab] = useState<"sub" | "clients">("sub");
  const [expandedSubIds, setExpandedSubIds] = useState<Set<string>>(new Set());
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
      {/* Hero — own padding + max-width */}
      <div className="p-4 xl:p-6">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          <AssetSummarySection heroSummary={heroSummary} />
        </div>
      </div>

      {/* White section — full-width background, content constrained to max-w */}
      <section className="flex-1 bg-white rounded-t-[16px] xl:rounded-t-2xl">
        <div className="max-w-[1280px] mx-auto px-4 xl:px-6 flex flex-col gap-3 pt-4 xl:pt-6 pb-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <TabGroup
              items={[
                { id: "customer", title: `Customer (${sorted.length})` },
                { id: "product", title: `Product (${productSearch.trim() ? productRows.filter((r) => r.label.toLowerCase().includes(productSearch.toLowerCase())).length : productRows.length})` },
                { id: "nine-box", title: "Nine Box" },
              ]}
              activeId={viewFilter}
              size="md"
              onChange={(id) => setViewFilter(id as ViewFilter)}
            />
            {viewFilter === "customer" && (
              <div className="w-full lg:w-56 lg:ml-auto">
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
            <NineBoxTab clients={sorted} onSelectClient={(c) => setSelectedClient(c)} />
          ) : viewFilter === "customer" ? (
            <>
              {/* Customer Table */}
              <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
                <Table className="table-fixed min-w-[960px]">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell
                        className="w-[6%]"
                        sortDirection={dirFor("rowIndex")}
                        onSortChange={handleSort("rowIndex")}
                      >
                        No.
                      </TableHeaderCell>
                      <TableHeaderCell
                        className="w-[9%] whitespace-nowrap"
                        sortDirection={dirFor("id")}
                        onSortChange={handleSort("id")}
                      >
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
                      <TableHeaderCell
                        className="w-[13%]"
                        sortDirection={dirFor("liabilities")}
                        onSortChange={handleSort("liabilities")}
                      >
                        Liabilities (THB)
                      </TableHeaderCell>
                      <TableHeaderCell
                        className="whitespace-nowrap"
                        sortDirection={dirFor("cashIdle")}
                        onSortChange={handleSort("cashIdle")}
                      >
                        เงินสด (THB)
                      </TableHeaderCell>
                      <TableHeaderCell className="w-[11%] whitespace-nowrap">
                        AI Score
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((client) => {
                      const rowNo = originalIndexMap.get(client.id) ?? 0;

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
                  {(productSearch.trim()
                    ? productRows.filter((r) => r.label.toLowerCase().includes(productSearch.toLowerCase()))
                    : productRows
                  ).map((row, index) => (
                    <TableRow
                      key={row.label}
                      className="cursor-pointer"
                      hoverable
                      onClick={() => {
                        setSelectedProduct(row);
                        const hasSub = (PRODUCT_SUB_DATA[row.label]?.length ?? 0) > 0;
                        setProductDetailTab(hasSub ? "sub" : "clients");
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
        </div>
      </section>

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
          className="w-full md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw] overflow-hidden p-0 flex flex-col"
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
            setProductDetailTab("sub");
            setExpandedSubIds(new Set());
            setProductPushClient(null);
            setProductPushMounted(false);
            setProductPushVisible(false);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw] overflow-hidden p-0 flex flex-col"
        >
          {selectedProduct && (
            <div className="flex flex-col h-full relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-default)] shrink-0">
                <span className="relative shrink-0 size-3">
                  <img alt="" className="block size-full max-w-none" src={selectedProduct.statusIcon} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="type-subtitle-1 font-bold text-foreground truncate">{selectedProduct.label}</p>
                  <p className="type-caption text-muted-foreground">{selectedProduct.clientCount} clients</p>
                </div>
              </div>

              {/* Stats */}
              <div className="shrink-0">
                <StatCardRow
                  stats={[
                    {
                      label: "Total AUM",
                      value: (
                        <>
                          {formatThbAmount(selectedProduct.totalAmountThb)}{" "}
                          <span className="type-body-2 font-normal text-muted-foreground">THB</span>
                        </>
                      ),
                    },
                    {
                      label: "Avg Allocation",
                      value: `${selectedProduct.avgAllocationPct.toFixed(1)}%`,
                    },
                  ]}
                />
              </div>

              {/* Tabs */}
              {(() => {
                const subProducts: SubProduct[] = PRODUCT_SUB_DATA[selectedProduct.label] ?? [];
                const hasSub = subProducts.length > 0;
                return (
                  <>
                    {hasSub && (
                      <div className="shrink-0 px-4 pt-3 pb-0">
                        <TabGroup
                          items={[
                            { id: "sub", title: `Holdings (${subProducts.length})` },
                            { id: "clients", title: `Clients (${selectedProduct.clientCount})` },
                          ]}
                          activeId={productDetailTab}
                          size="sm"
                          onChange={(id) => setProductDetailTab(id as "sub" | "clients")}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                      {/* Sub-products tab */}
                      {hasSub && productDetailTab === "sub" && (
                        <div className="flex flex-col gap-2 p-4">
                          {/* Expand / Collapse All */}
                          <div className="flex justify-end sticky top-0 bg-white py-1 -mx-4 px-4 z-10">
                            {expandedSubIds.size === subProducts.length ? (
                              <button
                                type="button"
                                className="text-[12px] text-blue-600 hover:underline cursor-pointer"
                                onClick={() => setExpandedSubIds(new Set())}
                              >
                                Collapse All
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-[12px] text-blue-600 hover:underline cursor-pointer"
                                onClick={() => setExpandedSubIds(new Set(subProducts.map((s) => s.id)))}
                              >
                                Expand All
                              </button>
                            )}
                          </div>
                          {subProducts.map((sub) => {
                            const isExpanded = expandedSubIds.has(sub.id);
                            // Use first N holders as mock client data for this sub-product
                            const subHolders = selectedProduct.holders.slice(0, sub.clientCount);
                            return (
                              <div
                                key={sub.id}
                                className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden"
                              >
                                {/* Card header — clickable */}
                                <button
                                  type="button"
                                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
                                  onClick={() => setExpandedSubIds((prev) => {
                                    const next = new Set(prev);
                                    isExpanded ? next.delete(sub.id) : next.add(sub.id);
                                    return next;
                                  })}
                                >
                                  {/* Ticker + name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {sub.ticker && (
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                          {sub.ticker}
                                        </span>
                                      )}
                                      <p className="text-[13px] font-semibold text-foreground truncate">{sub.name}</p>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground">{formatThbAmount(sub.totalAmountThb)} THB</p>
                                  </div>

                                  {/* Client count badge (prominent) */}
                                  <div className="shrink-0 flex flex-col items-center bg-[var(--bg-default-secondary)] rounded-lg px-3 py-1.5 min-w-[52px]">
                                    <span className="text-[18px] font-bold text-foreground leading-none">{sub.clientCount}</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">clients</span>
                                  </div>

                                  {/* Chevron */}
                                  <CaretDownIcon
                                    size={20}
                                    className={`text-[var(--text-default-tertiary)] shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {/* Expanded client list */}
                                {isExpanded && (
                                  <div className="border-t border-[rgba(0,0,0,0.07)]">
                                    {subHolders.map((holder) => (
                                      <button
                                        key={holder.clientId}
                                        type="button"
                                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-default-secondary)] transition-colors cursor-pointer"
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
                                          <p className="text-[13px] font-semibold text-foreground truncate">{holder.clientName}</p>
                                          <p className="type-caption text-muted-foreground">{holder.clientId} · {holder.tier}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <p className="text-[12px] font-bold text-foreground">{holder.allocationPct.toFixed(1)}%</p>
                                          <p className="type-caption text-muted-foreground">{formatThbAmount(holder.amountThb)} THB</p>
                                        </div>
                                        <CaretRightIcon size={20} className="text-[var(--text-default-tertiary)] shrink-0" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Clients tab */}
                      {(!hasSub || productDetailTab === "clients") && (
                        <div className="flex flex-col gap-2 p-4">
                          {selectedProduct.holders.map((holder) => (
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
                      )}
                    </div>
                  </>
                );
              })()}


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
