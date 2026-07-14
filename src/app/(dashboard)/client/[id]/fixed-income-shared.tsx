import type { FixedIncomeStatus } from "./fixed-income-data";

// ─── Design tokens ────────────────────────────────────────────────────────────

export const BORDER_COLOR = "rgba(0,0,0,0.1)";
export const HEADER_TEXT_CLS = "text-sm leading-5 text-[#6a7282]";

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
