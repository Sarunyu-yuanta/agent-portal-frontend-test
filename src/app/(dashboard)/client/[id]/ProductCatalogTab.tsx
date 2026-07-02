"use client";

import { useState, useRef, useCallback } from "react";
import { Button, SearchInput, TabGroup } from "@sarunyu/system-one";
import {
  ShapesIcon, CertificateIcon, GlobeHemisphereWestIcon,
  LightningIcon, WallIcon, FactoryIcon, BasketIcon, ShirtFoldedIcon,
  InfoIcon, XIcon, ClockCounterClockwiseIcon, HourglassHighIcon,
  ArrowRightIcon, FunnelSimpleIcon, SparkleIcon, PhoneIcon,
  FireIcon, ShieldCheckIcon,
} from "@phosphor-icons/react";

// ─── Figma Asset URLs (refreshed) ────────────────────────────────────────────
const A = {
  // UI icons
  magnifyingGlass: "https://www.figma.com/api/mcp/asset/2f89682b-fdc1-4045-9041-572aaabfc626",
  infoFill: "https://www.figma.com/api/mcp/asset/a298a2c1-417e-404e-947c-2d573d56a438",
  closeX: "https://www.figma.com/api/mcp/asset/d41bed6e-2d74-4bd9-8454-5d6117e31004",
  hourglassHigh: "https://www.figma.com/api/mcp/asset/57ccec5b-3a0a-4dab-a4d9-90d077aa7e1f",
  arrowRight: "https://www.figma.com/api/mcp/asset/ba1e0039-95d0-4ce2-ba86-26e3a1c5d612",
  arrowRightSm: "https://www.figma.com/api/mcp/asset/bd7d1b7f-8d11-4c2e-b017-c2295410cd1e",
  orderListIcon: "https://www.figma.com/api/mcp/asset/67d60e44-f9e4-4782-9dc7-2d97ae6f4992",
  filterIcon: "https://www.figma.com/api/mcp/asset/75721d74-1d76-4a21-b3d4-b44777a09bea",
  sparkle: "https://www.figma.com/api/mcp/asset/3ab94ca8-803f-4683-a15e-ff0de3868bec",
  phoneIcon: "https://www.figma.com/api/mcp/asset/242c59cf-4099-444d-866e-03b11b663717",
  fire: "https://www.figma.com/api/mcp/asset/7781fa1c-d4b1-4f18-9bb1-c7944ceef4e7",
  fireSmall: "https://www.figma.com/api/mcp/asset/c5622f0d-2de9-4890-b0ce-442d75f90b13",
  shieldCheck: "https://www.figma.com/api/mcp/asset/c2c3aab0-bfd1-4eea-ad52-036428770223",
  lineDivider: "https://www.figma.com/api/mcp/asset/2986753b-4895-4381-8a8d-f3a50d3bf169",
  // Top idea sector assets (local files — stable, never expire)
  vector: "/top-idea-wave.svg",
  wall1: "/top-idea-wall-img.svg",
  energy1: "/top-idea-energy.png",
  industrials1: "/top-idea-industrials.png",
  effect: "/top-idea-effect.png",
  graphic: "/top-idea-graphic.png",
  // Investment Solution (local files — stable, never expire)
  imgSecureIncome: "/invest-secure-income.png",
  imgBalancedGrowth: "/invest-balanced-growth.png",
  imgHighConvBg: "/invest-high-conviction.png",
  recommendBg: "/investment-solution-bg.jpg",
  // Stock logos
  logoKO: "https://www.figma.com/api/mcp/asset/35aeb96b-04ba-45b4-ab74-c4efce9975bc",
  logoWMT: "https://www.figma.com/api/mcp/asset/f2d38797-fa49-4638-80aa-b2fd40baa5b3",
  logoAAPL: "https://www.figma.com/api/mcp/asset/3e3f247c-9e5f-4d73-889b-8e2ac39c6775",
  logoAMZN: "https://www.figma.com/api/mcp/asset/a03ed961-2640-4be3-a716-a7f8c88bab32",
  logoNFLX: "https://www.figma.com/api/mcp/asset/96c3fbf3-e9b9-456c-b58e-5e8de310848b",
  logoSAWAD: "https://www.figma.com/api/mcp/asset/bfc79ad4-d98a-43be-8f21-7c985bdf5f50",
  logoPTT: "https://www.figma.com/api/mcp/asset/66f9ced5-92fa-4ac4-92b8-0987267234ed",
  logoNasdaq: "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
  logoNVDA: "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
  logoAXP: "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
};

