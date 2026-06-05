"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@sarunyu/system-one";
import {
  HouseIcon,
  UsersIcon,
  SparkleIcon,
  FunnelIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeIcon,
  CaretUpDownIcon,
} from "@phosphor-icons/react";

const workspaceItems = [
  { href: "/command-center", label: "Command Center", icon: HouseIcon, badge: null },
  { href: "/client-hub", label: "Client 360", icon: UsersIcon, badge: null },
  { href: "/pipeline", label: "Pipeline", icon: FunnelIcon, badge: 12 },
  { href: "/ai-insights", label: "AI Insights", icon: SparkleIcon, badge: null },
];

const managementItems = [
  { href: "/performance", label: "Performance", icon: ChartBarIcon, badge: "B+" },
  { href: "/compliance", label: "Compliance", icon: ShieldCheckIcon, badge: null },
  { href: "/house-view", label: "House View", icon: GlobeIcon, badge: null },
];

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge: number | string | null;
};

function NavSection({ label, items, onNavigate }: { label: string; items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold text-slate-500 px-3 pt-4 pb-1.5 uppercase tracking-widest">
        {label}
      </p>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className="no-underline block" onClick={onNavigate}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                isActive ? "bg-slate-700/60" : "hover:bg-slate-800"
              }`}
            >
              <Icon
                size={18}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-white" : "text-slate-400"}
              />
              <span
                className={`text-[13.5px] flex-1 leading-none ${
                  isActive ? "text-white font-medium" : "text-slate-300"
                }`}
              >
                {item.label}
              </span>
              {item.badge != null && (
                <span className="bg-slate-700 text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums">
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

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-white">YA</span>
        </div>
        <span className="text-[13.5px] font-semibold text-white truncate">
          Yuanta Agent Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <NavSection label="Workspace" items={workspaceItems} onNavigate={onClose} />
        <NavSection label="Management" items={managementItems} onNavigate={onClose} />
      </nav>

      {/* User profile */}
      <div className="shrink-0 border-t border-slate-700/60 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar type="text" initials="RM" size="m" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate leading-tight">
              Relation Manager
            </p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">Senior RM</p>
          </div>
          <CaretUpDownIcon size={15} className="text-slate-500 shrink-0" />
        </div>
      </div>
    </div>
  );
}
