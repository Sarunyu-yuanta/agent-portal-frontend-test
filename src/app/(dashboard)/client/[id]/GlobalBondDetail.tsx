"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@sarunyu/system-one";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  CaretUpIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import {
  DETAIL_RECOMMENDED_CARDS,
  DETAIL_RECOMMENDED_ISSUERS,
  filterGlobalBonds,
  getGlobalBondIssuer,
  type DetailRecommendedCard,
  type GlobalBondIssuer,
  type GlobalBondIssuerId,
  type GlobalBondRow,
  type MaturityFilter,
  type YieldFilter,
} from "./global-bond-data";

const BORDER_COLOR = "rgba(0,0,0,0.1)";
const TOP_PICK_COL_CLS = "w-[70px]";
const TABLE_SHADOW =
  "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";
const HEADER_CLS = "text-sm leading-5 text-[#6a7282]";

const HERO_GRADIENT =
  "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.85) 60.096%, rgba(255,255,255,0.72) 84.135%, rgba(255,255,255,0.6) 100%)";

const ASSET_TAG_ICONS = {
  ticker: "/fixed-income-tag-newspaper.svg",
  currency: "/global-bond-tag-currency.svg",
  rating: "/global-bond-tag-shield.svg",
} as const;

const YIELD_FILTERS: { id: YieldFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "lt2", label: "< 2%" },
  { id: "2-3", label: "2–3%" },
  { id: "3-4", label: "3–4%" },
  { id: "gt4", label: "> 4%" },
];

const MATURITY_FILTERS: { id: MaturityFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "short", label: "ระยะสั้น (≤3 ปี)" },
  { id: "long", label: "ระยะยาว (> 3ปี)" },
];

const headerBorder = (opts?: { right?: boolean; left?: boolean }) => ({
  borderBottom: `1px solid ${BORDER_COLOR}`,
  borderRight: opts?.right === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderLeft: opts?.left ? `1px solid ${BORDER_COLOR}` : undefined,
});

const cellBorder = (opts?: { bottom?: boolean }) => ({
  borderBottom:
    opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
});

