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
import {
  GLOBAL_BOND_ISSUERS,
  RECOMMENDED_ISSUERS,
  TOP_PICK_ROWS,
  type GlobalBondIssuerId,
} from "./global-bond-data";
import { BORDER_COLOR, HEADER_TEXT_CLS, headerBorderStyle, cellBorderStyle, BondLogo } from "./fixed-income-shared";

const TABLE_SHADOW = "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";

const BANNER_ASSETS = {
  ysinvestIllustration: "/banner-ysinvest-illustration.png",
  ysinvestClock: "/banner-ysinvest-clock.svg",
  ysinvestClose: "/banner-ysinvest-close.svg",
  adsIndexCard: "/banner-ads-index-card.png",
  adsClose: "/banner-ads-close.svg",
};

const SHOW_YSINVEST_BANNER = false;

function BannerYSinvest() {
  const [visible, setVisible] = useState(true);
  if (!SHOW_YSINVEST_BANNER || !visible) return null;

  return (
    <div
      className="relative h-[120px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-b from-[#e6f1fc] to-white w-[343px] max-w-[calc(100%-32px)]"
      style={{ boxShadow: TABLE_SHADOW }}
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

const RECOMMENDED_ROWS = RECOMMENDED_ISSUERS.map((id, i) => {
  const issuer = GLOBAL_BOND_ISSUERS[id];
  return {
    id,
    issuer: issuer.fullName,
    logo: issuer.logo,
    couponRate: issuer.couponRateRange,
    maturity: issuer.maturityRange,
    sp: issuer.sp,
    moodys: issuer.moodys,
    fitch: issuer.fitch,
    estimatedYield: issuer.estimatedYield,
    alt: i % 2 === 0,
  };
});

type RecommendedRow = (typeof RECOMMENDED_ROWS)[number];


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
                <BondLogo src={row.logo} className="size-8 rounded" />
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

function RecommendedAccordionList({ onIssuerSelect }: { onIssuerSelect?: (id: GlobalBondIssuerId) => void }) {
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
                <BondLogo src={row.logo} className="size-8 rounded" />
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
                  <ViewInfoButton fullWidth onClick={() => onIssuerSelect?.(row.id)} />
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
      className={`inline-flex shrink-0 items-center justify-center rounded bg-[#fff7ed] text-[#f54a00] whitespace-nowrap ${
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

function ViewInfoButton({ fullWidth, onClick }: { fullWidth?: boolean; onClick?: () => void }) {
  if (fullWidth) {
    return (
      <Button variant="outline" size="xl" className="w-full max-w-[343px]" onClick={onClick}>
        ดูข้อมูล
      </Button>
    );
  }
  return (
    <Button variant="outline" size="xs" className="whitespace-nowrap" onClick={onClick}>
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
      style={{ boxShadow: TABLE_SHADOW }}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-stretch min-w-[1152px]">
          {/* Bond name */}
          <div className="flex flex-col flex-1 min-w-0">
            <div
              className="flex h-11 items-center px-4"
              style={headerBorderStyle({ left: true, right: false })}
            >
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Top pick</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden"
                style={cellBorderStyle({
                  bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined,
                })}
              >
                <BondLogo src={row.logo} className="size-8 rounded" />
                <span className="flex-1 min-w-0 truncate text-sm leading-5 text-[#101828]">
                  {row.name}
                </span>
              </div>
            ))}
          </div>
          {/* Top Pick tag column */}
          <div className="flex flex-col w-[70px] shrink-0">
            <div
              className="flex h-11 items-center justify-center px-4"
              style={headerBorderStyle()}
            />
            {TOP_PICK_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]"
                style={cellBorderStyle({
                  bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined,
                })}
              >
                <TopPickTag />
              </div>
            ))}
          </div>
          {/* ISIN */}
          <div className="flex flex-col w-[154px] shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ISIN</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.isin}</span>
              </div>
            ))}
          </div>
          {/* Currency */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Currency</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.currency}</span>
              </div>
            ))}
          </div>
          {/* Coupon Rate */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Coupon Rate</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.couponRate}</span>
              </div>
            ))}
          </div>
          {/* Price */}
          <div className="flex flex-col w-[81px] shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Price</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.price}</span>
              </div>
            ))}
          </div>
          {/* Yield */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ผลตอบแทน</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.yieldPct}</span>
              </div>
            ))}
          </div>
          {/* Maturity */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.maturity}</span>
              </div>
            ))}
          </div>
          {/* Duration */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-end px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ระยะเวลา (ปี)</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <span className="text-sm leading-5 text-[#101828]">{row.duration}</span>
              </div>
            ))}
          </div>
          {/* Factsheet */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center justify-center px-3" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>เอกสาร</span>
            </div>
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-3 py-[11px] min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <FactsheetButton />
              </div>
            ))}
          </div>
          {/* Action */}
          <div className="flex flex-col shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorderStyle({ right: false })} />
            {TOP_PICK_ROWS.map((row, i) => (
              <div key={i} className="flex flex-1 items-center justify-center px-4 py-[11px] min-h-[52px]" style={cellBorderStyle({ bottom: i === TOP_PICK_ROWS.length - 1 ? false : undefined })}>
                <InvestButton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedBondsTable({ onIssuerSelect }: { onIssuerSelect?: (id: GlobalBondIssuerId) => void }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-stretch min-w-[1152px]">
          {/* Issuer */}
          <div className="flex flex-col w-[296px] shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorderStyle({ left: true })}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ผู้ออกตราสาร</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <BondLogo src={row.logo} className="size-8 rounded" />
                <span className="flex-1 min-w-0 text-sm font-bold leading-5 text-[#101828] truncate">{row.issuer}</span>
              </div>
            ))}
          </div>
          {/* Coupon Rate */}
          <div className="flex flex-col flex-1 min-w-[100px]">
            <div className="flex h-11 items-center justify-center px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Coupon Rate</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.couponRate}</span>
              </div>
            ))}
          </div>
          {/* Maturity */}
          <div className="flex flex-col flex-1 min-w-[100px]">
            <div className="flex h-11 items-center justify-center px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>วันครบกำหนด</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.maturity}</span>
              </div>
            ))}
          </div>
          {/* Credit Rating — nested header */}
          <div className="flex flex-col w-[210px] shrink-0">
            <div className="flex flex-col h-11 overflow-hidden" style={headerBorderStyle()}>
              <div className="flex flex-1 items-center justify-center px-4" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Credit Rating</span>
              </div>
              <div className="flex flex-1 items-stretch">
                <div className="flex flex-1 items-center justify-center px-4" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>S&P</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
                  <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Moody&apos;s</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4">
                  <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>Fitch</span>
                </div>
              </div>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-stretch min-h-[52px]"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <div className="flex flex-1 items-center justify-center px-4 py-3.5">
                  <span className="text-sm leading-5 text-[#101828] text-center">{row.sp}</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-4 py-3.5">
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
            <div className="flex h-11 items-center justify-center px-4" style={headerBorderStyle()}>
              <span className={`${HEADER_TEXT_CLS} whitespace-nowrap`}>ผลตอบแทนโดยประมาณ</span>
            </div>
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <span className="text-sm leading-5 text-[#101828] text-center">{row.estimatedYield}</span>
              </div>
            ))}
          </div>
          {/* View info */}
          <div className="flex flex-col w-[129px] shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorderStyle({ right: false })} />
            {RECOMMENDED_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]"
                style={{
                  ...cellBorderStyle({ bottom: i === RECOMMENDED_ROWS.length - 1 ? false : undefined }),
                  backgroundColor: row.alt ? "#f9fafb" : "white",
                }}
              >
                <ViewInfoButton onClick={() => onIssuerSelect?.(row.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalBondTab({
  onIssuerSelect,
  onViewAll,
}: {
  onIssuerSelect?: (issuerId: GlobalBondIssuerId) => void;
  onViewAll?: () => void;
}) {
  return (
    <>
      {/* Tablet + mobile — accordion cards on white warp (Figma 768px) */}
      <div className="lg:hidden flex flex-col items-center w-full gap-8 pt-8 pb-10 bg-white">
        {SHOW_YSINVEST_BANNER && (
          <div className="flex h-[152px] items-center justify-center w-full">
            <BannerYSinvest />
          </div>
        )}
        <div className="flex flex-col gap-6 items-center w-full px-8 py-3">
          <div className="flex flex-col items-start w-full">
            <h2 className="w-full text-lg font-bold leading-6 text-[#101828]">
              ตราสารหนี้ต่างประเทศแนะนำ
            </h2>
          </div>
          <TopPickAccordionList />
          <RecommendedAccordionList onIssuerSelect={onIssuerSelect} />
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRightIcon size={20} weight="bold" />}
            className="shrink-0 self-center max-w-[343px] font-semibold"
            onClick={onViewAll}
          >
            ดูทั้งหมด
          </Button>
        </div>
      </div>

      {/* Desktop — tables in gray card */}
      <div className="hidden lg:flex flex-col items-center w-full gap-8 pt-8 bg-gradient-to-b from-white from-[43.451%] to-transparent">
        {SHOW_YSINVEST_BANNER && <BannerYSinvest />}
        <div
          className="w-full flex flex-col items-center pb-10 pt-6 px-6 lg:px-[120px] lg:pb-10 lg:pt-6"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div
            className="flex flex-col gap-6 items-center w-full max-w-[1200px] p-6 rounded-2xl bg-white"
            style={{ boxShadow: TABLE_SHADOW }}
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
              <RecommendedBondsTable onIssuerSelect={onIssuerSelect} />
            </div>
            <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={20} />} onClick={onViewAll}>
              ดูทั้งหมด
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
