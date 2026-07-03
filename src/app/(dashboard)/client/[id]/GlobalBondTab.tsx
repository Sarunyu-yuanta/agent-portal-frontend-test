"use client";

import { useState } from "react";
import { Button } from "@sarunyu/system-one";
import {
  FireIcon,
  FileTextIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";

const BORDER_COLOR = "rgba(0,0,0,0.1)";
const TABLE_SHADOW = "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";
const CARD_SHADOW = TABLE_SHADOW;

const BANNER_ASSETS = {
  ysinvestIllustration: "/banner-ysinvest-illustration.png",
  ysinvestClock: "/banner-ysinvest-clock.svg",
  ysinvestClose: "/banner-ysinvest-close.svg",
  adsIndexCard: "/banner-ads-index-card.png",
  adsClose: "/banner-ads-close.svg",
};

const BANNER_SHADOW = "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";

function BannerYSinvest() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="relative h-[120px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-b from-[#e6f1fc] to-white w-[343px] max-w-[calc(100%-32px)]"
      style={{ boxShadow: BANNER_SHADOW }}
    >
      <div className="relative flex h-full flex-col items-start justify-between p-4 z-[1]">
        <div className="flex flex-col gap-1 text-[#2b7fff]">
          <p className="text-base font-normal leading-6 whitespace-nowrap">
            All-in-One Trading Experience
          </p>
          <div className="flex items-center gap-1">
            <span className="text-base font-normal leading-5">เทรดครบวงจรที่</span>
            <span className="text-base font-semibold leading-6">YSinvest</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-[4px] px-2 py-1 bg-[#dbeafe]">
          <img alt="" width={14} height={14} className="shrink-0" src={BANNER_ASSETS.ysinvestClock} />
          <span className="text-xs font-bold leading-4 text-[#2b7fff] whitespace-nowrap">เร็ว ๆ นี้</span>
        </span>
      </div>

      <div
        className="absolute pointer-events-none"
        style={{ top: "6.67%", right: "4.15%", bottom: "6.67%", left: "66.76%" }}
      >
        <img
          alt=""
          width={100}
          height={106}
          className="absolute inset-0 size-full object-contain object-right"
          src={BANNER_ASSETS.ysinvestIllustration}
        />
      </div>

      <button
        type="button"
        aria-label="ปิด"
        onClick={() => setVisible(false)}
        className="absolute z-[2] border-none bg-transparent p-0 cursor-pointer"
        style={{ top: 4, right: 4, width: 20, height: 20 }}
      >
        <img alt="" width={20} height={20} className="size-full" src={BANNER_ASSETS.ysinvestClose} />
      </button>
    </div>
  );
}

function BannerAds() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative flex flex-col gap-2 items-center shrink-0 w-[343px] max-w-[calc(100%-32px)]">
      <div
        className="relative w-full h-24 overflow-hidden rounded-[8px]"
        style={{ padding: 4, border: `1px solid ${BORDER_COLOR}` }}
      >
        <img
          alt=""
          className="absolute inset-0 size-full object-cover rounded pointer-events-none"
          src={BANNER_ASSETS.adsIndexCard}
        />
        <button
          type="button"
          aria-label="ปิด"
          onClick={() => setVisible(false)}
          className="absolute z-[1] border-none bg-transparent p-0 cursor-pointer"
          style={{ top: 4, right: 4, width: 20, height: 20 }}
        >
          <img alt="" width={20} height={20} className="size-full" src={BANNER_ASSETS.adsClose} />
        </button>
      </div>
      <div className="flex gap-1 items-center justify-center">
        <span className="h-1 w-8 rounded-full bg-black/40" />
        <span className="size-1 rounded-full bg-black/20" />
        <span className="size-1 rounded-full bg-black/20" />
      </div>
    </div>
  );
}

const LOGOS = {
  apple: "https://www.figma.com/api/mcp/asset/1c662d40-3f83-48b7-9616-360251500a2e",
  microsoft: "https://www.figma.com/api/mcp/asset/1d843e2c-a5ac-4536-b5f2-783583ada653",
  meta: "https://www.figma.com/api/mcp/asset/8f038722-f9d3-4ba0-954e-d633eb600783",
  amazon: "https://www.figma.com/api/mcp/asset/4684f79e-a3af-4fee-8669-1346abbb3259",
  coke: "https://www.figma.com/api/mcp/asset/32a12a51-e30c-47c0-abeb-875c96b76824",
  amex: "https://www.figma.com/api/mcp/asset/306606b4-150e-4e6c-b9b0-5807dd657934",
  nvidia: "https://www.figma.com/api/mcp/asset/4103f123-bedc-4e97-bbf5-043e1ebb97f5",
  walmart: "https://www.figma.com/api/mcp/asset/a9b69a79-0e8e-435e-baf0-badedfcd5408",
};