function AssetTag({
  iconSrc,
  label,
  compact,
}: {
  iconSrc: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded bg-[#f3f4f6] text-[rgba(0,0,0,0.6)] whitespace-nowrap ${
        compact
          ? "px-1 py-0.5 text-[9px] leading-[14px] md:px-2 md:py-1 md:text-xs md:leading-[18px] md:gap-0.5"
          : "px-2 py-1 text-xs leading-[18px] gap-0.5"
      }`}
    >
      <img alt="" src={iconSrc} className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

function FilterPillGroup<T extends string>({
  options,
  value,
  onChange,
  scrollable,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  scrollable?: boolean;
}) {
  const group = (
    <div
      className="inline-flex items-center p-1 rounded-lg bg-[#f3f3f3] shrink-0"
      style={{ boxShadow: "0px 0px 0px 1px #e5e7eb" }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg border-none cursor-pointer text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)] whitespace-nowrap transition-colors ${
              active ? "bg-white" : "bg-transparent"
            }`}
            style={
              active
                ? {
                    boxShadow:
                      "0px 0px 0px 1px #e5e7eb, 0px 1px 2px 0px rgba(0,0,0,0.05)",
                  }
                : undefined
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  if (!scrollable) return group;

  return (
    <div
      className="max-w-full overflow-x-auto md:overflow-visible hide-scrollbar"
      style={{ scrollbarWidth: "none" }}
    >
      {group}
    </div>
  );
}

function IssuerLogo({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 size-8 rounded overflow-hidden"
      style={{ border: `1px solid ${BORDER_COLOR}` }}
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover rounded pointer-events-none"
        src={src}
      />
    </div>
  );
}

function TopPickTag() {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded bg-[#fff7ed] px-1 py-0.5 text-xs leading-4 text-[#f54a00] whitespace-nowrap">
      Top Pick
    </span>
  );
}

function BondNameCell({ row }: { row: GlobalBondRow }) {
  return (
    <>
      <IssuerLogo src={row.logo} />
      <span className="min-w-0 flex-1 truncate text-sm leading-5 text-[#101828]">
        {row.name}
      </span>
    </>
  );
}

function FactsheetButton() {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-0.5 px-1 pr-1.5 py-1 rounded border text-xs font-medium leading-[18px] text-[#101828] bg-white whitespace-nowrap"
      style={{ borderColor: BORDER_COLOR }}
    >
      <FileTextIcon size={16} className="shrink-0" />
      Factsheet
    </button>
  );
}

function InvestButton({ fullWidth }: { fullWidth?: boolean }) {
  return (
    <Button
      variant="primary"
      size={fullWidth ? "lg" : "xs"}
      className={fullWidth ? "w-full max-w-[343px]" : "whitespace-nowrap"}
      onClick={(e) => e.stopPropagation()}
    >
      สนใจลงทุน
    </Button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start w-full text-sm leading-[22px]">
      <span className="flex-1 text-[#4a5565]">{label}</span>
      <span className="shrink-0 text-[#101828] text-right whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

function BondAccordionList({ bonds }: { bonds: GlobalBondRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(
    bonds[0]?.id ?? null,
  );

  useEffect(() => {
    setExpandedId(bonds[0]?.id ?? null);
  }, [bonds]);

  if (bonds.length === 0) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden bg-white px-4 py-10 text-center text-sm text-[#6a7282]"
        style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
      >
        ไม่พบรายการที่ตรงกับตัวกรอง
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      {bonds.map((row, i) => {
        const expanded = expandedId === row.id;
        const isLast = i === bonds.length - 1;
        return (
          <div
            key={row.id}
            className="w-full"
            style={{
              borderBottom: isLast ? undefined : `1px solid ${BORDER_COLOR}`,
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : row.id)}
              className="flex w-full items-start gap-2 p-3 bg-white border-none cursor-pointer text-left"
            >
              <div className="flex items-center py-0.5 shrink-0">
                <IssuerLogo src={row.logo} />
              </div>
              <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-[22px] text-[#101828] truncate">
                  {row.name}
                </span>
                <span className="text-xs leading-[18px] text-[#4a5565]">
                  {row.isin}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm leading-[22px] text-[#101828]">
                  {row.yieldPct}
                </span>
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
                </div>
                <InvestButton fullWidth />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BondTable({ bonds }: { bonds: GlobalBondRow[] }) {
  if (bonds.length === 0) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden bg-white px-4 py-10 text-center text-sm text-[#6a7282]"
        style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
      >
        ไม่พบรายการที่ตรงกับตัวกรอง
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white"
      style={{ border: `1px solid ${BORDER_COLOR}`, boxShadow: TABLE_SHADOW }}
    >
      <div
        className="overflow-x-auto hide-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-stretch min-w-[1280px]">
          <div className="flex flex-col flex-1 min-w-0">
            <div
              className="flex h-11 items-center px-4"
              style={headerBorder({ left: true, right: false })}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Bonds</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex items-center gap-2 min-w-0 px-4 py-3.5 min-h-[52px] overflow-hidden"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <BondNameCell row={row} />
              </div>
            ))}
          </div>
          <div className={`flex flex-col shrink-0 ${TOP_PICK_COL_CLS}`}>
            <div
              className="flex h-11 items-center justify-center px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} opacity-0`} aria-hidden>
                Top Pick
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                {row.topPick && <TopPickTag />}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[138px] shrink-0">
            <div className="flex h-11 items-center px-4" style={headerBorder()}>
              <span className={`${HEADER_CLS} whitespace-nowrap`}>ISIN</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.isin}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[80px] shrink-0">
            <div
              className="flex h-11 items-center justify-center px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>
                Currency
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.currency}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div
              className="flex h-11 items-center justify-end px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>
                Coupon Rate
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.couponRate}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[76px] shrink-0">
            <div
              className="flex h-11 items-center justify-end px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>Price</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.price}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[165px] shrink-0">
            <div
              className="flex h-11 items-center justify-end px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>
                ผลตอบแทนโดยประมาณ
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.yieldPct}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div
              className="flex h-11 items-center justify-end px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>
                วันครบกำหนด
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.maturity}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div
              className="flex h-11 items-center justify-end px-4"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>
                ระยะเวลา (ปี)
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-end px-4 py-3.5 min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <span className="text-sm leading-5 text-[#101828]">
                  {row.duration}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div
              className="flex items-center justify-center p-3"
              style={headerBorder()}
            >
              <span className={`${HEADER_CLS} whitespace-nowrap`}>เอกสาร</span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-3 py-[11px] min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <FactsheetButton />
              </div>
            ))}
          </div>
          <div className="flex flex-col shrink-0">
            <div
              className="flex items-center justify-end p-3"
              style={headerBorder({ right: false })}
            >
              <span className={`${HEADER_CLS} opacity-0`} aria-hidden>
                Action
              </span>
            </div>
            {bonds.map((row, i) => (
              <div
                key={row.id}
                className="flex flex-1 items-center justify-center px-4 py-[11px] min-h-[52px]"
                style={cellBorder({
                  bottom: i === bonds.length - 1 ? false : undefined,
                })}
              >
                <InvestButton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardLogo({ card }: { card: DetailRecommendedCard }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[rgba(0,0,0,0.08)]">
      {card.logoVariant === "meta-infinity" ? (
        <img
          alt=""
          src={card.logoSrc}
          className="h-[15.5px] w-8 object-contain"
        />
      ) : (
        <img
          alt=""
          src={card.logoSrc}
          className="size-[30px] rounded object-cover"
        />
      )}
    </div>
  );
}

function RecommendedBondCard({
  card,
  highlighted,
  onSelect,
}: {
  card: DetailRecommendedCard;
  highlighted: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`box-border flex h-[194px] w-[320px] md:w-[416px] shrink-0 lg:w-full lg:min-w-0 flex-col items-center justify-between gap-4 rounded-xl bg-white p-4 ${
        highlighted ? "border-2 border-[#51a2ff]" : "border-0"
      }`}
      style={{ boxShadow: TABLE_SHADOW }}
    >
      <div className="flex w-full shrink-0 flex-col items-start gap-3">
        <div className="flex w-full items-start gap-2">
          <CardLogo card={card} />
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="w-full truncate text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
              {card.title}
            </p>
            <div className="flex w-full items-start gap-0.5 whitespace-nowrap text-xs leading-[18px] text-[rgba(0,0,0,0.6)]">
              <span>Ticker:</span>
              <span>{card.ticker}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-start justify-center gap-4 rounded-lg bg-[#f9f9f9] p-2">
          <div className="flex min-w-0 flex-1 flex-col items-center self-stretch text-center">
            <p className="w-full text-xs leading-[18px] text-[rgba(0,0,0,0.4)]">
              ผลตอบแทนโดยประมาณ
            </p>
            <p className="w-full text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
              {card.estimatedYield}
            </p>
          </div>
          <div className="w-px shrink-0 self-stretch bg-black/10" />
          <div className="flex min-w-0 flex-1 flex-col items-center self-stretch text-center">
            <p className="w-full text-xs leading-[18px] text-[rgba(0,0,0,0.4)]">
              วันครบกำหนด
            </p>
            <p className="w-full text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
              {card.maturityRange}
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full shrink-0"
        onClick={onSelect}
      >
        รายละเอียด
      </Button>
    </div>
  );
}

export function GlobalBondDetail({
  issuerId,
  onBack,
  onIssuerSelect,
}: {
  issuerId: GlobalBondIssuerId;
  onBack: () => void;
  onIssuerSelect?: (issuerId: GlobalBondIssuerId) => void;
}) {
  const issuer = getGlobalBondIssuer(issuerId);
  const [yieldFilter, setYieldFilter] = useState<YieldFilter>("all");
  const [maturityFilter, setMaturityFilter] = useState<MaturityFilter>("all");

  const filteredBonds = useMemo(
    () =>
      issuer
        ? filterGlobalBonds(issuer.bonds, yieldFilter, maturityFilter)
        : [],
    [issuer, yieldFilter, maturityFilter],
  );

  const recommendedCards = DETAIL_RECOMMENDED_CARDS;

  const highlightedIssuerId = DETAIL_RECOMMENDED_ISSUERS.includes(issuerId)
    ? issuerId
    : DETAIL_RECOMMENDED_ISSUERS[0];

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [issuerId]);

  useEffect(() => {
    setYieldFilter("all");
    setMaturityFilter("all");
  }, [issuerId]);

  if (!issuer) {
    return (
      <div className="flex flex-col items-center w-full pt-6 pb-20 px-4 md:px-8 lg:px-20">
        <div className="flex gap-2 items-center h-[46px] py-2 w-full max-w-[1280px]">
          <Button
            variant="plain"
            size="icon-sm"
            onClick={onBack}
            aria-label="กลับ"
          >
            <ArrowLeftIcon size={20} />
          </Button>
          <h1 className="text-lg font-bold leading-[26px] text-[#101828]">
            ไม่พบข้อมูล
          </h1>
        </div>
      </div>
    );
  }

  const heroImage = issuer.heroImage ?? "/global-bond-apple-hero.png";
  const updatedAtMobile = issuer.updatedAt
    .replace("September", "Sep")
    .replace("August", "Aug");

  return (
    <div className="flex flex-col items-stretch w-full pt-4 pb-10 px-4 md:pt-6 md:pb-20 md:px-8 lg:px-20 bg-gradient-to-b from-white from-[43.451%] to-transparent">
      <div className="flex gap-2 items-center h-[46px] py-2 w-full max-w-[1280px] mx-auto">
        <Button
          variant="plain"
          size="icon-sm"
          onClick={onBack}
          aria-label="กลับ"
          className="shrink-0"
        >
          <ArrowLeftIcon size={20} />
        </Button>
        <h1 className="flex-1 min-w-0 text-base lg:text-lg font-bold leading-6 lg:leading-[26px] text-[#101828] text-left truncate">
          {issuer.title}
        </h1>
      </div>

      <div className="flex flex-col gap-4 md:gap-8 lg:gap-8 w-full max-w-[1280px] mx-auto">
        <div className="relative flex flex-col gap-6 px-4 py-6 md:p-8 rounded-xl overflow-hidden">
          <img
            alt=""
            src={heroImage}
            className="absolute inset-0 size-full object-cover pointer-events-none opacity-80"
          />
          <div
            className="absolute inset-0 rounded-xl"
            style={{ background: HERO_GRADIENT }}
          />

          {/* Block 1: Logo, title, tags, description (tablet/desktop) */}
          <div className="relative flex flex-col gap-2 md:gap-1.5 lg:min-h-[83px] lg:justify-between w-full">
            <div className="flex flex-col gap-2 lg:pb-[9px] w-full">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between w-full">
                <div className="flex gap-2 items-center min-w-0">
                  <div
                    className="flex items-center justify-center shrink-0 size-7 md:size-8 rounded-lg bg-white overflow-hidden"
                    style={{ boxShadow: "0px 0px 0px 1px #e5e7eb" }}
                  >
                    <img
                      alt=""
                      src={issuer.logo}
                      className="size-full object-cover"
                    />
                  </div>
                  <h2 className="text-lg font-bold leading-[26px] text-[rgba(0,0,0,0.85)] md:text-[32px] md:leading-[48px] whitespace-nowrap">
                    {issuer.title}
                  </h2>
                </div>
                <div className="hidden lg:flex flex-wrap gap-[7px] items-center">
                  <AssetTag
                    iconSrc={ASSET_TAG_ICONS.ticker}
                    label={`Ticker : ${issuer.ticker}`}
                  />
                  <AssetTag
                    iconSrc={ASSET_TAG_ICONS.currency}
                    label={`Currency : ${issuer.currency}`}
                  />
                  <AssetTag
                    iconSrc={ASSET_TAG_ICONS.rating}
                    label={issuer.creditRating}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-[7px] items-center lg:hidden">
                <AssetTag
                  compact
                  iconSrc={ASSET_TAG_ICONS.ticker}
                  label={`Ticker : ${issuer.ticker}`}
                />
                <AssetTag
                  compact
                  iconSrc={ASSET_TAG_ICONS.currency}
                  label={`Currency : ${issuer.currency}`}
                />
                <AssetTag
                  compact
                  iconSrc={ASSET_TAG_ICONS.rating}
                  label={issuer.creditRating}
                />
              </div>
            </div>
            <p className="hidden md:block text-base font-semibold leading-6 text-[rgba(0,0,0,0.75)]">
              {issuer.description}
            </p>
          </div>

          {/* Block 2: Description (mobile) + filters */}
          <div className="relative flex flex-col gap-3 md:gap-2 w-full">
            <p className="md:hidden text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.75)]">
              {issuer.description}
            </p>
            <div className="flex flex-col gap-3 md:gap-2 lg:flex-row lg:gap-10 lg:items-start">
              <div className="flex flex-col gap-2 md:flex-row md:gap-4 md:items-center lg:gap-3 lg:items-center">
                <span className="text-xs leading-[18px] text-[rgba(0,0,0,0.75)] md:text-sm md:leading-[22px] whitespace-nowrap">
                  ผลตอบแทนโดยประมาณ :
                </span>
                <FilterPillGroup
                  scrollable
                  options={YIELD_FILTERS}
                  value={yieldFilter}
                  onChange={setYieldFilter}
                />
              </div>
              <div className="flex flex-col gap-[9px] md:flex-row md:gap-4 md:items-center lg:gap-3 lg:items-center">
                <span className="text-sm leading-[22px] text-[rgba(0,0,0,0.75)] whitespace-nowrap">
                  ระยะเวลาครบกำหนด :
                </span>
                <FilterPillGroup
                  scrollable
                  options={MATURITY_FILTERS}
                  value={maturityFilter}
                  onChange={setMaturityFilter}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-12 w-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between w-full gap-3">
              <p className="text-sm font-bold leading-5 text-[#101828] md:text-base md:leading-6">
                จำนวน {filteredBonds.length} รายการ
              </p>
              <span className="text-xs leading-4 text-[#6a7282] md:text-sm md:leading-5 whitespace-nowrap shrink-0">
                <span className="md:hidden">
                  อัปเดตล่าสุด {updatedAtMobile}
                </span>
                <span className="hidden md:inline">
                  อัปเดตล่าสุด {issuer.updatedAt}
                </span>
              </span>
            </div>
            <div className="lg:hidden">
              <BondAccordionList bonds={filteredBonds} />
            </div>
            <div className="hidden lg:block">
              <BondTable bonds={filteredBonds} />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-2 items-center">
              <img
                alt=""
                src="/global-bond-sparkle.svg"
                className="size-5 shrink-0"
              />
              <h3 className="text-sm font-semibold leading-[22px] text-[rgba(0,0,0,0.85)] md:text-xl md:font-bold md:leading-7 md:tracking-[-0.5px]">
                Recommended Bonds
              </h3>
            </div>
            <div className="overflow-x-auto hide-scrollbar -mx-4 w-[calc(100%+2rem)] md:-mx-8 md:w-[calc(100%+4rem)] lg:mx-0 lg:w-full lg:overflow-visible">
              <div className="flex gap-4 min-w-max px-4 md:px-8 lg:min-w-0 lg:w-full lg:grid lg:grid-cols-3 lg:px-0">
                {recommendedCards.map((card) => (
                  <RecommendedBondCard
                    key={card.id}
                    card={card}
                    highlighted={card.id === highlightedIssuerId}
                    onSelect={() => onIssuerSelect?.(card.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
