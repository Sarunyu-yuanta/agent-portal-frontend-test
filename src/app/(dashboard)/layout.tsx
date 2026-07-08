"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  NavHeaderIconButton,
  NavHeaderNotification,
  NavHeaderAvatarSlot,
  Avatar,
  SearchInput,
  Tag,
  Breadcrumb,
} from "@sarunyu/system-one";
import { MagnifyingGlassIcon, ListIcon } from "@phosphor-icons/react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { notificationGroups } from "@/lib/mock-data";
import { useClients } from "@/hooks/use-api";

const PAGE_TITLES: Record<string, string> = {
  "/command-center": "Command Center",
  "/client-hub": "Client Hub",
  "/pipeline": "Pipeline",
  "/ai-insights": "AI Insights",
  "/performance": "Performance & Targets",
  "/compliance": "Compliance & Risk",
  "/house-view": "House View & Strategy",
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

  // Client detail page — show breadcrumb instead of title
  const clientMatch = pathname.match(/^\/client\/([^/]+)/);
  if (clientMatch) {
    const client = clients.find((c) => c.id === clientMatch[1]);
    return {
      title: null,
      clientBreadcrumb: [
        { label: "Client Hub", href: "/client-hub" },
        { label: client?.name ?? "Client" },
      ],
      isCommandCenter: false,
      isHouseView: false,
      isPerformance: false,
      isFullWidth: false,
    };
  }

  const key = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k));
  return {
    title: key ? PAGE_TITLES[key] : "",
    clientBreadcrumb: null,
    isCommandCenter: pathname.startsWith("/command-center"),
    isHouseView: pathname.startsWith("/house-view"),
    isPerformance: pathname.startsWith("/performance"),
    isFullWidth: pathname.startsWith("/product-catalog"),
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { title: pageTitle, clientBreadcrumb, isCommandCenter, isHouseView, isPerformance, isFullWidth } = usePageInfo();

  return (
    <>
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetOverlay className="bg-black/50" />
      <SheetContent side="left" className="w-60 p-0 bg-slate-900 border-slate-700">
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </SheetContent>
    </Sheet>

    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — hidden on mobile, always visible on lg+ */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-slate-900 overflow-hidden flex-col">
        <AppSidebar />
      </aside>

      {/* Content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="shrink-0 min-h-[60px] flex items-center justify-between gap-4 px-4 border-b border-border bg-background z-30 relative">
          <div className="flex items-center gap-3">
            {/* Logo — mobile only (sidebar hidden on desktop) */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">YA</span>
              </div>
              <span className="text-[13px] font-semibold text-foreground hidden sm:block">Yuanta Agent Portal</span>
            </div>
            {/* Title in header — desktop only */}
            {clientBreadcrumb ? (
              <Breadcrumb items={clientBreadcrumb} />
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                {pageTitle && <h1 className="type-subtitle-1 text-foreground">{pageTitle}</h1>}
                {isCommandCenter && <MarketOpenBadge />}
                {isHouseView && <Tag text="Updated: Q2 2026" variant="blue" size="small" />}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop: always visible search input */}
            <div className="hidden lg:block">
              <SearchInput
                placeholder="Search clients, accounts, keywords…"
                size="sm"
                className="w-[400px]"
              />
            </div>
            {/* Mobile: icon toggle */}
            <div className="lg:hidden">
              <NavHeaderIconButton
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
              >
                <MagnifyingGlassIcon weight="regular" size={24} />
              </NavHeaderIconButton>
            </div>

            <NavHeaderNotification groups={notificationGroups} badgeCount={4} />

            <NavHeaderAvatarSlot>
              <Avatar type="text" initials="RM" size="m" status />
            </NavHeaderAvatarSlot>

            <div className="lg:hidden">
              <NavHeaderIconButton aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
                <ListIcon weight="regular" size={24} />
              </NavHeaderIconButton>
            </div>
          </div>
        </header>

        {searchOpen && (
          <div className="lg:hidden shrink-0 px-4 py-2 border-b border-border bg-card">
            <SearchInput
              placeholder="Search clients, accounts, keywords…"
              size="sm"
            />
          </div>
        )}

        <main className={`flex-1 overflow-y-auto overflow-x-clip bg-[var(--bg-default-secondary)] ${isFullWidth ? "" : "p-4 lg:p-6"}`}>
          <div
            className={`${
              isFullWidth ? "w-full" : "max-w-[1280px] mx-auto"
            } flex flex-col gap-6`}
          >
            {!clientBreadcrumb && !isFullWidth && (pageTitle || isCommandCenter || isHouseView) && (
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="flex items-center gap-3">
                  {pageTitle && <h1 className="type-h5 text-foreground">{pageTitle}</h1>}
                  {isCommandCenter && <MarketOpenBadge />}
                  {isHouseView && <Tag text="Updated: Q2 2026" variant="blue" size="small" />}
                </div>
                {isPerformance && (
                  <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 shrink-0" style={{ background: "#1e2337" }}>
                    <span className="text-[13px] font-bold text-white leading-none">B+</span>
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
