"use client";

import { Suspense, use, useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar, Card, TabGroup } from "@sarunyu/system-one";
import { ClientAssetSidebarContent } from "@/components/ClientAssetSidebarContent";
import {
  PhoneIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EnvelopeSimpleIcon,
  ChatCircleIcon,
  FileTextIcon,
  AlarmIcon,
} from "@phosphor-icons/react";
import { mockClients, mockClientDetails } from "@/lib/mock-data";
import { useClients, useNBAActions } from "@/hooks/use-api";
import { usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";
import { getInitials } from "@/lib/client-utils";
import { setQueryState } from "@/lib/query-state";
import { useSetHeaderSlot } from "../../header-slot-context";
import { usePageBreadcrumb } from "../../page-breadcrumbs";
import { ResponsiveBreadcrumb } from "@/components/layout/ResponsiveBreadcrumb";
import { NineBoxCellPill } from "../../client-hub/NineBoxTab";
import { getCallLogs } from "@/data/call-log-data";
import { getClientProfile } from "@/data/client-profiles";
import { LiabilitiesDetailModal } from "@/components/LiabilitiesDetailModal";
import type { LiabilitiesDetail } from "@/data/liabilities-details";
import {
  clientDetailById,
  lastContactFromCallLogs,
  type SortDir,
  type HoldingsSortKey,
} from "./client-detail-data";
import { CallLogTable, EmptyTabState } from "./ClientSections";
import { KycTab } from "./KycTab";
import { OverviewTab } from "./OverviewTab";

/** Sub-tabs that `?tab=` may address; anything else falls back to Overview. */
const CLIENT_TABS = ["overview", "kyc", "assets", "call-log"];

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Keyed remount on client id — this page reuses the same component instance
  // across in-app navigations between different clients (same route segment),
  // so header-collapse / sort state would otherwise leak between clients.
  return (
    <Suspense fallback={null}>
      <ClientPageInner key={id} id={id} />
    </Suspense>
  );
}

function ClientPageInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isPrivate } = usePrivacy();
  const clients = useClients();
  const nbaActions = useNBAActions(clients);

  // Same source as the desktop top-bar breadcrumb — this page renders its own
  // only so it can live inside the sticky identity bar.
  const breadcrumb = usePageBreadcrumb(pathname, { clients, isPrivate });

  const client = clients.find((c) => c.id === id) ?? clients[0] ?? mockClients[0];
  const maskedClientName = maskName(client.name, isPrivate);
  const detail = clientDetailById[client.id] ?? mockClientDetails["1"];

  // Page tab state — URL-owned, so returning to this profile (browser back or
  // the sidebar's Client 360 entry) comes back to the sub-tab left open.
  // `replace`: sub-tabs are views of one profile, not stops worth unwinding.
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && CLIENT_TABS.includes(tabParam) ? tabParam : "overview";
  const setActiveTab = (tab: string) =>
    setQueryState(`/client/${id}?tab=${tab}`, "replace");

  // Holdings sort state
  const [holdingsSortDir, setHoldingsSortDir] = useState<SortDir>("none");
  const [holdingsSortKey, setHoldingsSortKey] = useState<HoldingsSortKey>(null);

  // NBA action for this client (provides aiDraft + revenueImpact for AI cards)
  const nbaAction = nbaActions.find((a) => a.clientId === client.id);
  const callLogs = getCallLogs(client.id);
  const profile = getClientProfile(client.id);
  const [liabilitiesOpen, setLiabilitiesOpen] = useState(false);
  const [liabilitiesData, setLiabilitiesData] = useState<{ amount: string; detail: LiabilitiesDetail } | null>(null);

  const setHeaderSlot = useSetHeaderSlot();

  // Compact sticky header on scroll
  const [scrolled, setScrolled] = useState(false);
  const collapsedRef = useRef(false);
  const lockUntilRef = useRef(0);
  const quickContactRef = useRef<HTMLDivElement>(null);

  // Force the initial scroll offset to 0 — with scroll-snap + a negative-margin
  // bleed container, some browsers land on a non-zero offset on first paint.
  useEffect(() => {
    if (quickContactRef.current) quickContactRef.current.scrollLeft = 0;
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      const now = Date.now();
      if (now < lockUntilRef.current) return; // ignore events during transition
      const top = main.scrollTop;
      const remaining = main.scrollHeight - main.clientHeight - top;
      if (!collapsedRef.current && top > 50 && remaining > 100) {
        collapsedRef.current = true;
        lockUntilRef.current = now + 400; // block re-triggers for 400ms (> 300ms transition)
        setScrolled(true);
      } else if (collapsedRef.current && top <= 8) {
        collapsedRef.current = false;
        lockUntilRef.current = now + 400;
        setScrolled(false);
      }
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  // Reset header + scroll position on tab change
  const [prevTab, setPrevTab] = useState(activeTab);
  if (prevTab !== activeTab) {
    setPrevTab(activeTab);
    setScrolled(false);
  }
  useEffect(() => {
    collapsedRef.current = false;
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    setHeaderSlot(null);
    return () => setHeaderSlot(null);
  }, [scrolled, activeTab, setHeaderSlot]);

  return (
    <div className="flex flex-col -mt-6">

      {/* Sticky Identity + KPI bar + Tabs */}
      <div className={`sticky -top-6 z-20 -mx-[9999px] px-[9999px] bg-card will-change-transform [overflow-anchor:none] transition-shadow duration-300 ease-out ${scrolled ? "shadow-sm" : ""}`}>
        {/* Mobile/Tablet breadcrumb — inside sticky header */}
        {breadcrumb && (
          <div className="xl:hidden pt-5 pb-0">
            <ResponsiveBreadcrumb items={breadcrumb} />
          </div>
        )}
        <div className={`flex flex-wrap md:flex-nowrap items-center md:items-start xl:items-center justify-between gap-4 lg:gap-8 transition-[padding] duration-300 ease-out ${scrolled ? "py-3" : "py-5"}`}>

          {/* Left: identity + actions */}
          <div className={`flex flex-col ${scrolled ? "justify-center" : "gap-4"}`}>

            {/* Avatar + identity + actions (actions move inline when scrolled on desktop) */}
            <div className={`flex flex-col ${scrolled ? "gap-2 lg:flex-row lg:items-center lg:gap-4" : "gap-4"}`}>

              {/* Avatar + identity */}
              <div className={`flex gap-4 ${scrolled ? "items-center" : "items-start"}`}>
                {!scrolled && (
                  <div className="shrink-0">
                    <Avatar type="text" initials={getInitials(maskedClientName)} size="xxl" />
                  </div>
                )}
                <div className="flex flex-col">
                  {/* Name + Tier + Status pill */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="type-h4 text-foreground leading-none">{maskedClientName}</h4>
                    <NineBoxCellPill client={client} />
                  </div>
                  {/* Metadata — collapses when scrolled */}
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
                    <div className="overflow-hidden min-h-0">
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="type-caption text-muted-foreground">{client.id}</span>
                        <span className="type-caption text-muted-foreground/40">·</span>
                        <span className="type-caption text-muted-foreground">Last Contact: {lastContactFromCallLogs(callLogs)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons — hidden for now, alongside the Notes/Reminder tabs.
                  Whole wrapper removed (not just its contents) so it doesn't leave
                  an empty flex-gap slot in the column above.
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" leftIcon={<PencilSimpleIcon size={16} />}>Notes</Button>
                <Button variant="outline" size="sm" leftIcon={<CalendarCheckIcon size={16} />}>Reminder</Button>
              </div>
              */}

            </div>

            {/* Quick contact — collapses on scroll */}
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
              <div className="overflow-hidden min-h-0 -mx-4 xl:-mx-6">
                <div
                  ref={quickContactRef}
                  className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory px-4 xl:px-6 py-0.5 [scroll-padding-inline:1rem] xl:[scroll-padding-inline:1.5rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-muted/70 text-foreground hover:text-primary-action hover:bg-primary-action-light transition-colors shrink-0 whitespace-nowrap snap-start"
                  >
                    <span className="flex items-center justify-center size-6 rounded-full bg-card shadow-sm shrink-0">
                      <PhoneIcon size={13} className="text-muted-foreground" />
                    </span>
                    <span className="type-caption font-medium">{profile.phone}</span>
                  </a>
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-muted/70 text-foreground hover:text-primary-action hover:bg-primary-action-light transition-colors shrink-0 whitespace-nowrap snap-start"
                  >
                    <span className="flex items-center justify-center size-6 rounded-full bg-card shadow-sm shrink-0">
                      <EnvelopeSimpleIcon size={13} className="text-muted-foreground" />
                    </span>
                    <span className="type-caption font-medium">{profile.email}</span>
                  </a>
                  {profile.lineId && (
                    <span className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-muted/70 text-foreground shrink-0 whitespace-nowrap snap-start">
                      <span className="flex items-center justify-center size-6 rounded-full bg-card shadow-sm shrink-0">
                        <ChatCircleIcon size={13} className="text-muted-foreground" />
                      </span>
                      <span className="type-caption font-medium">{profile.lineId}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: KPIs — fade between sizes, hide on mobile when scrolled */}
          <div className={`flex items-center justify-center gap-8 md:justify-start md:gap-0 shrink-0 w-full md:w-auto bg-[var(--bg-default-secondary)] md:!bg-transparent border border-border md:!border-0 rounded-2xl md:!rounded-none p-4 md:!p-0 ${scrolled ? "hidden sm:flex" : ""}`}>
            <div className="flex flex-col items-center text-center md:items-end md:text-right gap-1 md:pr-8">
              <p className="type-caption text-muted-foreground">Total AUM</p>
              <p className={`text-foreground transition-opacity duration-150 ${scrolled ? "type-subtitle-1" : "type-h3"}`}>{client.aum}</p>
            </div>
            <div className="w-px bg-border self-stretch -my-4 md:my-1 shrink-0" />
            <div className="flex flex-col items-center text-center md:items-end md:text-right gap-1 md:pl-8">
              <p className="type-caption text-muted-foreground">YTD P&L</p>
              <div className="flex items-center gap-1.5">
                {client.plPositive ? (
                  <ArrowUpIcon size={scrolled ? 14 : 18} className="text-success shrink-0" weight="bold" />
                ) : (
                  <ArrowDownIcon size={scrolled ? 14 : 18} className="text-destructive shrink-0" weight="bold" />
                )}
                <p className={`transition-opacity duration-150 ${scrolled ? "type-subtitle-1" : "type-h3"} ${client.plPositive ? "text-success" : "text-destructive"}`}>{client.plYtd}</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Tab navigation ── */}
        <div className="transparent-tabs scrollable-tabs -mx-4 xl:-mx-6 pl-4 xl:pl-6">
          <TabGroup
            items={[
              { id: "overview", title: "Overview" },
              { id: "kyc", title: "KYC" },
              { id: "assets", title: "Assets" },
              { id: "call-log", title: "Call Log" },
              // Hidden for now — keep content branches below, just not shown as tabs.
              // { id: "notes", title: "Notes" },
              // { id: "reminder", title: "Reminder" },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
            size="md"
          />
        </div>
      </div>

      {/* ── Body content ── */}
      {activeTab === "kyc" ? (
        <KycTab client={client} profile={profile} />
      ) : activeTab === "assets" ? (
        <div className="pt-8">
          <ClientAssetSidebarContent
            clientId={client.id}
            client={client}
            accordionCards
            onLiabilitiesOpen={(amount, detail) => {
              setLiabilitiesData({ amount, detail });
              setLiabilitiesOpen(true);
            }}
          />
        </div>
      ) : activeTab === "call-log" ? (
        <div className="pt-8 w-full">
          <Card variant="default">
            <div className="flex flex-col gap-4">
              <h6 className="type-h6 text-foreground">Call Log</h6>
              <CallLogTable callLogs={callLogs} />
            </div>
          </Card>
        </div>
      ) : activeTab === "notes" ? (
        <EmptyTabState
          icon={<FileTextIcon size={40} className="text-[var(--text-default-placeholder)]" />}
          title="No notes yet"
          body="Notes for this client will appear here."
        />
      ) : activeTab === "reminder" ? (
        <EmptyTabState
          icon={<AlarmIcon size={40} className="text-[var(--text-default-placeholder)]" />}
          title="No reminders yet"
          body="Reminders for this client will appear here."
        />
      ) : (
        <OverviewTab
          detail={detail}
          nbaAction={nbaAction}
          holdingsSortKey={holdingsSortKey}
          holdingsSortDir={holdingsSortDir}
          onSort={(key, dir) => {
            setHoldingsSortKey(dir === "none" ? null : key);
            setHoldingsSortDir(dir);
          }}
          onViewAllHoldings={() => setActiveTab("assets")}
        />
      )}

      {liabilitiesData && (
        <LiabilitiesDetailModal
          open={liabilitiesOpen}
          totalAmount={liabilitiesData.amount}
          detail={liabilitiesData.detail}
          onClose={() => setLiabilitiesOpen(false)}
        />
      )}
    </div>
  );
}
