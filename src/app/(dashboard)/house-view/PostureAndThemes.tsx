"use client";

import { Tag } from "@sarunyu/system-one";
import { TrendUpIcon, TrendDownIcon, MinusIcon } from "@phosphor-icons/react";
import { STANCES, THEMES } from "./house-view-data";

export function AssetPosture() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      <p className="type-subtitle-1 text-foreground">Asset Allocation Posture</p>
      <div className="flex flex-col divide-y divide-border">
        {STANCES.map((s) => {
          const Icon = s.stance === "Overweight" ? TrendUpIcon : s.stance === "Underweight" ? TrendDownIcon : MinusIcon;
          const c = s.stance === "Overweight" ? "var(--text-success-primary)" : s.stance === "Underweight" ? "var(--text-danger-primary)" : "var(--text-default-secondary)";
          return (
            <div key={s.label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-[12px] text-foreground">{s.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Icon size={13} weight="bold" style={{ color: c }} />
                <span className="text-[12px] font-semibold" style={{ color: c }}>{s.stance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketThemesCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 flex-1">
      <p className="type-subtitle-1 text-foreground">Active Market Themes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <div key={t.id} className="rounded-xl bg-muted p-3.5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-semibold text-foreground leading-snug flex-1">{t.title}</p>
              <span className="text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5" style={{ color: t.horizonColor }}>{t.horizon}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
            <Tag text={t.stance} variant={t.stanceVariant} size="small" />
          </div>
        ))}
      </div>
    </div>
  );
}