// ─── Industrials cloud sub-images (16 individual SVGs) ────────────────────────
const IND_CLOUDS = [
  { src: "/ind-cloud-0.svg", l: 151.37, t: 8.09, w: 8.922, h: 6.592 },
  { src: "/ind-cloud-1.svg", l: 133.79, t: 6.4, w: 8.908, h: 7.031 },
  { src: "/ind-cloud-2.svg", l: 135.75, t: 4.32, w: 15.023, h: 6.273 },
  { src: "/ind-cloud-3.svg", l: 118.8, t: -1.36, w: 16.574, h: 9.961 },
  { src: "/ind-cloud-4.svg", l: 117.86, t: 5.52, w: 7.324, h: 7.471 },
  { src: "/ind-cloud-5.svg", l: 145.58, t: 2.1, w: 8.981, h: 6.981 },
  { src: "/ind-cloud-6.svg", l: 152.38, t: 15.12, w: 10.491, h: 3.144 },
  { src: "/ind-cloud-7.svg", l: 135.08, t: 15.71, w: 11.948, h: 4.152 },
  { src: "/ind-cloud-8.svg", l: 156.76, t: -6.57, w: 19.402, h: 9.591 },
  { src: "/ind-cloud-9.svg", l: 107.22, t: 10.21, w: 20.92, h: 11.378 },
  { src: "/ind-cloud-10.svg", l: 124.83, t: 4.46, w: 10.394, h: 3.428 },
  { src: "/ind-cloud-11.svg", l: 146.08, t: 8.87, w: 8.628, h: 4.19 },
  { src: "/ind-cloud-12.svg", l: 124.48, t: 1.95, w: 8.629, h: 4.192 },
  { src: "/ind-cloud-13.svg", l: 169.56, t: -2.93, w: 4.05, h: 1.979 },
  { src: "/ind-cloud-14.svg", l: 121.11, t: 12.74, w: 4.481, h: 2.473 },
  { src: "/ind-cloud-15.svg", l: 151.23, t: -0.3, w: 16.212, h: 9.972 },
];

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOP_IDEAS = [
  { sector: "Energy", icon: <LightningIcon size={12} color="#525252" />, sectorImg: A.energy1 },
  { sector: "Material", icon: <WallIcon size={12} color="#525252" />, sectorImg: A.wall1 },
  { sector: "Industrials", icon: <FactoryIcon size={12} color="#525252" />, sectorImg: A.industrials1 },
  { sector: "Consumer Discretionary", icon: <BasketIcon size={12} color="#525252" />, sectorImg: A.effect },
  { sector: "Consumer Staples", icon: <ShirtFoldedIcon size={12} color="#525252" />, sectorImg: A.graphic },
  { sector: "Material", icon: <WallIcon size={12} color="#525252" />, sectorImg: A.wall1 },
  { sector: "Energy", icon: <LightningIcon size={12} color="#525252" />, sectorImg: A.energy1 },
  { sector: "Consumer Discretionary", icon: <BasketIcon size={12} color="#525252" />, sectorImg: A.effect },
];

const TOP_IDEA_THEMES: Record<string, string> = {
  Energy: "สงครามน้ำมันแพง",
  Material: "ต้นทุนการผลิตสูงขึ้น",
  Industrials: "การขนส่งล่าช้าและมีราคาแพง",
  "Consumer Discretionary": "ความต้องการสินค้าอุตสาหกรรมลดลง",
  "Consumer Staples": "ผู้บริโภคลดการใช้จ่าย",
};

type StockProduct = {
  underlying: string; coupon: string; tenor: string;
  ko: string; strike: string; ki: string;
  tags: string[]; logos: string[];
};

