"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TabGroup,
  Button,
  Avatar,
  Tag,
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
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails } from "@/lib/mock-data";
import { useClients } from "@/hooks/use-api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AssetSummarySection, type AssetHeroSummary } from "@/components/AssetSummarySection";
import { ClientAssetSidebarContent } from "@/components/ClientAssetSidebarContent";
import { DEFAULT_ASSET_ACCOUNTS } from "@/data/asset-account-details";
import {
  LINE_AVAILABLE_RATIO,
  LIABILITIES_MULTIPLIER,
  parseAumToThb,
  parsePlYtdPct,
  formatThbAmount,
  formatThaiUpdatedAt,
} from "@/lib/client-utils";

type Client = (typeof mockClients)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function computeLiabilities(aum: string): string {
  const match = aum.match(/([\d.]+)/);
  if (!match) return "—";
  const liabM = parseFloat(match[1]) * LIABILITIES_MULTIPLIER;
  return liabM >= 1
    ? `฿ ${liabM.toFixed(2)}M`
    : `฿ ${(liabM * 1000).toFixed(0)}k`;
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
}: {
  client: Client;
  onViewFull: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [client.id]);

  const handleScroll = useCallback(() => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setCompact((prev) => {
      if (prev && top <= 4) return false;
      if (!prev && top > 12) return true;
      return prev;
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex flex-col shrink-0 border-b border-[var(--border-default)] transition-[padding,gap] duration-300 ease-out ${
          compact ? "px-5 py-3 gap-0" : "px-5 pt-5 pb-4 gap-4"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
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
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <ClientAssetSidebarContent clientId={client.id} client={client} />
      </div>
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

const PAGE_SIZE = 10;

export default function ClientHubPage() {
  const router = useRouter();
  const clients = useClients();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [currentPage, setCurrentPage] = useState(1);

  const tabItems = [
    { id: "all", title: "All Clients" },
    {
      id: "priority",
      title: "High Priority",
      notification: clients.filter((c) => c.aiScore >= 90).length,
    },
    {
      id: "attention",
      title: "Requires Attention",
      notification: clients.filter(
        (c) => c.status === "error" || c.status === "hold",
      ).length,
    },
    { id: "uhnw", title: "UHNW Tier" },
  ];

  const dirFor = (k: SortKey): SortDir => (sortKey === k ? sortDir : "none");
  const handleSort = (k: SortKey) => (next: SortDir) => {
    setSortKey(next === "none" ? null : k);
    setSortDir(next);
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    let list = clients;
    if (activeTab === "priority") list = list.filter((c) => c.aiScore >= 90);
    else if (activeTab === "attention")
      list = list.filter((c) => c.status === "error" || c.status === "hold");
    else if (activeTab === "uhnw") list = list.filter((c) => c.tier === "UHNW");

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
  }, [activeTab, search, sortKey, sortDir, clients]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const heroSummary = useMemo(() => {
    const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    return buildHeroSummaryFromClients(visible);
  }, [sorted, safePage]);

  function openClient(client: Client) {
    setSelectedClient(client);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Tabs — hidden for now */}
        <div className="hidden">
          <TabGroup
            items={tabItems}
            activeId={activeTab}
            onChange={(id) => {
              setActiveTab(id);
              setCurrentPage(1);
            }}
            size="md"
          />
        </div>

        <AssetSummarySection heroSummary={heroSummary} />

        <section className="-mx-4 lg:-mx-6 -mb-4 lg:-mb-6 px-4 lg:px-6 flex flex-col gap-3 pt-4 lg:pt-6 pb-6 bg-white rounded-t-[16px] lg:rounded-t-2xl">
          <div className="flex justify-end lg:justify-end">
            <div className="w-full lg:w-56 lg:max-w-none">
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
          </div>

        {/* Table */}
        <div className="overflow-hidden overflow-x-auto rounded-lg border border-[var(--border-default)]">
          <Table className="table-fixed min-w-[960px]">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[4%]">
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
                  AUM
                </TableHeaderCell>
                <TableHeaderCell
                  className="w-[11%]"
                  sortDirection={dirFor("plYtd")}
                  onSortChange={handleSort("plYtd")}
                >
                  P&L (YTD)
                </TableHeaderCell>
                <TableHeaderCell className="w-[13%]">
                  Liabilities
                </TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">
                  รายการสินทรัพย์
                </TableHeaderCell>
                <TableHeaderCell className="w-[11%] whitespace-nowrap">
                  AI Score
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((client, index) => {
                const liabilities = computeLiabilities(client.aum);
                const productCount = (mockClientDetails[client.id]?.allocationData ?? []).length;
                const accountCount = DEFAULT_ASSET_ACCOUNTS.length;
                const rowNo = (safePage - 1) * PAGE_SIZE + index + 1;

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
                      {/* NO. */}
                      <TableCell>
                        <p className="text-[13px] text-muted-foreground">
                          {rowNo}
                        </p>
                      </TableCell>

                      {/* CLIENT ID */}
                      <TableCell>
                        <p className="text-[13px] text-muted-foreground font-mono">
                          {client.id}
                        </p>
                      </TableCell>

                      {/* CLIENT */}
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

                      {/* AUM */}
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">
                          {client.aum}
                        </p>
                      </TableCell>

                      {/* P&L (YTD) */}
                      <TableCell>
                        <p
                          className={`text-[14px] font-semibold leading-tight ${client.plPositive ? "text-success" : "text-destructive"}`}
                        >
                          {client.plYtd}
                        </p>
                      </TableCell>

                      {/* LIABILITIES */}
                      <TableCell>
                        <p className="text-[14px] font-semibold text-foreground">
                          {liabilities}
                        </p>
                      </TableCell>

                      {/* รายการสินทรัพย์ */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[13px] text-foreground">
                            <span className="font-semibold">{productCount}</span>
                            <span className="text-muted-foreground"> by Product</span>
                          </p>
                          <p className="text-[13px] text-foreground">
                            <span className="font-semibold">{accountCount}</span>
                            <span className="text-muted-foreground"> by Account</span>
                          </p>
                        </div>
                      </TableCell>

                      {/* AI SCORE */}
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

        <div className="flex items-center justify-end gap-4">
          <p className="text-[12px] text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min(safePage * PAGE_SIZE, sorted.length)}
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
          className="w-full sm:w-[420px] sm:max-w-[420px] overflow-hidden p-0 flex flex-col"
        >
          {selectedClient && (
            <ClientDetailPanel
              client={selectedClient}
              onViewFull={() => router.push(`/client/${selectedClient.id}`)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