type TopPickRow = {
  name: string;
  logo: string;
  isin: string;
  currency: string;
  couponRate: string;
  price: string;
  yieldPct: string;
  maturity: string;
  duration: string;
};

const TOP_PICK_ROWS: TopPickRow[] = [
  { name: "Apple Inc 4.45% 2035", logo: LOGOS.apple, isin: "US037833CF61", currency: "USD", couponRate: "1.375%", price: "98.45", yieldPct: "2.05%", maturity: "05/05/2026", duration: "1.7" },
  { name: "COCA-COLA CO/THE 5.18% 2045", logo: LOGOS.coke, isin: "US037833DG77", currency: "USD", couponRate: "1.65%", price: "96.20", yieldPct: "2.40%", maturity: "15/08/2027", duration: "2.6" },
  { name: "NVIDIA CORP 4.75% 2060", logo: LOGOS.nvidia, isin: "US037833DU16", currency: "USD", couponRate: "3.05%", price: "93.60", yieldPct: "3.45%", maturity: "05/06/2032", duration: "6.1" },
  { name: "Apple Inc 4.45% 2035", logo: LOGOS.apple, isin: "US037833DV98", currency: "USD", couponRate: "4.45%", price: "101.20", yieldPct: "4.35%", maturity: "01/02/2035", duration: "8.7" },
  { name: "AMERICAN EXPRESS 1.37% 2026", logo: LOGOS.amex, isin: "US037833DW70", currency: "USD", couponRate: "4.65%", price: "99.10", yieldPct: "4.70%", maturity: "15/12/2041", duration: "12.5" },
];

type RecommendedRow = {
  issuer: string;
  logo: string;
  couponRate: string;
  maturity: string;
  sp: string;
  moodys: string;
  fitch: string;
  estimatedYield: string;
  alt?: boolean;
};

const RECOMMENDED_ROWS: RecommendedRow[] = [
  { issuer: "Apple Inc.", logo: LOGOS.apple, couponRate: "3.0-4.3%", maturity: "2027–2032", sp: "AA+", moodys: "Aaa", fitch: "A1", estimatedYield: "3.2-4.1%", alt: true },
  { issuer: "Microsoft Corp.", logo: LOGOS.microsoft, couponRate: "2.1-5.4%", maturity: "2026–2035", sp: "AAA", moodys: "A2", fitch: "AA-", estimatedYield: "2.5-4.8%" },
  { issuer: "Meta Platforms Inc.", logo: LOGOS.meta, couponRate: "2.2-4.3%", maturity: "2027–2034", sp: "AA+", moodys: "A3", fitch: "AA-", estimatedYield: "2.8-4.0%" },
  { issuer: "Amazon.com Inc.", logo: LOGOS.amazon, couponRate: "3.5-5.8%", maturity: "2026–2033", sp: "AAA", moodys: "Aaa", fitch: "A1", estimatedYield: "3.8-5.2%" },
  { issuer: "COCA-COLA CO/THE", logo: LOGOS.coke, couponRate: "3.0-5.1%", maturity: "2028–2035", sp: "AAA", moodys: "Aaa", fitch: "AA-", estimatedYield: "3.3-4.7%" },
  { issuer: "AMERICAN EXPRESS CO", logo: LOGOS.amex, couponRate: "4.1-6.2%", maturity: "2025–2032", sp: "AA2", moodys: "A1", fitch: "-", estimatedYield: "4.5-5.8%" },
  { issuer: "NVIDIA CORP", logo: LOGOS.nvidia, couponRate: "3.2-5.5%", maturity: "2027–2034", sp: "AA+", moodys: "Aaa", fitch: "WD", estimatedYield: "3.6-5.0%" },
  { issuer: "WALMART INC", logo: LOGOS.walmart, couponRate: "2.9-4.7%", maturity: "2023–2030", sp: "AAA", moodys: "A2", fitch: "A3", estimatedYield: "3.1-4.3%" },
];

const cellBorder = (opts?: { right?: boolean; bottom?: boolean; left?: boolean }) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderRight: opts?.right === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderLeft: opts?.left ? `1px solid ${BORDER_COLOR}` : undefined,
});

const HEADER_CLS = "text-sm leading-5 text-[#6a7282]";