const TOP_PICKS: StockProduct[] = [
  { underlying: "KO - WMT", coupon: "28.33%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม", "รับประกันเงินต้น"], logos: [A.logoKO, A.logoWMT] },
  { underlying: "AAPL - AMZN - NFLX", coupon: "30.00%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoAAPL, A.logoAMZN, A.logoNFLX] },
  { underlying: "SAWAD - PTT", coupon: "29.87%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoSAWAD, A.logoPTT] },
];

const STRUCTURED_PRODUCTS: StockProduct[] = [
  { underlying: "KO - WMT", coupon: "14.22%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["รับประกันเงินต้น"], logos: [A.logoKO, A.logoWMT] },
  { underlying: "AAPL - AMZN - NFLX", coupon: "12.56%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoAAPL, A.logoAMZN, A.logoNFLX] },
  { underlying: "SAWAD - PTT", coupon: "13.98%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม", "รับประกันเงินต้น"], logos: [A.logoSAWAD, A.logoPTT] },
  { underlying: "Nasdaq - AMZN - NFLX", coupon: "11.76%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["รับประกันเงินต้น"], logos: [A.logoNasdaq, A.logoAMZN, A.logoNFLX] },
  { underlying: "NVDA - AMZN - AXP", coupon: "10.45%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: [], logos: [A.logoNVDA, A.logoAMZN, A.logoAXP] },
];

const PRODUCT_TABS = [
  { id: "structured", title: "Structured Product", icon: <ShapesIcon size={18} /> },
  { id: "fixed-income", title: "Fixed Income", icon: <CertificateIcon size={18} /> },
  { id: "global-bond", title: "Global Bond", icon: <GlobeHemisphereWestIcon size={18} /> },
];

const PRODUCT_TABS_MOBILE = [
  { id: "structured", title: "Structured Product" },
  { id: "fixed-income", title: "Fixed Income" },
  { id: "global-bond", title: "Global Bond" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopIdeaCard({ sector, icon, sectorImg }: typeof TOP_IDEAS[0]) {
  const theme = TOP_IDEA_THEMES[sector] ?? "";
  return (
    <div
      className="shrink-0 relative overflow-hidden rounded-[8px] w-[171px] md:w-[200px]"
      style={{
        height: 98,
        backgroundColor: "#f3f4f6",
        boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)",
      }}
    >
      {/* Wave background — rotated 176.8deg per Figma */}
      <div className="absolute flex items-center justify-center pointer-events-none"
        style={{ left: -5.61, top: -20.65, width: 196.729, height: 90.39 }}
      >
        <div style={{ transform: "rotate(176.8deg)", flexShrink: 0 }}>
          <div style={{ width: 192.58, height: 79.778, position: "relative" }}>
            <div className="absolute" style={{ top: "-25.07%", right: "-12.46%", bottom: "-35.1%", left: "-12.46%" }}>
              <img alt="" className="block max-w-none w-full h-full" src={A.vector} />
            </div>
          </div>
        </div>
      </div>

      {/* Sector image — per-sector positioning from Figma */}
      {sector === "Energy" && sectorImg && (
        <div className="absolute pointer-events-none"
          style={{ left: 107.19, top: -23.23, width: 60.284, height: 61.408 }}>
          <img alt="" className="absolute inset-0 w-full h-full object-cover" src={sectorImg} />
        </div>
      )}
      {sector === "Material" && sectorImg && (
        <div className="absolute pointer-events-none"
          style={{ left: 114.08, top: -0.75, width: 63.103, height: 23.21 }}>
          <img alt="" className="absolute inset-0 w-full h-full" src={sectorImg} />
        </div>
      )}
      {sector === "Industrials" && IND_CLOUDS.map((c, i) => (
        <div key={i} className="absolute pointer-events-none"
          style={{ left: c.l, top: c.t, width: c.w, height: c.h }}>
          <img alt="" className="absolute inset-0 max-w-none w-full h-full" src={c.src} />
        </div>
      ))}
      {sector === "Consumer Discretionary" && sectorImg && (
        <div className="absolute pointer-events-none"
          style={{ left: 106, top: -3.97, width: 68.696, height: 41.109 }}>
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute max-w-none"
              style={{ height: "167.51%", left: "-22.85%", top: "-14.39%", width: "167.05%" }}
              src={sectorImg} />
          </div>
        </div>
      )}
      {sector === "Consumer Staples" && sectorImg && (
        <div className="absolute flex items-center justify-center pointer-events-none"
          style={{ left: 130, top: -3.64, width: 41.03, height: 27.563, mixBlendMode: "luminosity" }}>
          <div style={{ transform: "rotate(-15deg)", flexShrink: 0 }}>
            <div style={{ width: 37.525, height: 18.481, position: "relative" }}>
              <img alt="" className="absolute inset-0 max-w-none w-full h-full pointer-events-none"
                style={{ objectPosition: "bottom", opacity: 0.8 }}
                src={sectorImg} />
            </div>
          </div>
        </div>
      )}

      {/* Title frame — sector icon + label */}
      <div className="absolute flex items-center gap-1"
        style={{ left: 4, top: 2, height: 16 }}
      >
        <div className="shrink-0 flex items-center justify-center" style={{ width: 12, height: 12 }}>
          {icon}
        </div>
        <p className="whitespace-nowrap" style={{ color: "#525252", fontSize: 12, lineHeight: "16px" }}>
          {sector}
        </p>
      </div>

      {/* Content frame — white box with text + % */}
      <div
        className="absolute flex flex-col justify-between"
        style={{
          left: 2, right: 2, top: 20, height: 76,
          backgroundColor: "white", borderRadius: 6,
          paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8,
        }}
      >
        <p className="font-bold" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>
          {theme}
        </p>
        <div className="flex items-baseline gap-0.5 justify-end whitespace-nowrap">
          <span style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>up to</span>
          <span className="font-bold" style={{ color: "#008236", fontSize: 18, lineHeight: "24px" }}>30.5%</span>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ underlying, coupon, tenor, ko, strike, ki, tags, logos }: StockProduct) {
  const stats = [{ label: "Tenor", value: tenor }, { label: "KO", value: ko }, { label: "Strike", value: strike }, { label: "KI", value: ki }];
  return (
    <div
      className="flex flex-col md:flex-row lg:flex-col gap-4 md:gap-4 md:h-[100px] md:items-start lg:items-center overflow-hidden p-4 relative rounded-[12px] w-full"
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header — left column on tablet */}
      <div className="flex flex-col gap-2 items-start shrink-0 w-full md:flex-1 md:min-w-0 lg:w-full">
        {/* Logos + tags */}
        <div className="flex gap-2 items-center shrink-0 w-full">
          <div className="flex gap-1 items-center flex-1 min-w-0">
            {logos.map((src, i) => (
              <div key={i} className="relative shrink-0" style={{ width: 20, height: 20, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <img alt="" className="absolute inset-0 w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 items-center shrink-0">
            {tags.includes("ใกล้เต็ม") && (
              <div className="flex gap-0.5 items-center overflow-hidden px-1 py-0.5 rounded shrink-0" style={{ backgroundColor: "#fdefe6" }}>
                <FireIcon size={12} weight="fill" color="#f97316" />
                <p className="whitespace-nowrap" style={{ color: "#101828", fontSize: 9, lineHeight: "14px" }}>ใกล้เต็ม</p>
              </div>
            )}
            {tags.includes("รับประกันเงินต้น") && (
              <div className="flex gap-0.5 items-center overflow-hidden px-1 py-0.5 rounded shrink-0" style={{ backgroundColor: "#eff6ff" }}>
                <ShieldCheckIcon size={12} weight="fill" color="#2b7fff" />
                <p className="whitespace-nowrap" style={{ color: "#101828", fontSize: 9, lineHeight: "14px" }}>รับประกันเงินต้น</p>
              </div>
            )}
          </div>
        </div>
        {/* Underlying + Coupon */}
        <div className="flex gap-2 items-center shrink-0 w-full">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-bold w-full truncate" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{underlying}</p>
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Underlying</p>
          </div>
          <div className="flex flex-col items-end shrink-0 whitespace-nowrap">
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{coupon}</p>
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Coupon</p>
          </div>
        </div>
      </div>
      {/* Stats — right column on tablet */}
      <div
        className="flex items-start md:items-center justify-center shrink-0 text-center w-full md:flex-1 md:h-full md:min-w-0 lg:w-full py-1.5 md:py-3"
        style={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col gap-0.5 items-center justify-center flex-1 min-w-0 md:h-full"
            style={i < stats.length - 1 ? { borderRight: "1px solid rgba(0,0,0,0.1)" } : {}}
          >
            <p style={{ color: "#6a7282", fontSize: 9, lineHeight: "14px" }}>{s.label}</p>
            <p className="font-semibold" style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type CropTransform = { scaleX: number; scaleY: number; tx: number; ty: number };

function InvestmentCard({ name, desc, coupon, tenor, imgSrc, gradient, imgLeft, imgW, imgH, imgRotation, crop }: {
  name: string; desc: string; coupon: string; tenor: string;
  imgSrc: string; gradient: string;
  imgLeft: number; imgW: number; imgH: number;
  imgRotation?: number;
  crop?: CropTransform;
}) {
  const isHighConviction = imgRotation === 180;
  return (
    <div
      className={`relative overflow-hidden rounded-xl flex gap-4 p-3 flex-1
        md:flex-none md:w-full md:h-30 md:gap-6 md:px-8 md:py-3
        lg:flex-1 lg:h-auto lg:gap-4 lg:p-3
        items-center`}
      style={{ backgroundImage: gradient, boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)" }}
    >
      {/* Secure Income / Balanced Growth: image in fixed container on left */}
      {crop && (
        <div className="relative shrink-0 overflow-hidden" style={{ width: 72, height: imgH }}>
          <img
            alt="" className="absolute h-full max-w-none top-0 pointer-events-none"
            style={{
              left: `${(-crop.tx / crop.scaleX * 100).toFixed(1)}%`,
              width: `${(100 / crop.scaleX).toFixed(1)}%`,
            }}
            src={imgSrc}
          />
        </div>
      )}
      {/* High Conviction: invisible spacer — aligns content with other cards' 72px image slot */}
      {isHighConviction && (
        <div className="shrink-0 relative z-10" style={{ width: 72 }} aria-hidden />
      )}
      {/* High Conviction: absolute image behind content */}
      {isHighConviction && (
        <div className="absolute z-0 flex items-center justify-center pointer-events-none"
          style={{ left: imgLeft, top: 0, width: imgW, height: imgH }}
        >
          <div style={{ transform: "rotate(180deg)", flexShrink: 0 }}>
            <img alt="" className="object-cover" style={{ width: imgW, height: imgH }} src={imgSrc} />
          </div>
        </div>
      )}
      {/* Content — mobile/desktop: flex-col; tablet (md): flex-row */}
      <div className={`flex flex-col gap-3 items-start min-w-0 flex-1
        ${isHighConviction ? "relative z-10" : ""}
        md:flex-row md:gap-6 md:items-center
        lg:flex-col lg:gap-3 lg:items-start`}>
        {/* Name + Desc — mobile/desktop: row with button; tablet: col without button */}
        <div className="flex gap-2 items-center shrink-0 w-full
          md:flex-col md:items-start md:gap-0 md:flex-1 md:min-w-0 md:w-auto md:shrink-0
          lg:flex-row lg:gap-2 lg:items-center lg:w-full lg:shrink-0">
          <div className="flex flex-col flex-1 min-w-0 whitespace-nowrap">
            <p className="font-bold truncate" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{name}</p>
            <p className="truncate" style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>{desc}</p>
          </div>
          {/* Mobile + Desktop only button (hidden on tablet) */}
          <Button variant="outline" size="icon-xs" aria-label="ดูรายละเอียด" className="md:hidden lg:flex">
            <ArrowRightIcon size={16} />
          </Button>
        </div>
        {/* Stats — mobile/desktop: full-width below; tablet: flex-1 beside name */}
        <div className="flex gap-4 items-start justify-center shrink-0 w-full
          md:flex-1 md:w-auto md:shrink
          lg:shrink-0 lg:w-full"
          style={{ backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 8, padding: 8 }}
        >
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Coupon</p>
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{coupon}</p>
          </div>
          <div style={{ width: 1, alignSelf: "stretch", backgroundColor: "rgba(0,0,0,0.1)" }} />
          <div className="flex flex-col items-center flex-1 min-w-0 text-center">
            <p style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>Tenor</p>
            <p className="font-bold" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{tenor}</p>
          </div>
        </div>
        {/* Tablet-only button (after stats) */}
        <Button variant="outline" size="icon-xs" aria-label="ดูรายละเอียด" className="hidden md:flex lg:hidden shrink-0">
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
}

// ─── Investment Solution gradient backgrounds ────────────────────────────────
const GRAD_SECURE = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23f6f7fb'/><stop offset='1' stop-color='%23c5dbe8'/></radialGradient></defs></svg>\")";
const GRAD_BALANCED = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23ffedfc'/><stop offset='1' stop-color='%23f8d0d8'/></radialGradient></defs></svg>\")";
const GRAD_HIGH_CV = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23e5e3fe'/><stop offset='1' stop-color='%23d5beff'/></radialGradient></defs></svg>\")";

// ─── Main Component ───────────────────────────────────────────────────────────

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "";
    }
  }, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}

export function ProductCatalogTab() {
  const [activeProductTab, setActiveProductTab] = useState("structured");
  const [globalOrThai, setGlobalOrThai] = useState<"Global" | "Thai">("Global");
  const [showAlert, setShowAlert] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const topIdeaDrag = useDragScroll();

  return (
    // Root: full-bleed — negative margin + matching width expansion
    <div className="flex flex-col w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6" style={{ backgroundColor: "white" }}>

      {/* ── Mobile: gray rect + abs search + gray sticky tab bar (Figma pixel-perfect) ── */}
      <div className="lg:hidden">
        {/* Gray background rect h=127px — search is absolutely positioned inside */}
        <div className="relative shrink-0 w-full" style={{ backgroundColor: "#f3f4f6", height: 96 }}>
          <div className="absolute left-4 right-4" style={{ top: 24 }}>
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Discover your next investment"
              className="w-full"
            />
          </div>
        </div>
        {/* Tab bar — sticky top-0, text-only + scrollable
            --background overridden to transparent so Tab's bg-background shows gray parent */}
        <div
          className="sticky top-0 z-10 overflow-x-auto"
          style={{ backgroundColor: "#f3f4f6", scrollbarWidth: "none", ["--bg-default-primary" as string]: "transparent" }}
        >
          <TabGroup
            items={PRODUCT_TABS_MOBILE}
            activeId={activeProductTab}
            onChange={setActiveProductTab}
            size="md"
          />
        </div>
      </div>

      {/* ── Desktop: gradient search section + tab bar with icons ────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center shrink-0 w-full bg-gradient-to-t from-[#f7f7f7] to-white px-6"
        style={{ height: 120, paddingTop: 32, paddingBottom: 24 }}
      >
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Discover your next investment"
          className="w-full max-w-[792px]"
        />
      </div>
      <div className="hidden lg:block px-4 lg:px-6">
        <TabGroup
          items={PRODUCT_TABS}
          activeId={activeProductTab}
          onChange={setActiveProductTab}
          size="md"
        />
      </div>

      {/* ── Section container — no padding, each section owns its own padding ─── */}
      <div className="flex flex-col gap-6 items-center w-full" style={{ paddingTop: 24 }}>

        {/* Toast — bg-info-light, full-bleed mobile / max-w-[704px] desktop */}
        {showAlert && (
          <div className="px-4 lg:px-6 w-full flex justify-center">
            {/* Figma: flex items-center gap-2 — single flex row, text wraps naturally inside flex-1 */}
            <div
              className="flex gap-2 items-center overflow-hidden shrink-0 w-full"
              style={{
                backgroundColor: "#eff6ff", borderRadius: 8, padding: 12,
                boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.1),0px 1px 3px 1px rgba(0,0,0,0.05)",
                maxWidth: 704,
              }}
            >
              {/* Content (flex-1): icon + text forced to 2 lines with <br> — matches Figma exactly */}
              <div className="flex gap-2 items-center flex-1 min-w-0 opacity-80">
                <InfoIcon size={24} weight="fill" color="#2b7fff" className="shrink-0" />
                <p className="flex-1 min-w-0 max-w-40 md:max-w-none [word-break:break-word]" style={{ color: "#2b7fff", fontSize: 14, lineHeight: "20px" }}>
                  <span className="md:hidden">สำหรับนักลงทุนรายใหญ่/ รายใหญ่พิเศษ</span>
                  <span className="hidden md:inline">ผู้ลงทุนในสินทรัพย์นี้ต้องมีคุณสมบัติเป็นนักลงทุนรายใหญ่</span>
                </p>
              </div>
              {/* Content-R (shrink-0): action link + X */}
              <div className="flex gap-3 items-center shrink-0">
                <p
                  className="underline whitespace-nowrap cursor-pointer"
                  style={{ color: "#0a6ee7", fontSize: 14, lineHeight: "20px" }}
                  onClick={() => { }}
                >
                  อัปเดตสถานะ
                </p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="relative shrink-0 cursor-pointer"
                  style={{ width: 18, height: 18, background: "none", border: "none", padding: 0 }}
                  aria-label="ปิด"
                >
                  <XIcon size={18} color="#2b7fff" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Recommend 1 — bg-white (Switch + Waiting) ─────────────────────── */}
        <div className="flex flex-col gap-4 items-center shrink-0 w-full px-4 lg:px-6" style={{ backgroundColor: "white" }}>
          {/* Global/Thai + รายการคำสั่ง */}
          <div className="flex gap-4 items-center shrink-0 w-full">
            <div className="flex gap-1 items-center justify-center overflow-hidden flex-1"
              style={{ backgroundColor: "#f9fafb", borderRadius: 40, padding: 6 }}
            >
              {(["Global", "Thai"] as const).map((option) => {
                const sel = globalOrThai === option;
                return (
                  <button key={option} onClick={() => setGlobalOrThai(option)}
                    className="flex items-center justify-center overflow-hidden cursor-pointer transition-all flex-1"
                    style={{
                      borderRadius: 40, padding: 8,
                      backgroundColor: sel ? "white" : "transparent", border: "none",
                      boxShadow: sel ? "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    <p style={{ fontSize: 14, lineHeight: "20px", fontWeight: sel ? 700 : 400, color: sel ? "#101828" : "#6a7282", whiteSpace: "nowrap" }}>
                      {option}
                    </p>
                  </button>
                );
              })}
            </div>
            <Button variant="outline-black" size="icon-xl" aria-label="รายการคำสั่ง" className="rounded-full shrink-0 md:hidden">
              <ClockCounterClockwiseIcon size={20} />
            </Button>
            <Button variant="outline-black" size="xl" leftIcon={<ClockCounterClockwiseIcon size={20} className="-scale-x-100" />} className="rounded-full shrink-0 hidden md:flex">
              รายการคำสั่ง
            </Button>
          </div>
          {/* Waiting banner */}
          <div className="flex gap-2 items-center relative shrink-0 w-full"
            style={{ backgroundColor: "#fefce8", border: "1px solid #fff085", borderRadius: 8, padding: 12 }}
          >
            <div className="flex items-center p-1 shrink-0" style={{ backgroundColor: "#fef9c2", borderRadius: 4 }}>
              <HourglassHighIcon size={20} weight="fill" color="#ca8a04" />
            </div>
            <div className="flex flex-col gap-0.5 items-start justify-center flex-1 min-w-0">
              <p className="font-bold" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>รอดำเนินการ 2 รายการ</p>
              <p style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>จำนวนเงิน 300,000 USD</p>
            </div>
            <Button variant="outline-black" size="lg" className="shrink-0">ดูรายการ</Button>
          </div>
        </div>

        {/* ── Recommend 2 — bg-white (Top Idea) ────────────────────────────── */}
        <div className="flex flex-col gap-4 items-start shrink-0 w-full" style={{ backgroundColor: "white", paddingTop: 16, paddingBottom: 16 }}>
          {/* Header — with side padding */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Top idea
            </p>
            <Button variant="plain" size="sm" rightIcon={<ArrowRightIcon size={18} />} className="shrink-0">ทั้งหมด</Button>
          </div>
          {/* Scrollable cards — bleeds to screen edges, drag-to-scroll on desktop */}
          <div
            ref={topIdeaDrag.ref}
            className="overflow-x-auto w-full pb-3 hide-scrollbar"
            style={{ scrollbarWidth: "none", cursor: "grab" }}
            onMouseDown={topIdeaDrag.onMouseDown}
            onMouseMove={topIdeaDrag.onMouseMove}
            onMouseUp={topIdeaDrag.onMouseUp}
            onMouseLeave={topIdeaDrag.onMouseLeave}
          >
            <div className="flex gap-3.5 min-w-max px-4 lg:px-6">
              {TOP_IDEAS.map((idea, i) => <TopIdeaCard key={i} {...idea} />)}
            </div>
          </div>
        </div>

        {/* ── Investment Solution — no explicit bg + imgRecommend overlay ─────── */}
        <div className="flex flex-col gap-4 items-start relative shrink-0 w-full px-4 md:px-8 lg:px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={A.recommendBg} />
          <p className="font-bold relative shrink-0 overflow-hidden text-ellipsis w-full whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
            Investment Solution
          </p>
          <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
            <div className="flex flex-col lg:flex-row gap-4 shrink-0 w-full">
              <InvestmentCard name="Secure Income" desc="ความเสี่ยงต่ำ ลงทุนอย่างมั่นคง" coupon="12%-15%" tenor="12 เดือน" imgSrc={A.imgSecureIncome} gradient={GRAD_SECURE} imgLeft={12} imgW={72} imgH={92} crop={{ scaleX: 0.4390, scaleY: 1.0, tx: 0, ty: 0 }} />
              <InvestmentCard name="Balanced Growth" desc="ความเสี่ยงปานกลาง ผลตอบแทนคุ้มค่า" coupon="25%-30%" tenor="9 เดือน" imgSrc={A.imgBalancedGrowth} gradient={GRAD_BALANCED} imgLeft={12} imgW={72} imgH={103} crop={{ scaleX: 0.7006, scaleY: 1.0, tx: 0.1464, ty: 0 }} />
              <InvestmentCard name="High Conviction" desc="ความเสี่ยงสูง ผลตอบแทนสูงสุด" coupon="35%-40%" tenor="6 เดือน" imgSrc={A.imgHighConvBg} gradient={GRAD_HIGH_CV} imgLeft={-67} imgW={198} imgH={132} imgRotation={180} />
            </div>
            {/* Customize Underlying */}
            <div className="flex gap-2 items-center relative shrink-0 w-full"
              style={{ backgroundColor: "white", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 12, paddingLeft: 32, paddingRight: 32, paddingTop: 16, paddingBottom: 16 }}
            >
              <SparkleIcon size={24} weight="fill" className="shrink-0 text-primary-action" />
              <div className="flex flex-col gap-0.5 items-start flex-1 min-w-0 whitespace-nowrap">
                <p className="font-bold overflow-hidden text-ellipsis w-full" style={{ color: "#4a5565", fontSize: 16, lineHeight: "24px" }}>Customize Underlying</p>
                <p className="overflow-hidden text-ellipsis w-full" style={{ color: "#6a7282", fontSize: 14, lineHeight: "20px" }}>ออกแบบสินทรัพย์ด้วยตนเอง</p>
              </div>
              <Button variant="outline-black" size="lg" leftIcon={<PhoneIcon size={20} />} className="shrink-0">ติดต่อ</Button>
            </div>
          </div>
        </div>

        {/* ── Main Container — bg-white (Top Pick) ─────────────────────────── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full px-4 md:px-8 lg:px-6" style={{ backgroundColor: "white", paddingTop: 24, paddingBottom: 24 }}>
          <div className="flex gap-1 items-center shrink-0 w-full">
            <FireIcon size={24} weight="fill" color="#f97316" className="shrink-0 md:hidden lg:block" />
            <FireIcon size={20} weight="fill" color="#f97316" className="shrink-0 hidden md:block lg:hidden" />
            <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap text-xl leading-[30px] md:text-lg md:leading-6 lg:text-xl lg:leading-[30px]" style={{ color: "#101828" }}>
              Top pick
            </p>
          </div>
          <div className="grid grid-cols-1 md:flex md:flex-col lg:grid lg:grid-cols-3 gap-4 shrink-0 w-full">
            {TOP_PICKS.map((p, i) => <ProductCard key={i} {...p} />)}
          </div>
        </div>

        {/* ── Main Container — bg-[#f9fafb] (Structured Product) full-bleed ─── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full" style={{ backgroundColor: "#f9fafb", paddingTop: 24, paddingBottom: 24 }}>
          {/* Header */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Structured Product
            </p>
            <Button variant="outline-black" size="icon-lg" aria-label="ตัวกรอง" className="shrink-0 md:hidden">
              <FunnelSimpleIcon size={18} />
            </Button>
            <Button variant="outline-black" size="md" leftIcon={<FunnelSimpleIcon size={18} />} className="shrink-0 hidden md:flex">ตัวกรอง</Button>
          </div>
          {/* 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 w-full px-4 lg:px-6">
            {STRUCTURED_PRODUCTS.map((p, i) => <ProductCard key={i} {...p} />)}
          </div>
          {/* ดูทั้งหมด */}
          <Button variant="plain" size="sm" className="shrink-0">ดูทั้งหมด</Button>
        </div>

      </div>
    </div>
  );
}
