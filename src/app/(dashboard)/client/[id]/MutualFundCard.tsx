"use client";

import Image from "next/image";
import { GaugeIcon } from "@phosphor-icons/react";
import type { MutualFund } from "./mutual-fund-data";

const SPARKLINE = "/products/mutual-fund/sparkline-positive.svg";
const YUANTA_ICON = "/brand/yuanta-icon-logo.svg";

function PickTag() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#eff6ff] px-1 py-0.5">
      <Image src={YUANTA_ICON} alt="" width={11} height={11} className="shrink-0" />
      <span className="text-[7px] leading-[11px] font-normal bg-gradient-to-r from-[#00a1e9] to-[#004eba] bg-clip-text text-transparent">
        Pick
      </span>
    </span>
  );
}

function RiskBadge({ risk }: { risk: number }) {
  const color =
    risk <= 3 ? "#00bc7d" : risk <= 5 ? "#0a6ee7" : risk <= 6 ? "#eb6101" : "#fb2c36";

  return (
    <span className="inline-flex items-center gap-1 rounded-2xl border border-black/10 bg-white px-2 py-0.5">
      <GaugeIcon size={16} weight="fill" color={color} className="shrink-0" />
      <span className="text-xs font-semibold leading-4 text-[#4a5565]">risk: {risk}</span>
    </span>
  );
}

function PriceChange({ fund }: { fund: MutualFund }) {
  const isPositive = fund.changeAbs.startsWith("+") || fund.changePct.startsWith("+");
  const isNeutral = fund.changeAbs === "0.0000";
  const colorClass = isNeutral
    ? "text-[#4a5565]"
    : isPositive
      ? "text-[#008236]"
      : "text-[#fb2c36]";

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className="flex items-center gap-1 text-sm font-bold leading-5 text-[#101828] whitespace-nowrap">
        <span>{fund.price}</span>
        <span>{fund.currency}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs leading-4 ${colorClass}`}>
        <span>{fund.changeAbs}</span>
        <span className="rounded bg-[#dbfce7] px-1.5 py-0.5 text-[#008236]">{fund.changePct}</span>
      </div>
    </div>
  );
}

/** Single mutual fund row — used in top performers and theme list cards. */
export function MutualFundCard({
  fund,
  bordered,
}: {
  fund: MutualFund;
  /** When true, draws top/bottom dividers like the stacked list card. */
  bordered?: boolean;
}) {
  return (
    <div
      className={`p-3 ${bordered ? "border-y border-black/10 first:border-t-0 last:border-b-0" : ""}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm font-bold leading-5 text-[#101828] whitespace-nowrap">
                {fund.symbol}
              </span>
              {fund.isPick && <PickTag />}
            </div>
            <p className="text-xs leading-4 text-[#4a5565] truncate">{fund.name}</p>
          </div>
          <Image
            src={SPARKLINE}
            alt=""
            width={48}
            height={30}
            className="shrink-0 h-[30px] w-[48px]"
          />
          <PriceChange fund={fund} />
        </div>
        <RiskBadge risk={fund.risk} />
      </div>
    </div>
  );
}
