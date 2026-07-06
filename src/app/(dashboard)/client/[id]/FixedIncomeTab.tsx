"use client";

import { useState } from "react";
import { Button } from "@sarunyu/system-one";
import { BuildingsIcon, FunnelSimpleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import {
  BOND_LOGOS,
  FIXED_INCOME_BONDS,
  getBookingLabel,
  getRiskNumber,
  type FixedIncomeAction,
  type FixedIncomeBond,
  type FixedIncomeStatus,
} from "./fixed-income-data";

const BORDER_COLOR = "rgba(0,0,0,0.1)";
const TAB_SHADOW = "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)";

function HandshakeIcon({ size = 20, color = "#101828" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path
        d="M9.35602 17.0268C9.32222 17.162 9.2442 17.2821 9.13435 17.3679C9.02451 17.4536 8.88914 17.5002 8.74977 17.5003C8.69711 17.5005 8.64462 17.4942 8.59352 17.4815L6.09352 16.8565C6.02392 16.839 5.95785 16.8097 5.8982 16.7698L4.0232 15.5198C3.88531 15.4278 3.78961 15.2848 3.75716 15.1222C3.72471 14.9597 3.75816 14.7909 3.85016 14.653C3.94215 14.5151 4.08516 14.4194 4.24772 14.387C4.41027 14.3545 4.57906 14.388 4.71695 14.48L6.50133 15.6698L8.89664 16.269C8.97667 16.2884 9.05208 16.3234 9.11853 16.3721C9.18498 16.4207 9.24117 16.482 9.28385 16.5524C9.32654 16.6229 9.35489 16.701 9.36728 16.7824C9.37966 16.8638 9.37584 16.9469 9.35602 17.0268ZM19.7224 9.49089C19.6711 9.64666 19.5895 9.79072 19.4822 9.91476C19.375 10.0388 19.2442 10.1403 19.0974 10.2136L17.2474 11.1386L16.0693 12.3175L12.9443 15.4425C12.8679 15.5188 12.7731 15.574 12.669 15.6027C12.565 15.6315 12.4553 15.6328 12.3505 15.6065L7.35055 14.3565C7.27451 14.3374 7.20271 14.3043 7.13883 14.2589L2.80133 11.162L0.904454 10.2136C0.607998 10.0654 0.382533 9.80548 0.277636 9.49109C0.17274 9.17669 0.196999 8.8335 0.345079 8.53699L2.28649 4.65496C2.43468 4.3585 2.69455 4.13304 3.00895 4.02814C3.32335 3.92324 3.66653 3.9475 3.96305 4.09558L5.68649 4.95496L9.82711 3.77214C9.93944 3.74001 10.0585 3.74001 10.1709 3.77214L14.3115 4.95496L16.0349 4.09558C16.3314 3.9475 16.6746 3.92324 16.989 4.02814C17.3034 4.13304 17.5633 4.3585 17.7115 4.65496L19.6529 8.53699C19.7269 8.68351 19.7712 8.84325 19.7831 9.00698C19.7951 9.17071 19.7744 9.33519 19.7224 9.49089ZM14.6873 11.9268L12.5224 10.1932C10.9959 11.4432 9.05758 11.6081 7.45133 10.5839C7.29333 10.4834 7.15993 10.3486 7.06098 10.1897C6.96203 10.0307 6.90007 9.85148 6.87967 9.66534C6.85927 9.47919 6.88096 9.29084 6.94312 9.1142C7.00529 8.93756 7.10635 8.77714 7.23883 8.6448C7.24071 8.64253 7.2428 8.64043 7.24508 8.63855L10.7498 5.23933L9.99977 5.02527L6.0607 6.15105L3.92242 10.4268L7.76617 13.1729L12.3084 14.3081L14.6873 11.9268ZM16.1123 10.5018L13.9888 6.25027H11.5029L8.12477 9.53152C9.11383 10.1636 10.6646 10.3378 12.056 8.93543C12.1647 8.82589 12.31 8.76043 12.4641 8.75163C12.6181 8.74283 12.77 8.79132 12.8904 8.88777L15.5787 11.0417L16.1123 10.5018Z"
        fill={color}
      />
    </svg>
  );
}

const headerBorderStyle = (opts?: { right?: boolean; bottom?: boolean; left?: boolean }) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderRight: opts?.right === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderLeft: opts?.left ? `1px solid ${BORDER_COLOR}` : undefined,
});

