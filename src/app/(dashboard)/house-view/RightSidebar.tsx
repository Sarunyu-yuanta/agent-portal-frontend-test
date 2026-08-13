"use client";

import { Tag, Button } from "@sarunyu/system-one";
import {
  SparkleIcon,
  ArrowRightIcon,
  CurrencyCircleDollarIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useNBAActions } from "@/hooks/use-api";
import { buildAIFeed } from "./house-view-data";

export function RightSidebar() {
  const nbaActions = useNBAActions();
  const AI_FEED = buildAIFeed(nbaActions);
  return (
    <div className="flex flex-col gap-5 sticky top-6">

      {/* Strategy Impact KPIs */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategy Impact (YTD)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "AUM Generated",       value: "฿1.2B",  icon: CurrencyCircleDollarIcon },
            { label: "Proposal Conv. Rate",  value: "68%",    icon: UsersIcon },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-border bg-card p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground leading-tight">{k.label}</p>
                </div>
                <p className="text-[22px] font-semibold text-foreground leading-none">{k.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Action Feed */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SparkleIcon size={14} weight="fill" className="text-primary-action" />
            <p className="type-subtitle-1 text-foreground">AI Action Feed</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--bg-success-light)] border border-[var(--border-success)] rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-success-primary)] animate-pulse" />
            <span className="text-[10px] font-semibold text-[var(--text-success-primary)]">Live</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {AI_FEED.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-3.5 flex flex-col gap-2.5 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">{item.initials}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{item.name}</p>
                </div>
                <Tag text={item.tag} variant={item.tagVariant} size="small" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>
              <p className={`text-[11px] font-semibold ${item.impactPositive ? "text-success" : "text-warning"}`}>
                {item.impact}
              </p>
            </div>
          ))}
        </div>

        <Button variant="plain" size="sm" rightIcon={<ArrowRightIcon size={12} />}>
          View all AI actions
        </Button>
      </div>

    </div>
  );
}
