"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  NavHeaderIconButton,
  NavHeaderNotification,
  Tag,
  Breadcrumb,
} from "@sarunyu/system-one";
import { ListIcon } from "@phosphor-icons/react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { notificationGroups, mockHouseViewStrategies } from "@/lib/mock-data";
import { useClients } from "@/hooks/use-api";
import { HeaderSlotProvider, useHeaderSlot } from "./header-slot-context";
import { PrivacyProvider, usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";

const PAGE_TITLES: Record<string, string> = {
  "/command-center": "Command Center",
  "/client-hub": "Client 360",
  "/pipeline": "Pipeline",
  "/ai-insights": "AI Insights",
  "/performance": "Performance & Targets",
  "/compliance": "Compliance & Risk",
  "/house-view": "House View & Strategy",
  "/insights": "Insights",
  "/product-catalog": "Product Catalog",
};

function MarketOpenBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-3 h-3">
        <span className="absolute inline-flex w-full h-full rounded-full bg-success opacity-75 animate-ping" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
      </div>
      <Tag text="Market Open in 1h 45m" variant="green" size="small" />
    </div>
  );
}

type PageInfo = {
  title: string | null;
  clientBreadcrumb: { label: string; href?: string }[] | null;
  isCommandCenter: boolean;
  isHouseView: boolean;
  isPerformance: boolean;
  isFullWidth: boolean;
};

function usePageInfo(): PageInfo {
  const pathname = usePathname();
  const clients = useClients();
  const { isPrivate } = usePrivacy();

  // Client detail page — show breadcrumb instead of title
  const clientMatch = pathname.match(/^\/client\/([^/]+)/);
  if (clientMatch) {
    const client = clients.find((c) => c.id === clientMatch[1]);
    return {
      title: null,
      clientBreadcrumb: [
        { label: "Client 360", href: "/client-hub" },
        { label: maskName(client?.name ?? "Client", isPrivate) },
      ],
      isCommandCenter: false,
      isHouseView: false,
      isPerformance: false,
      isFullWidth: false,
    };
  }

  // Insight detail page (House View) — show breadcrumb instead of title
  const insightMatch = pathname.match(/^\/insights\/([^/]+)/);
  if (insightMatch) {
    const strategy = mockHouseViewStrategies.find(
      (s) => s.id === insightMatch[1],
    );
    const title = strategy?.name ?? "Insight";
    return {
      title: null,
      clientBreadcrumb: [
        { label: "House View", href: "/insights" },
        { label: title.length > 22 ? `${title.slice(0, 22)}…` : title },
      ],
      isCommandCenter: false,
      isHouseView: false,
      isPerformance: false,
      isFullWidth: false,
    };
  }

  const key = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k));
  return {
    title: key ? PAGE_TITLES[key] : "",
    clientBreadcrumb: null,
    isCommandCenter: pathname.startsWith("/command-center"),
    isHouseView: pathname.startsWith("/house-view"),
    isPerformance: pathname.startsWith("/performance"),
    isFullWidth:
      pathname.startsWith("/product-catalog") ||
      pathname.startsWith("/client-hub"),
  };
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    title: pageTitle,
    clientBreadcrumb,
    isCommandCenter,
    isHouseView,
    isPerformance,
    isFullWidth,
  } = usePageInfo();
  const headerSlot = useHeaderSlot();

  return (
    <>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetOverlay className="bg-black/50" />
        <SheetContent
          side="left"
          className="w-60 p-0 bg-slate-900 border-slate-700"
        >
          <AppSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar — hidden on mobile/tablet, visible on xl+ (desktop only) */}
        <aside
          className={`hidden xl:flex shrink-0 bg-slate-900 overflow-hidden flex-col transition-[width] duration-300 ease-in-out ${sidebarCollapsed ? "w-[50px]" : "w-60"}`}
        >
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />
        </aside>

        {/* Content area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <header
            className={`shrink-0 min-h-[60px] flex items-center justify-between gap-4 px-4 border-b border-border bg-background z-30 relative ${
              headerSlot ? "xl:grid xl:grid-cols-[1fr_minmax(0,28rem)_1fr]" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo — mobile + tablet (sidebar hidden below xl) */}
              <div className="flex items-center gap-2.5 xl:hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size icon, no responsive sizes needed */}
                <img
                  src="/yuanta-ic-portal-logo-primary.svg"
                  alt="Yuanta"
                  className="w-auto h-8 shrink-0"
                />

              </div>
              {/* Title in header — desktop only */}
              {clientBreadcrumb ? (
                <div className="hidden xl:block min-w-0 overflow-hidden">
                  <Breadcrumb items={clientBreadcrumb} />
                </div>
              ) : (
                <div className="hidden xl:flex items-center gap-3">
                  {pageTitle && (
                    <h1 className="type-subtitle-1 text-foreground">
                      {pageTitle}
                    </h1>
                  )}
                  {isCommandCenter && <MarketOpenBadge />}
                </div>
              )}
            </div>

            {headerSlot && (
              <div className="hidden xl:flex">
                <div className="w-full">{headerSlot}</div>
              </div>
            )}

            <div className={`flex items-center gap-4 ${headerSlot ? "xl:justify-self-end" : ""}`}>
              <NavHeaderNotification
                groups={notificationGroups}
                badgeCount={4}
              />

              <div className="xl:hidden">
                <NavHeaderIconButton
                  aria-label="Open navigation"
                  onClick={() => setSidebarOpen(true)}
                >
                  <ListIcon weight="regular" size={24} />
                </NavHeaderIconButton>
              </div>
            </div>
          </header>

          <main
            className={`flex-1 overflow-y-auto overflow-x-clip [scrollbar-gutter:stable] bg-[var(--bg-default-secondary)] ${isFullWidth ? "" : "p-4 xl:p-6"}`}
          >
            <div
              className={`${isFullWidth ? "w-full min-h-full" : "max-w-[1280px] mx-auto"
                } flex flex-col gap-6`}
            >
              {!clientBreadcrumb &&
                !isFullWidth &&
                (pageTitle || isCommandCenter || isHouseView) && (
                  <div className="flex items-center justify-between gap-3 xl:hidden">
                    <div className="flex items-center gap-3">
                      {pageTitle && (
                        <h1 className="type-h5 text-foreground">{pageTitle}</h1>
                      )}
                      {isCommandCenter && <MarketOpenBadge />}
                    </div>
                    {isPerformance && (
                      <div
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 shrink-0"
                        style={{ background: "#1e2337" }}
                      >
                        <span className="text-[13px] font-bold text-white leading-none">
                          B+
                        </span>
                      </div>
                    )}
                  </div>
                )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivacyProvider>
      <HeaderSlotProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </HeaderSlotProvider>
    </PrivacyProvider>
  );
}