const cellBorderStyle = (opts?: { bottom?: boolean }) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
});
const HEADER_TEXT = "text-sm leading-5 text-[#6a7282]";

function StatusTag({ status, label }: { status: FixedIncomeStatus; label: string }) {
  const isOpen = status === "open";
  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden px-2 py-1 rounded shrink-0 text-xs font-bold leading-4 whitespace-nowrap"
      style={{
        backgroundColor: isOpen ? "#dbfce7" : "#f3f4f6",
        color: isOpen ? "#008236" : "#6a7282",
      }}
    >
      {label}
    </span>
  );
}

const ACTION_LABELS: Record<FixedIncomeAction, string> = {
  invest: "สนใจลงทุน",
  follow: "ติดตาม",
  followed: "ติดตามแล้ว",
};

function ActionButton({ action }: { action: FixedIncomeAction }) {
  const isFollowed = action === "followed";
  return (
    <button
      type="button"
      disabled={isFollowed}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center px-1.5 py-1 rounded text-xs font-medium leading-[18px] whitespace-nowrap max-w-[343px]"
      style={{
        backgroundColor: isFollowed ? "#f3f4f6" : "#0a6ee7",
        color: isFollowed ? "#99a1af" : "white",
        cursor: isFollowed ? "default" : "pointer",
      }}
    >
      {ACTION_LABELS[action]}
    </button>
  );
}

function CardActionButton({ action }: { action: FixedIncomeAction }) {
  const isFollowed = action === "followed";
  return (
    <Button
      variant="primary"
      size="lg"
      disabled={isFollowed}
      className="shrink-0 max-w-[343px]"
      onClick={(e) => e.stopPropagation()}
    >
      {ACTION_LABELS[action]}
    </Button>
  );
}

function BondLogo({ bond, size = "sm" }: { bond: FixedIncomeBond; size?: "sm" | "lg" }) {
  const src = BOND_LOGOS[bond.logoIdx];
  const dim = size === "lg" ? "size-8" : "size-5";
  return (
    <div className={`relative shrink-0 ${dim} rounded overflow-hidden`} style={{ border: `1px solid ${BORDER_COLOR}` }}>
      {bond.logoCrop ? (
        <img alt="" className="absolute h-[149.62%] left-[-92.5%] max-w-none top-[-24.81%] w-[285%]" src={src} />
      ) : (
        <img alt="" className="absolute inset-0 size-full object-cover rounded pointer-events-none" src={src} />
      )}
    </div>
  );
}

