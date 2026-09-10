"use client";

import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { MF_ASSETS } from "./mutual-fund-assets";

function QuickActionCard({
  title,
  illustration,
  compact = false,
}: {
  title: string;
  illustration: string;
  compact?: boolean;
}) {
  return (
    <div
      className="min-w-0 flex-1 rounded-lg bg-white p-1"
      style={{
        boxShadow:
          "0px 0px 1px rgba(102, 102, 102, 0.16), 0px 4px 4px rgba(102, 102, 102, 0.12)",
      }}
    >
      <div
        className={
          compact
            ? "relative flex h-[72px] flex-col gap-1 overflow-hidden rounded bg-gradient-to-b from-[#f3f8fe] to-white py-4 pl-4 pr-4"
            : "relative flex h-[92px] flex-col gap-1 overflow-hidden rounded bg-gradient-to-b from-[#f3f8fe] to-white py-4 pl-4 pr-4"
        }
      >
        <p className="text-sm font-bold leading-5 text-[#101828]">{title}</p>
        <ArrowRightIcon size={16} className="text-[#4a5565]" />
        <Image
          src={illustration}
          alt=""
          width={compact ? 42 : 68}
          height={compact ? 42 : 68}
          className={
            compact
              ? "pointer-events-none absolute bottom-0 right-3 size-[42px] object-contain"
              : "pointer-events-none absolute bottom-0 right-3 size-[68px] object-contain"
          }
        />
      </div>
    </div>
  );
}

/** Figma 40135:224276 (mobile) / 40118:77384 (desktop) */
export function MutualFundQuickActions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-full gap-2.5 lg:gap-8 ${className}`.trim()}>
      <QuickActionCard title="ตัวกรองกองทุน" illustration={MF_ASSETS.filterIllustration} compact />
      <QuickActionCard title="วางแผนภาษี" illustration={MF_ASSETS.taxIllustration} compact />
    </div>
  );
}

export function MutualFundQuickActionsDesktop() {
  return (
    <div className="relative hidden w-full gap-8 lg:flex">
      <QuickActionCard title="ตัวกรองกองทุน" illustration={MF_ASSETS.filterIllustration} />
      <QuickActionCard title="วางแผนภาษี" illustration={MF_ASSETS.taxIllustration} />
    </div>
  );
}
