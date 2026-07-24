"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@sarunyu/system-one";
import {
  UsersIcon,
  CaretUpDownIcon,
  SquaresFourIcon,
  SidebarSimpleIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";

const workspaceItems = [
  { href: "/client-hub", label: "Client 360", icon: UsersIcon, badge: null },
  {
    href: "/product-catalog",
    label: "Product Catalog",
    icon: SquaresFourIcon,
    badge: null,
  },
  // { href: "/house-view", label: "House View", icon: ChartBarIcon, badge: null },
  {
    href: "/house-view-mvp",
    label: "House View",
    icon: ChartBarIcon,
    badge: null,
  },
];

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge: number | string | null;
};

// Fixed-width icon zone: collapsed sidebar = 50px, outer margin px-2 (8px each side),
// inner zone = 34px. All icons/logos/avatars live inside this zone and never move.
const ICON_ZONE = "w-[34px] flex items-center justify-center shrink-0";

function NavSection({
  label,
  items,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-0.5 mt-2">
      {/* Section label fades out when collapsed */}
      <div className="h-7 flex items-end px-4 pb-1 overflow-hidden">
        <p
          className={`text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap transition-all duration-300 ease-in-out ${
            collapsed ? "opacity-0 -translate-x-1" : "opacity-100 translate-x-0"
          }`}
        >
          {label}
        </p>
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="no-underline block px-2"
            onClick={onNavigate}
            title={item.label}
          >
            <div
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors overflow-hidden ${
                isActive ? "bg-slate-700/60" : "hover:bg-slate-800"
              }`}
            >
              {/* Icon zone — fixed width, never moves */}
              <div className={ICON_ZONE}>
                <Icon
                  size={18}
                  weight={isActive ? "fill" : "regular"}
                  className={isActive ? "text-white" : "text-slate-400"}
                />
              </div>

              {/* Text fades + collapses */}
              <span
                className={`text-[13.5px] leading-none whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                } ${isActive ? "text-white font-medium" : "text-slate-300"}`}
              >
                {item.label}
              </span>

              {item.badge != null && (
                <span
                  className={`bg-slate-700 text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap transition-all duration-300 ease-in-out ${
                    collapsed
                      ? "w-0 opacity-0 overflow-hidden p-0"
                      : "opacity-100"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Toggle button — icon zone keeps it still */}
      {onToggleCollapse && (
        <div className="flex shrink-0 pt-5 pb-1 px-2">
          <div className={ICON_ZONE}>
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <SidebarSimpleIcon size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Logo — YA square lives in the same icon zone */}
      <div className="flex items-center gap-3 py-4 shrink-0 px-2">
        <div className={ICON_ZONE}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">YA</span>
          </div>
        </div>
        <span
          className={`text-[13.5px] font-semibold text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          Yuanta Agent Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <NavSection
          label="Workspace"
          items={workspaceItems}
          collapsed={collapsed}
          onNavigate={onClose}
        />
      </nav>

      {/* User profile — avatar in icon zone */}
      <div className="shrink-0 border-t border-slate-700/60 py-4 px-2">
        <div className="flex items-center gap-3">
          <div className={ICON_ZONE}>
            <Avatar type="text" initials="RM" size="m" />
          </div>
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100 flex-1"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate leading-tight whitespace-nowrap">
                Relation Manager
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight whitespace-nowrap">
                Senior RM
              </p>
            </div>
            <CaretUpDownIcon size={15} className="text-slate-500 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