function FixedIncomeCard({
  bond,
  onSelect,
}: {
  bond: FixedIncomeBond;
  onSelect: (bond: FixedIncomeBond) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(bond)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(bond);
        }
      }}
      className="flex flex-col gap-2 items-start p-3 rounded-xl w-full bg-white cursor-pointer"
      style={{ border: `1px solid ${BORDER_COLOR}` }}
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-start w-full">
          <StatusTag status={bond.status} label={bond.statusLabel} />
          <span className="flex-1 min-w-0 text-base font-bold leading-6 text-[#101828] truncate">{bond.symbol}</span>
          <div className="flex gap-1 items-center shrink-0 whitespace-nowrap">
            <span className="text-base font-bold leading-6 text-[#101828]">{bond.ytm}</span>
            <span className="text-xs leading-4 text-[#6a7282]">YTM</span>
          </div>
        </div>
        <div className="flex gap-2 items-center w-full text-xs leading-4 text-[#101828]">
          <span className="flex-1 min-w-0">{bond.companyRating}</span>
          <span className="shrink-0 whitespace-nowrap">{bond.couponPeriod}</span>
        </div>
        <div className="flex gap-2 items-center w-full text-xs leading-4 text-[#101828]">
          <span className="flex-1 min-w-0">ครบกำหนด: {bond.maturity}</span>
          <span className="shrink-0 whitespace-nowrap">{bond.tenor}</span>
        </div>
        <div className="flex gap-2 items-center w-full text-xs leading-4 text-[#101828]">
          <span className="flex-1 min-w-0">{bond.offerType}</span>
          <span className="shrink-0 whitespace-nowrap">{getBookingLabel(bond)}</span>
        </div>
      </div>
      <hr className="w-full border-0 m-0" style={{ borderTop: `1px solid ${BORDER_COLOR}` }} />
      <div className="flex gap-3 items-center w-full">
        <BondLogo bond={bond} size="lg" />
        <div className="flex flex-1 min-w-0 gap-3 items-center overflow-hidden">
          <span className="text-xs font-bold leading-4 text-[#101828] truncate shrink-0">{bond.companyName}</span>
          <span className="text-xs leading-4 text-[#4a5565] whitespace-nowrap shrink-0">
            {bond.bondRating} / Risk {getRiskNumber(bond.risk)}
          </span>
        </div>
        <CardActionButton action={bond.action} />
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex h-11 items-stretch shrink-0 min-w-[1280px] bg-white">
      <div className="flex flex-1 items-center px-3" style={headerBorderStyle({ left: true })}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>หุ้นกู้</span>
      </div>
      <div className="flex w-20 items-center justify-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>สถานะ</span>
      </div>
      <div className="flex w-[71px] items-center justify-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>YTM</span>
      </div>
      <div className="flex w-[93px] items-center justify-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>งวดดอกเบี้ย</span>
      </div>
      <div className="flex w-32 items-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>อายุ</span>
      </div>
      <div className="flex w-[116px] items-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>วันครบกำหนด</span>
      </div>
      <div className="flex flex-col w-[212px] shrink-0 overflow-hidden" style={headerBorderStyle()}>
        <div className="flex flex-1 items-center justify-center px-3" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <span className={`${HEADER_TEXT} whitespace-nowrap`}>Ratings</span>
        </div>
        <div className="flex flex-1 items-stretch">
          <div className="flex flex-1 items-center justify-center px-3" style={{ borderRight: `1px solid ${BORDER_COLOR}` }}>
            <span className={`${HEADER_TEXT} whitespace-nowrap`}>บริษัท</span>
          </div>
          <div className="flex flex-1 items-center justify-center px-3">
            <span className={`${HEADER_TEXT} whitespace-nowrap`}>หุ้นกู้</span>
          </div>
        </div>
      </div>
      <div className="flex w-[82px] items-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>ความเสี่ยง</span>
      </div>
      <div className="flex w-[116px] items-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>ประเภทเสนอขาย</span>
      </div>
      <div className="flex flex-1 min-w-[104px] items-center px-3" style={headerBorderStyle()}>
        <span className={`${HEADER_TEXT} whitespace-nowrap`}>คาดว่าเปิดจอง</span>
      </div>
      <div className="flex w-[92px] items-center justify-center px-3" style={headerBorderStyle({ right: false })} />
    </div>
  );
}

function BondTableRow({
  bond,
  isLast,
  onSelect,
}: {
  bond: FixedIncomeBond;
  isLast?: boolean;
  onSelect: (bond: FixedIncomeBond) => void;
}) {
  const border = () => cellBorderStyle({ bottom: !isLast });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(bond)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(bond);
        }
      }}
      className="flex items-stretch shrink-0 min-w-[1280px] bg-white cursor-pointer hover:bg-[#f9fafb] transition-colors"
    >
      <div className="flex flex-1 items-center gap-2 px-3 py-3.5" style={border()}>
        <BondLogo bond={bond} />
        <span className="flex-1 min-w-0 text-sm font-bold leading-5 text-[#101828]">{bond.symbol}</span>
      </div>
      <div className="flex w-20 items-center justify-end p-3" style={border()}>
        <StatusTag status={bond.status} label={bond.statusLabel} />
      </div>
      <div className="flex w-[71px] items-center justify-end px-3 py-3.5" style={border()}>
        <span className="text-sm font-bold leading-5 text-[#101828] whitespace-nowrap">{bond.ytm}</span>
      </div>
      <div className="flex w-[93px] items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828] whitespace-nowrap">{bond.couponPeriod}</span>
      </div>
      <div className="flex w-32 items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828] whitespace-nowrap">{bond.tenor}</span>
      </div>
      <div className="flex w-[116px] items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828]">{bond.maturity}</span>
      </div>
      <div className="flex w-[106px] items-center justify-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828] text-center">{bond.companyRating}</span>
      </div>
      <div className="flex w-[106px] items-center justify-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828] text-center">{bond.bondRating}</span>
      </div>
      <div className="flex w-[82px] items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828]">{bond.risk}</span>
      </div>
      <div className="flex w-[116px] items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828] whitespace-nowrap">{bond.offerType}</span>
      </div>
      <div className="flex flex-1 min-w-[104px] items-center px-3 py-3.5" style={border()}>
        <span className="text-sm leading-5 text-[#101828]">{bond.subscriptionPeriod}</span>
      </div>
      <div className="flex w-[92px] items-center justify-center px-3 py-[11px]" style={border()}>
        <ActionButton action={bond.action} />
      </div>
    </div>
  );
}