function IssuerLogo({ src }: { src: string }) {
  return (
    <div className="relative shrink-0 size-5 rounded overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}` }}>
      <img alt="" className="absolute inset-0 size-full object-cover rounded pointer-events-none" src={src} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start w-full text-sm leading-5">
      <span className="flex-1 text-[#4a5565]">{label}</span>
      <span className="shrink-0 text-[#101828] text-right whitespace-nowrap">{value}</span>
    </div>
  );
}

function TopPickAccordionList() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-1 items-center w-full px-1 py-0.5 rounded-lg bg-[#fdefe6]">
        <FireIcon size={16} weight="fill" color="#f97316" className="shrink-0" />
        <span className="text-sm font-bold leading-5 text-[#101828]">Top pick</span>
      </div>
      <div
        className="flex flex-col w-full rounded-xl overflow-hidden bg-white"
        style={{ border: `1px solid ${BORDER_COLOR}` }}
      >
        {TOP_PICK_ROWS.map((row, i) => {
          const expanded = expandedIdx === i;
          const isLast = i === TOP_PICK_ROWS.length - 1;
          return (
            <div
              key={i}
              className="w-full"
              style={{ borderBottom: isLast ? undefined : `1px solid ${BORDER_COLOR}` }}
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(expanded ? null : i)}
                className="flex w-full items-center gap-2 p-3 bg-white border-none cursor-pointer text-left"
              >
                <IssuerLogo src={row.logo} />
                <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-bold leading-5 text-[#101828] truncate">{row.name}</span>
                  <div className="flex gap-0.5 items-center min-h-[18px]">
                    <span className="text-xs leading-4 text-[#4a5565]">{row.isin}</span>
                    <TopPickTag small />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm leading-5 text-[#101828]">{row.yieldPct}</span>
                  {expanded ? (
                    <CaretUpIcon size={22} className="text-[#101828]" />
                  ) : (
                    <CaretDownIcon size={22} className="text-[#101828]" />
                  )}
                </div>
              </button>
              {expanded && (
                <div className="flex flex-col gap-3 items-center px-3 pb-3 w-full">
                  <div className="flex flex-col gap-1 rounded-md bg-[#f9fafb] px-3 py-2 w-full">
                    <DetailRow label="Currency" value={row.currency} />
                    <DetailRow label="Coupon Rate" value={row.couponRate} />
                    <DetailRow label="Price" value={row.price} />
                    <DetailRow label="ผลตอบแทนโดยประมาณ" value={row.yieldPct} />
                    <DetailRow label="วันครบกำหนด" value={row.maturity} />
                    <DetailRow label="ระยะเวลา (ปี)" value={row.duration} />
                    <div className="flex gap-3 items-start w-full text-sm leading-5">
                      <span className="flex-1 text-[#4a5565]">เอกสารที่เกี่ยวข้อง</span>
                      <button type="button" className="inline-flex items-center gap-0.5 border-none bg-transparent p-0 cursor-pointer">
                        <span className="text-sm text-[#2b7fff] underline">Factsheet</span>
                        <FileTextIcon size={14} color="#2b7fff" />
                      </button>
                    </div>
                  </div>
                  <InvestButton fullWidth />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedAccordionList() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between w-full gap-3">
        <h3 className="text-sm font-bold leading-5 text-[#101828]">ตราสารหนี้แนะนำ</h3>
        <span className="text-xs leading-4 text-[#6a7282] whitespace-nowrap shrink-0">
          อัปเดตล่าสุด 25 Aug 2026 - 09.00
        </span>
      </div>
      <div
        className="flex flex-col w-full rounded-xl overflow-hidden bg-white"
        style={{ border: `1px solid ${BORDER_COLOR}` }}
      >
        {RECOMMENDED_ROWS.map((row, i) => {
          const expanded = expandedIdx === i;
          const isLast = i === RECOMMENDED_ROWS.length - 1;
          return (
            <div
              key={i}
              className="w-full"
              style={{ borderBottom: isLast ? undefined : `1px solid ${BORDER_COLOR}` }}
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(expanded ? null : i)}
                className="flex w-full items-center gap-2 p-3 bg-white border-none cursor-pointer text-left min-h-12"
              >
                <IssuerLogo src={row.logo} />
                <span
                  className={`flex-1 min-w-0 text-sm font-bold leading-5 truncate ${
                    expanded ? "text-[#101828]" : "text-[#4a5565]"
                  }`}
                >
                  {row.issuer}
                </span>
                {expanded ? (
                  <CaretUpIcon size={22} className="shrink-0 text-[#101828]" />
                ) : (
                  <CaretDownIcon size={22} className="shrink-0 text-[#101828]" />
                )}
              </button>
              {expanded && (
                <div className="flex flex-col gap-3 items-center px-3 pb-3 w-full">
                  <div className="flex flex-col gap-1 rounded-lg bg-[#f3f4f6] px-3 py-2 w-full">
                    <DetailRow label="Coupon Rate" value={row.couponRate} />
                    <DetailRow label="วันครบกำหนด" value={row.maturity} />
                    <hr className="w-full border-0 m-0" style={{ borderTop: `1px solid ${BORDER_COLOR}` }} />
                    <span className="text-xs leading-4 text-[#6a7282]">Credit Rating</span>
                    <DetailRow label="S&P" value={row.sp} />
                    <DetailRow label="Moody's" value={row.moodys} />
                    <DetailRow label="Fitch" value={row.fitch} />
                    <hr className="w-full border-0 m-0" style={{ borderTop: `1px solid ${BORDER_COLOR}` }} />
                    <DetailRow label="ผลตอบแทนโดยประมาณ" value={row.estimatedYield} />
                  </div>
                  <ViewInfoButton fullWidth />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopPickTag({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-[#fff7ed] text-[#f54a00] whitespace-nowrap ${
        small ? "px-1 py-0.5 text-[9px] leading-[14px]" : "px-1 py-0.5 text-xs leading-4"
      }`}
    >
      Top Pick
    </span>
  );
}

function FactsheetButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-0.5 px-1 pr-1.5 py-1 rounded border text-xs font-medium leading-[18px] text-[#101828] bg-white whitespace-nowrap"
      style={{ borderColor: BORDER_COLOR }}
    >
      <FileTextIcon size={16} className="shrink-0" />
      Factsheet
    </button>
  );
}

function ViewInfoButton({ fullWidth }: { fullWidth?: boolean }) {
  if (fullWidth) {
    return (
      <Button variant="outline" size="xl" className="w-full max-w-[343px]">
        ดูข้อมูล
      </Button>
    );
  }
  return (
    <Button variant="outline" size="xs" className="whitespace-nowrap">
      ดูข้อมูล
    </Button>
  );
}

function InvestButton({ fullWidth }: { fullWidth?: boolean }) {
  if (fullWidth) {
    return (
      <Button variant="primary" size="xl" className="w-full max-w-[343px]">
        สนใจลงทุน
      </Button>
    );
  }
  return (
    <Button variant="primary" size="xs" className="whitespace-nowrap">
      สนใจลงทุน
    </Button>
  );
}

function TopPickTable() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-stretch min-w-[1152px]">
          {/* Bond name */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex h-11 items-center px-4" style={cellBorder({ left: true })}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Top pick</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden" style={cellBorder({ left: true, bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <IssuerLogo src={row.logo} />
                <span className="flex-1 min-w-0 text-sm leading-5 text-[#101828] truncate">{row.name}</span>
              </div>
            ))}
          </div>
          {/* Top Pick tag column */}
          <div className="flex flex-col w-[70px] shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={cellBorder()} />
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <TopPickTag />
              </div>
            ))}
          </div>
          {/* ISIN */}
          <div className="flex flex-col w-[154px] shrink-0">
            <div className="flex h-11 items-center px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ISIN</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.isin}</span>
              </div>
            ))}
          </div>
          {/* Currency */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Currency</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.currency}</span>
              </div>
            ))}
          </div>
          {/* Coupon Rate */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Coupon Rate</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.couponRate}</span>
              </div>
            ))}
          </div>
          {/* Price */}
          <div className="flex flex-col w-[81px] shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Price</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.price}</span>
              </div>
            ))}
          </div>
          {/* Yield */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ผลตอบแทน</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.yieldPct}</span>
              </div>
            ))}
          </div>
          {/* Maturity */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.maturity}</span>
              </div>
            ))}
          </div>
          {/* Duration */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ระยะเวลา (ปี)</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.duration}</span>
              </div>
            ))}
          </div>
          {/* Factsheet */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-3" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>เอกสาร</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-3 py-[11px] min-h-[52px]" style={cellBorder({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <FactsheetButton />
              </div>
            ))}
          </div>
          {/* Action */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center px-4" style={cellBorder({ right: false })} />
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-[11px] min-h-[52px]" style={cellBorder({ right: false, bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <InvestButton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedBondsTable() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-stretch min-w-[1152px]">
          {/* Issuer */}
          <div className="flex flex-col w-[296px] shrink-0">
            <div className="flex h-11 items-center px-4" style={cellBorder({ left: true })}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ผู้ออกตราสาร</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden"
                style={{
                  ...cellBorder({ left: true, bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <IssuerLogo src={row.logo} />
                <span className="flex-1 min-w-0 text-sm font-bold leading-5 text-[#101828] truncate">{row.issuer}</span>
              </div>
            ))}
          </div>
          {/* Coupon Rate */}
          <div className="flex flex-col flex-1 min-w-[100px]">
            <div className="flex h-11 items-center justify-center px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Coupon Rate</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorder({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.couponRate}</span>
              </div>
            ))}
          </div>
          {/* Maturity */}
          <div className="flex flex-col flex-1 min-w-[100px]">
            <div className="flex h-11 items-center justify-center px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorder({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.maturity}</span>
              </div>
            ))}
          </div>
          {/* Credit Rating — nested header */}
          <div className="flex flex-col w-[210px] shrink-0">
            <div className="flex flex-col h-11 overflow-hidden" style={cellBorder()}>
              <div className="flex flex-1 items-center justify-center px-4" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                <span className={`${HEADER_CLS} whitespace-nowrap`}>Credit Rating</span>
              </div>
              <div className="flex flex-1 items-stretch">
                <div className="flex flex-1 items-center justify-center px-4" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className={`${HEADER_CLS} whitespace-nowrap`}>S&P</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className={`${HEADER_CLS} whitespace-nowrap`}>Moody&apos;s</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4">
                  <span className={`${HEADER_CLS} whitespace-nowrap`}>Fitch</span>
                </div>
              </div>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-stretch min-h-[52px]"
                style={{
                  ...cellBorder({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <div className="flex flex-1 items-center justify-center px-4 py-3.5" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className="text-sm leading-5 text-[#101828] text-center">{row.sp}</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4 py-3.5" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className="text-sm leading-5 text-[#101828] text-center">{row.moodys}</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4 py-3.5">
                  <span className="text-sm leading-5 text-[#101828] text-center">{row.fitch}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Yield */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={cellBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ผลตอบแทนโดยประมาณ</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorder({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.estimatedYield}</span>
              </div>
            ))}
          </div>
          {/* View info */}
          <div className="flex flex-col w-[129px] shrink-0">
            <div className="flex h-11 items-center px-4" style={cellBorder({ right: false })} />
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]"
                style={{
                  ...cellBorder({ right: false, bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <ViewInfoButton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalBondTab() {
  return (
    <>
      {/* Tablet + mobile — accordion cards on white warp (Figma 768px) */}
      <div className="lg:hidden flex flex-col items-center w-full gap-8 pt-8 pb-10 bg-white">
        <div className="flex h-[152px] items-center justify-center w-full">
          <BannerYSinvest />
        </div>
        <div className="flex flex-col gap-6 items-center w-full px-8 py-3">
          <div className="flex flex-col items-start w-full">
            <h2 className="w-full text-lg font-bold leading-6 text-[#101828]">
              ตราสารหนี้ต่างประเทศแนะนำ
            </h2>
          </div>
          <TopPickAccordionList />
          <RecommendedAccordionList />
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRightIcon size={20} weight="bold" />}
            className="shrink-0 self-center max-w-[343px] font-semibold"
          >
            ดูทั้งหมด
          </Button>
        </div>
      </div>

      {/* Desktop — tables in gray card */}
      <div className="hidden lg:flex flex-col items-center w-full gap-8 pt-8 bg-gradient-to-b from-white from-[43.451%] to-transparent">
        <BannerYSinvest />
        <div
          className="w-full flex flex-col items-center pb-10 pt-6 px-6"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div
            className="flex flex-col gap-6 items-center w-full max-w-[1200px] p-6 rounded-2xl bg-white"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <h2 className="w-full text-lg font-bold leading-6 text-[#101828]">
              ตราสารหนี้ต่างประเทศแนะนำ
            </h2>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-1 items-center w-full px-1 py-0.5 rounded-lg bg-[#fdefe6]">
                <FireIcon size={16} weight="fill" color="#f97316" className="shrink-0" />
                <span className="text-sm font-bold leading-5 text-[#101828]">Top pick</span>
              </div>
              <TopPickTable />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-end justify-between w-full gap-3">
                <h3 className="text-base font-bold leading-6 text-[#101828]">ตราสารหนี้แนะนำ</h3>
                <span className="text-sm leading-5 text-[#6a7282] whitespace-nowrap shrink-0">
                  อัปเดตล่าสุด 25 August 2026 - 09.00
                </span>
              </div>
              <RecommendedBondsTable />
            </div>
            <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={20} />}>
              ดูทั้งหมด
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
