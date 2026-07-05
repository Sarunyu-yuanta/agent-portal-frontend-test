import { FireIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import type { StructuredProduct } from "./structured-product-data";

type CardProduct = Pick<
  StructuredProduct,
  "underlying" | "coupon" | "tenor" | "ko" | "strike" | "ki" | "tags" | "logos"
>;

export function StructuredProductCard({
  underlying,
  coupon,
  tenor,
  ko,
  strike,
  ki,
  tags,
  logos,
  onClick,
  variant = "catalog",
}: CardProduct & { onClick?: () => void; variant?: "catalog" | "grid" }) {
  const stats = [
    { label: "Tenor", value: tenor },
    { label: "KO", value: ko },
    { label: "Strike", value: strike },
    { label: "KI", value: ki },
  ];

  const isGrid = variant === "grid";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex gap-4 overflow-hidden p-4 relative rounded-[12px] w-full${
        isGrid
          ? " flex-col items-center"
          : " flex-col md:max-lg:flex-row md:max-lg:h-[100px] md:max-lg:items-start lg:flex-col lg:items-center"
      }${onClick ? " cursor-pointer" : ""}`}
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className={`flex flex-col gap-2 items-start shrink-0 w-full ${
          isGrid ? "" : "md:max-lg:flex-1 md:max-lg:min-w-0 lg:w-full"
        }`}
      >
        <div className="flex gap-2 items-center shrink-0 w-full">
          <div className="flex gap-1 items-center flex-1 min-w-0">
            {logos.map((src, i) => (
              <div
                key={i}
                className="relative shrink-0"
                style={{
                  width: 20,
                  height: 20,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <img alt="" className="absolute inset-0 w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 items-center shrink-0">
            {tags.includes("ใกล้เต็ม") && (
              <div
                className="flex gap-0.5 items-center overflow-hidden px-1 py-0.5 rounded shrink-0"
                style={{ backgroundColor: "#fdefe6" }}
              >
                <FireIcon size={12} weight="fill" color="#f97316" />
                <p className="whitespace-nowrap" style={{ color: "#101828", fontSize: 9, lineHeight: "14px" }}>
                  ใกล้เต็ม
                </p>
              </div>
            )}
            {tags.includes("รับประกันเงินต้น") && (
              <div
                className="flex gap-0.5 items-center overflow-hidden px-1 py-0.5 rounded shrink-0"
                style={{ backgroundColor: "#eff6ff" }}
              >
                <ShieldCheckIcon size={12} weight="fill" color="#2b7fff" />
                <p className="whitespace-nowrap" style={{ color: "#101828", fontSize: 9, lineHeight: "14px" }}>
                  รับประกันเงินต้น
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center shrink-0 w-full">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-bold w-full truncate" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>
              {underlying}
            </p>
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Underlying</p>
          </div>
          <div className="flex flex-col items-end shrink-0 whitespace-nowrap">
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>
              {coupon}
            </p>
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Coupon</p>
          </div>
        </div>
      </div>
      <div
        className={`flex items-start justify-center shrink-0 text-center w-full py-1.5 ${
          isGrid ? "" : "md:max-lg:items-center md:max-lg:flex-1 md:max-lg:h-full md:max-lg:min-w-0 lg:w-full md:max-lg:py-3 lg:py-1.5"
        }`}
        style={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col gap-0.5 items-center justify-center flex-1 min-w-0 ${
              isGrid ? "" : "md:max-lg:h-full"
            }`}
            style={i < stats.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.1)" } : {}}
          >
            <p style={{ color: "#6a7282", fontSize: 9, lineHeight: "14px" }}>{s.label}</p>
            <p className="font-semibold" style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