export function FixedIncomeTab({ onBondSelect }: { onBondSelect: (bond: FixedIncomeBond) => void }) {
  const [market, setMarket] = useState<"primary" | "secondary">("primary");

  return (
    <div className="flex flex-col gap-6 items-center w-full px-4 md:px-8 lg:px-6 pt-6 pb-10">
      <div className="flex flex-col gap-3 items-center w-full">
        <div className="flex w-full lg:justify-center">
          <div className="flex flex-row gap-3 md:gap-4 items-center w-full lg:max-w-[680px]">
            <div
              className="flex flex-1 min-w-0 max-w-[604px] gap-0 p-1 rounded-full"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <button
                type="button"
                onClick={() => setMarket("primary")}
                className="flex flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all cursor-pointer border-none"
                style={{
                  backgroundColor: market === "primary" ? "white" : "transparent",
                  boxShadow: market === "primary" ? TAB_SHADOW : "none",
                }}
              >
                {market === "primary" && <BuildingsIcon size={20} weight="fill" color="#101828" />}
                <span
                  className="text-sm leading-5 whitespace-nowrap"
                  style={{
                    fontWeight: market === "primary" ? 700 : 400,
                    color: market === "primary" ? "#101828" : "#6a7282",
                  }}
                >
                  หุ้นกู้ตลาดแรก
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("secondary")}
                className="flex flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all cursor-pointer border-none"
                style={{
                  backgroundColor: market === "secondary" ? "white" : "transparent",
                  boxShadow: market === "secondary" ? TAB_SHADOW : "none",
                }}
              >
                {market === "secondary" && <HandshakeIcon size={20} color="#101828" />}
                <span
                  className="text-sm leading-5 whitespace-nowrap"
                  style={{
                    fontWeight: market === "secondary" ? 700 : 400,
                    color: market === "secondary" ? "#101828" : "#6a7282",
                  }}
                >
                  หุ้นกู้ตลาดรอง
                </span>
              </button>
            </div>
            <Button variant="outline-black" size="icon-lg" aria-label="Filter" className="shrink-0 md:hidden">
              <FunnelSimpleIcon size={20} />
            </Button>
            <Button variant="outline-black" size="md" leftIcon={<FunnelSimpleIcon size={20} />} className="shrink-0 hidden md:flex">
              Filter
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full px-1 text-xs lg:text-sm leading-4 lg:leading-5 text-[#6a7282] whitespace-nowrap">
          <span>25 หุ้นกู้ 5 บริษัท</span>
          <span className="hidden lg:inline">อัปเดตล่าสุด 25 August 2026 - 9:00</span>
          <span className="lg:hidden">อัปเดตล่าสุด 25 Aug 2026 - 9:00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:hidden">
        {FIXED_INCOME_BONDS.map((bond) => (
          <FixedIncomeCard key={bond.id} bond={bond} onSelect={onBondSelect} />
        ))}
      </div>

      <div
        className="hidden lg:block w-full rounded-xl overflow-hidden bg-white"
        style={{
          border: `1px solid ${BORDER_COLOR}`,
          boxShadow: "0px 0px 1px rgba(102,102,102,0.16),0px 4px 4px rgba(102,102,102,0.12)",
        }}
      >
        <div className="overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
          <div className="flex flex-col items-start shrink-0 min-w-[1280px]">
            <TableHeader />
            {FIXED_INCOME_BONDS.map((bond, i) => (
              <BondTableRow
                key={bond.id}
                bond={bond}
                isLast={i === FIXED_INCOME_BONDS.length - 1}
                onSelect={onBondSelect}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 items-center justify-center w-full py-2.5 px-3 pl-3 pr-4">
        <CircleNotchIcon size={20} className="animate-spin text-[#6a7282]" />
        <span className="text-sm font-bold leading-5 text-[#6a7282]">กำลังโหลดข้อมูล</span>
      </div>
    </div>
  );
}
