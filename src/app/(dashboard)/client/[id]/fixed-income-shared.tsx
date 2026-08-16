import { Button } from "@sarunyu/system-one";
import { ArrowSquareOutIcon, FileTextIcon } from "@phosphor-icons/react";
import type { FixedIncomeStatus } from "./fixed-income-data";

// ─── Design tokens ────────────────────────────────────────────────────────────

export const BORDER_COLOR = "rgba(0,0,0,0.1)";
export const HEADER_TEXT_CLS = "text-sm leading-5 text-[#6a7282]";

/** Card/table drop-shadow used across GlobalBond tables. */
export const TABLE_SHADOW =
  "0px 0px 2px rgba(102,102,102,0.16), 0px 4px 8px rgba(102,102,102,0.12)";

/** Smaller drop-shadow variant used by the FixedIncome table card. */
export const TABLE_SHADOW_SM =
  "0px 0px 1px rgba(102,102,102,0.16),0px 4px 4px rgba(102,102,102,0.12)";

// ─── Border style helpers ─────────────────────────────────────────────────────

export const headerBorderStyle = (opts?: {
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderRight: opts?.right === false ? undefined : `1px solid ${BORDER_COLOR}`,
  borderLeft: opts?.left ? `1px solid ${BORDER_COLOR}` : undefined,
});

export const cellBorderStyle = (opts?: { bottom?: boolean }) => ({
  borderBottom: opts?.bottom === false ? undefined : `1px solid ${BORDER_COLOR}`,
});

// ─── Fixed income action labels ───────────────────────────────────────────────

export const ACTION_LABELS = {
  invest: "สร้างคำสั่งซื้อ",
  follow: "ติดตาม",
  followed: "ติดตามแล้ว",
} as const;

// ─── Shared components ────────────────────────────────────────────────────────

export function StatusTag({
  status,
  label,
}: {
  status: FixedIncomeStatus;
  label: string;
}) {
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

/**
 * Renders a bond/issuer logo with optional crop positioning.
 * Pass a `className` to control container size and border-radius,
 * e.g. "size-5 rounded" (default), "size-8 rounded", "size-12 rounded-md".
 */
const LOGO_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%239ca3af'%3E%F0%9F%8F%A2%3C/text%3E%3C/svg%3E";

function handleLogoError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = LOGO_PLACEHOLDER;
}

export function BondLogo({
  src,
  logoCrop,
  className = "size-5 rounded",
}: {
  src: string;
  logoCrop?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ border: `1px solid ${BORDER_COLOR}` }}
    >
      {logoCrop ? (
        <img
          alt=""
          className="absolute h-[149.62%] left-[-92.5%] max-w-none top-[-24.81%] w-[285%]"
          src={src}
          onError={handleLogoError}
        />
      ) : (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover rounded pointer-events-none"
          src={src}
          onError={handleLogoError}
        />
      )}
    </div>
  );
}

// ─── Shared bond-list primitives (used by GlobalBondTab + GlobalBondAllPage) ─

export function TopPickTag({ small }: { small?: boolean }) {
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

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start w-full text-sm leading-5">
      <span className="flex-1 text-[#4a5565]">{label}</span>
      <span className="shrink-0 text-[#101828] text-right whitespace-nowrap">{value}</span>
    </div>
  );
}

export function FactsheetButton() {
  return (
    <Button
      variant="outline"
      size="xs"
      leftIcon={<FileTextIcon size={16} />}
      className="whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      Factsheet
    </Button>
  );
}

/**
 * "สร้างคำสั่งซื้อ" — primary CTA. Behavior varies by call site:
 * - `fullWidth`: renders large button (accordion detail).
 * - `href`: opens URL in new tab and shows external-link icon.
 * - neither: compact table-row button that just stops propagation.
 */
export function InvestButton({
  fullWidth,
  href,
}: {
  fullWidth?: boolean;
  href?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  };
  if (fullWidth) {
    return (
      <Button
        variant="primary"
        size="xl"
        className="w-full max-w-[343px]"
        onClick={handleClick}
      >
        สร้างคำสั่งซื้อ
      </Button>
    );
  }
  return (
    <Button
      variant="primary"
      size="xs"
      rightIcon={href ? <ArrowSquareOutIcon size={16} /> : undefined}
      className="whitespace-nowrap"
      onClick={handleClick}
    >
      สร้างคำสั่งซื้อ
    </Button>
  );
}
