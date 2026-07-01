"use client";

import { useState, useRef, useCallback } from "react";
import { TabGroup } from "@sarunyu/system-one";
import {
  ShapesIcon, CertificateIcon, GlobeHemisphereWestIcon,
  LightningIcon, WallIcon, FactoryIcon, BasketIcon, ShirtFoldedIcon,
} from "@phosphor-icons/react";

// ─── Figma Asset URLs (refreshed) ────────────────────────────────────────────
const A = {
  // UI icons
  magnifyingGlass: "https://www.figma.com/api/mcp/asset/2f89682b-fdc1-4045-9041-572aaabfc626",
  infoFill:        "https://www.figma.com/api/mcp/asset/a298a2c1-417e-404e-947c-2d573d56a438",
  closeX:          "https://www.figma.com/api/mcp/asset/d41bed6e-2d74-4bd9-8454-5d6117e31004",
  hourglassHigh:   "https://www.figma.com/api/mcp/asset/57ccec5b-3a0a-4dab-a4d9-90d077aa7e1f",
  arrowRight:      "https://www.figma.com/api/mcp/asset/ba1e0039-95d0-4ce2-ba86-26e3a1c5d612",
  arrowRightSm:    "https://www.figma.com/api/mcp/asset/bd7d1b7f-8d11-4c2e-b017-c2295410cd1e",
  orderListIcon:   "https://www.figma.com/api/mcp/asset/67d60e44-f9e4-4782-9dc7-2d97ae6f4992",
  filterIcon:      "https://www.figma.com/api/mcp/asset/75721d74-1d76-4a21-b3d4-b44777a09bea",
  sparkle:         "https://www.figma.com/api/mcp/asset/3ab94ca8-803f-4683-a15e-ff0de3868bec",
  phoneIcon:       "https://www.figma.com/api/mcp/asset/242c59cf-4099-444d-866e-03b11b663717",
  fire:            "https://www.figma.com/api/mcp/asset/7781fa1c-d4b1-4f18-9bb1-c7944ceef4e7",
  fireSmall:       "https://www.figma.com/api/mcp/asset/c5622f0d-2de9-4890-b0ce-442d75f90b13",
  shieldCheck:     "https://www.figma.com/api/mcp/asset/c2c3aab0-bfd1-4eea-ad52-036428770223",
  lineDivider:     "https://www.figma.com/api/mcp/asset/2986753b-4895-4381-8a8d-f3a50d3bf169",
  // Top idea sector assets (local files — stable, never expire)
  vector:          "/top-idea-wave.svg",
  wall1:           "/top-idea-wall-img.svg",
  energy1:         "/top-idea-energy.png",
  industrials1:    "/top-idea-industrials.png",
  effect:          "/top-idea-effect.png",
  graphic:         "/top-idea-graphic.png",
  // Investment Solution (local files — stable, never expire)
  imgSecureIncome:    "/invest-secure-income.png",
  imgBalancedGrowth:  "/invest-balanced-growth.png",
  imgHighConvBg:      "/invest-high-conviction.png",
  recommendBg:        "/investment-solution-bg.jpg",
  // Stock logos
  logoKO:     "https://www.figma.com/api/mcp/asset/35aeb96b-04ba-45b4-ab74-c4efce9975bc",
  logoWMT:    "https://www.figma.com/api/mcp/asset/f2d38797-fa49-4638-80aa-b2fd40baa5b3",
  logoAAPL:   "https://www.figma.com/api/mcp/asset/3e3f247c-9e5f-4d73-889b-8e2ac39c6775",
  logoAMZN:   "https://www.figma.com/api/mcp/asset/a03ed961-2640-4be3-a716-a7f8c88bab32",
  logoNFLX:   "https://www.figma.com/api/mcp/asset/96c3fbf3-e9b9-456c-b58e-5e8de310848b",
  logoSAWAD:  "https://www.figma.com/api/mcp/asset/bfc79ad4-d98a-43be-8f21-7c985bdf5f50",
  logoPTT:    "https://www.figma.com/api/mcp/asset/66f9ced5-92fa-4ac4-92b8-0987267234ed",
  logoNasdaq: "https://www.figma.com/api/mcp/asset/a708082e-9b94-471a-8131-97c46b0e5141",
  logoNVDA:   "https://www.figma.com/api/mcp/asset/4c98c144-ca5e-4810-b5de-d052b7d23f15",
  logoAXP:    "https://www.figma.com/api/mcp/asset/af0aeaf6-937f-4416-81ad-d11c3d31f1f9",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOP_IDEAS = [
  { sector: "Energy",                 icon: <LightningIcon size={12} color="#525252" />,   sectorImg: A.energy1  },
  { sector: "Material",               icon: <WallIcon      size={12} color="#525252" />,   sectorImg: A.wall1    },
  { sector: "Industrials",            icon: <FactoryIcon   size={12} color="#525252" />,   sectorImg: A.industrials1 },
  { sector: "Consumer Discretionary", icon: <BasketIcon    size={12} color="#525252" />,   sectorImg: A.effect   },
  { sector: "Consumer Staples",       icon: <ShirtFoldedIcon size={12} color="#525252" />, sectorImg: A.graphic  },
  { sector: "Material",               icon: <WallIcon      size={12} color="#525252" />,   sectorImg: A.wall1    },
  { sector: "Energy",                 icon: <LightningIcon size={12} color="#525252" />,   sectorImg: A.energy1  },
  { sector: "Consumer Discretionary", icon: <BasketIcon    size={12} color="#525252" />,   sectorImg: A.effect   },
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
  { underlying: "KO - WMT",          coupon: "28.33%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม", "รับประกันเงินต้น"], logos: [A.logoKO, A.logoWMT] },
  { underlying: "AAPL - AMZN - NFLX", coupon: "30.00%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoAAPL, A.logoAMZN, A.logoNFLX] },
  { underlying: "SAWAD - PTT",        coupon: "29.87%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoSAWAD, A.logoPTT] },
];

const STRUCTURED_PRODUCTS: StockProduct[] = [
  { underlying: "KO - WMT",           coupon: "14.22%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["รับประกันเงินต้น"], logos: [A.logoKO, A.logoWMT] },
  { underlying: "AAPL - AMZN - NFLX", coupon: "12.56%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม"], logos: [A.logoAAPL, A.logoAMZN, A.logoNFLX] },
  { underlying: "SAWAD - PTT",         coupon: "13.98%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["ใกล้เต็ม", "รับประกันเงินต้น"], logos: [A.logoSAWAD, A.logoPTT] },
  { underlying: "Nasdaq - AMZN - NFLX",coupon: "11.76%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: ["รับประกันเงินต้น"], logos: [A.logoNasdaq, A.logoAMZN, A.logoNFLX] },
  { underlying: "NVDA - AMZN - AXP",   coupon: "10.45%", tenor: "6 เดือน", ko: "100.00%", strike: "80.00%", ki: "60.00%", tags: [], logos: [A.logoNVDA, A.logoAMZN, A.logoAXP] },
];

const PRODUCT_TABS = [
  { id: "structured",  title: "Structured Product", icon: <ShapesIcon size={18} /> },
  { id: "fixed-income",title: "Fixed Income",        icon: <CertificateIcon size={18} /> },
  { id: "global-bond", title: "Global Bond",         icon: <GlobeHemisphereWestIcon size={18} /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopIdeaCard({ sector, icon, sectorImg }: typeof TOP_IDEAS[0]) {
  const theme = TOP_IDEA_THEMES[sector] ?? "";
  return (
    <div
      className="shrink-0 relative overflow-hidden rounded-[8px]"
      style={{
        width: 200, height: 98,
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
      {sector === "Industrials" && sectorImg && (
        <div className="absolute pointer-events-none"
          style={{ left: 107.22, top: -6.57, width: 68.947, height: 28.161, mixBlendMode: "screen" }}>
          <img alt="" className="absolute inset-0 w-full h-full" src={sectorImg} />
        </div>
      )}
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
              <img alt="" className="absolute inset-0 w-full h-full"
                style={{ objectFit: "contain", objectPosition: "bottom", opacity: 0.8 }}
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
          left: 2, top: 20, width: 196, height: 76,
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
  return (
    <div
      className="flex flex-col gap-4 items-center overflow-hidden p-4 relative rounded-[12px] w-full"
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 items-start shrink-0 w-full">
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
                <div className="relative shrink-0" style={{ width: 14, height: 14 }}>
                  <img alt="" className="absolute inset-0 w-full h-full" src={A.fireSmall} />
                </div>
                <p className="whitespace-nowrap" style={{ color: "#101828", fontSize: 9, lineHeight: "14px" }}>ใกล้เต็ม</p>
              </div>
            )}
            {tags.includes("รับประกันเงินต้น") && (
              <div className="flex gap-0.5 items-center overflow-hidden px-1 py-0.5 rounded shrink-0" style={{ backgroundColor: "#eff6ff" }}>
                <div className="relative shrink-0" style={{ width: 14, height: 14 }}>
                  <img alt="" className="absolute inset-0 w-full h-full" src={A.shieldCheck} />
                </div>
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
      {/* Stats */}
      <div className="flex items-start justify-center shrink-0 text-center w-full"
        style={{ backgroundColor: "#f9fafb", borderRadius: 8, paddingTop: 6, paddingBottom: 6 }}
      >
        {[{ label: "Tenor", value: tenor }, { label: "KO", value: ko }, { label: "Strike", value: strike }, { label: "KI", value: ki }]
          .map((s, i) => (
            <div key={s.label} className="flex flex-col gap-0.5 items-center flex-1 min-w-0"
              style={i < 3 ? { borderRight: "1px solid rgba(0,0,0,0.1)" } : {}}
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

function InvestmentCard({ name, desc, coupon, tenor, imgSrc, gradient, imgLeft, imgTop, imgW, imgH, imgRotation, contentLeft, crop }: {
  name: string; desc: string; coupon: string; tenor: string;
  imgSrc: string; gradient: string;
  imgLeft: number; imgTop: number; imgW: number; imgH: number;
  imgRotation?: number; contentLeft: number;
  crop?: CropTransform;
}) {
  return (
    <div className="relative overflow-hidden flex-1 min-w-0 rounded-[12px]"
      style={{ backgroundImage: gradient, boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)", height: 132 }}
    >
      {/* Image — pixel-perfect position from Figma */}
      {crop ? (
        /* CROP mode: use background-image to preserve Figma's exact crop transform */
        <div className="absolute pointer-events-none" style={{
          left: imgLeft, top: imgTop, width: imgW, height: imgH,
          backgroundImage: `url(${imgSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${(100 / crop.scaleX).toFixed(2)}% ${(100 / crop.scaleY).toFixed(2)}%`,
          backgroundPosition: `${(-(crop.tx * imgW / crop.scaleX)).toFixed(2)}px ${(-(crop.ty * imgH / crop.scaleY)).toFixed(2)}px`,
        }} />
      ) : (
        /* FILL mode: absolute img with optional rotation */
        <img alt="" className="absolute pointer-events-none"
          style={{ left: imgLeft, top: imgTop, width: imgW, height: imgH,
            objectFit: "cover",
            transform: imgRotation ? `rotate(${imgRotation}deg)` : undefined,
            transformOrigin: "center center" }}
          src={imgSrc}
        />
      )}
      {/* Content — absolutely positioned right portion */}
      <div className="absolute flex flex-col items-start justify-between"
        style={{ left: contentLeft, top: 12, right: 12, height: 108 }}
      >
        <div className="flex gap-2 items-center shrink-0 w-full">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-bold truncate" style={{ color: "#101828", fontSize: 16, lineHeight: "24px" }}>{name}</p>
            <p className="truncate" style={{ color: "#6a7282", fontSize: 12, lineHeight: "16px" }}>{desc}</p>
          </div>
          <button className="flex items-center justify-center cursor-pointer shrink-0"
            style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4, width: 26, height: 26 }}
          >
            <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
              <img alt="" className="absolute inset-0 w-full h-full" src={A.arrowRightSm} />
            </div>
          </button>
        </div>
        <div className="flex gap-4 items-center justify-center shrink-0 w-full"
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
      </div>
    </div>
  );
}

// ─── Investment Solution gradient backgrounds ────────────────────────────────
const GRAD_SECURE   = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23f6f7fb'/><stop offset='1' stop-color='%23c5dbe8'/></radialGradient></defs></svg>\")";
const GRAD_BALANCED = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23ffedfc'/><stop offset='1' stop-color='%23f8d0d8'/></radialGradient></defs></svg>\")";
const GRAD_HIGH_CV  = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 389 132' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%25' height='100%25' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(30.4 6.2 -6.6 47.4 66.3 69.8)'><stop stop-color='%23e5e3fe'/><stop offset='1' stop-color='%23d5beff'/></radialGradient></defs></svg>\")";

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

      {/* ── Search section — bg-gradient-to-t from-[#f7f7f7] to-white ────────── */}
      <div
        className="flex flex-col items-center justify-center shrink-0 w-full bg-gradient-to-t from-[#f7f7f7] to-white px-4 lg:px-6"
        style={{ height: 120, paddingTop: 32, paddingBottom: 24 }}
      >
        <div
          className="flex gap-2 items-center w-full"
          style={{
            backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
            height: 54, maxWidth: 792, paddingLeft: 16, paddingRight: 16,
          }}
        >
          <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
            <img alt="" className="absolute inset-0 w-full h-full" src={A.magnifyingGlass} />
          </div>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Discover your next investment"
            className="flex-1 outline-none bg-transparent"
            style={{ color: "#99a1af", fontSize: 16, lineHeight: "24px" }}
          />
        </div>
      </div>

      {/* ── Tab bar — each tab has bg-white from the library ─────────────────── */}
      <div className="px-4 lg:px-6">
        <TabGroup
          items={PRODUCT_TABS}
          activeId={activeProductTab}
          onChange={setActiveProductTab}
          size="md"
        />
      </div>

      {/* ── Section container — no padding, each section owns its own padding ─── */}
      <div className="flex flex-col gap-6 items-center w-full" style={{ paddingTop: 24 }}>

        {/* Toast — bg-[#eff6ff], centered max-w-704px */}
        {showAlert && (
          <div className="px-4 lg:px-6 w-full flex justify-center">
          <div
            className="flex gap-2 items-center shrink-0 w-full"
            style={{
              backgroundColor: "#eff6ff", borderRadius: 8, padding: 12,
              boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.1),0px 1px 3px 1px rgba(0,0,0,0.05)",
              maxWidth: 704,
            }}
          >
            <div className="flex gap-2 items-center flex-1 min-w-0 opacity-80">
              <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.infoFill} />
              </div>
              <p className="whitespace-nowrap" style={{ color: "#2b7fff", fontSize: 14, lineHeight: "20px" }}>
                ผู้ลงทุนในสินทรัพย์นี้ต้องมีคุณสมบัติเป็นนักลงทุนรายใหญ่
              </p>
            </div>
            <div className="flex gap-3 items-center shrink-0">
              <p className="underline whitespace-nowrap cursor-pointer" style={{ color: "#0a6ee7", fontSize: 14, lineHeight: "20px" }}>
                อัปเดตสถานะ
              </p>
              <button onClick={() => setShowAlert(false)} className="relative shrink-0 cursor-pointer"
                style={{ width: 18, height: 18, background: "none", border: "none", padding: 0 }}
              >
                <img alt="" className="absolute inset-0 w-full h-full" src={A.closeX} />
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
            <button className="flex gap-1 items-center justify-center cursor-pointer shrink-0"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, paddingLeft: 12, paddingRight: 16, paddingTop: 10, paddingBottom: 10 }}
            >
              <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.orderListIcon} />
              </div>
              <p className="font-bold whitespace-nowrap" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>รายการคำสั่ง</p>
            </button>
          </div>
          {/* Waiting banner */}
          <div className="flex gap-2 items-center relative shrink-0 w-full"
            style={{ backgroundColor: "#fefce8", border: "1px solid #fff085", borderRadius: 8, padding: 12 }}
          >
            <div className="flex items-center p-1 shrink-0" style={{ backgroundColor: "#fef9c2", borderRadius: 4 }}>
              <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.hourglassHigh} />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-start justify-center flex-1 min-w-0">
              <p className="font-bold" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>รอดำเนินการ 2 รายการ</p>
              <p style={{ color: "#4a5565", fontSize: 12, lineHeight: "16px" }}>จำนวนเงิน 300,000 USD</p>
            </div>
            <button className="flex items-center justify-center cursor-pointer shrink-0"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6 }}
            >
              <p className="font-bold whitespace-nowrap" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>ดูรายการ</p>
            </button>
          </div>
        </div>

        {/* ── Recommend 2 — bg-white (Top Idea) ────────────────────────────── */}
        <div className="flex flex-col gap-4 items-start shrink-0 w-full" style={{ backgroundColor: "white", paddingTop: 16, paddingBottom: 16 }}>
          {/* Header — with side padding */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Top idea
            </p>
            <button className="flex gap-0.5 items-center cursor-pointer shrink-0" style={{ borderRadius: 6, paddingLeft: 10, paddingRight: 8, paddingTop: 6, paddingBottom: 6, background: "none", border: "none" }}>
              <p className="font-bold whitespace-nowrap" style={{ color: "#0a6ee7", fontSize: 14, lineHeight: "20px" }}>ทั้งหมด</p>
              <div className="relative shrink-0" style={{ width: 18, height: 18 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.arrowRight} />
              </div>
            </button>
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
        <div className="flex flex-col gap-4 items-start relative shrink-0 w-full px-4 lg:px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={A.recommendBg} />
          <p className="font-bold relative shrink-0 overflow-hidden text-ellipsis w-full whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
            Investment Solution
          </p>
          <div className="flex flex-col gap-6 items-start relative shrink-0 w-full">
            <div className="flex gap-4 items-start shrink-0 w-full">
              <InvestmentCard name="Secure Income"   desc="ความเสี่ยงต่ำ ลงทุนอย่างมั่นคง"       coupon="12%-15%" tenor="12 เดือน" imgSrc={A.imgSecureIncome}   gradient={GRAD_SECURE}   imgLeft={12}  imgTop={20} imgW={72}  imgH={92}  contentLeft={100} crop={{ scaleX: 0.4390, scaleY: 1.0, tx: 0,      ty: 0 }} />
              <InvestmentCard name="Balanced Growth" desc="ความเสี่ยงปานกลาง ผลตอบแทนคุ้มค่า"  coupon="25%-30%" tenor="9 เดือน"  imgSrc={A.imgBalancedGrowth} gradient={GRAD_BALANCED} imgLeft={12}  imgTop={15} imgW={72}  imgH={103} contentLeft={100} crop={{ scaleX: 0.7006, scaleY: 1.0, tx: 0.1464, ty: 0 }} />
              <InvestmentCard name="High Conviction"  desc="ความเสี่ยงสูง ผลตอบแทนสูงสุด"       coupon="35%-40%" tenor="6 เดือน"  imgSrc={A.imgHighConvBg}     gradient={GRAD_HIGH_CV}  imgLeft={-67} imgTop={0}  imgW={198} imgH={132} imgRotation={180} contentLeft={146} />
            </div>
            {/* Customize Underlying */}
            <div className="flex gap-2 items-center relative shrink-0 w-full"
              style={{ backgroundColor: "white", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 12, paddingLeft: 32, paddingRight: 32, paddingTop: 16, paddingBottom: 16 }}
            >
              <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.sparkle} />
              </div>
              <div className="flex flex-col gap-0.5 items-start flex-1 min-w-0 whitespace-nowrap">
                <p className="font-bold overflow-hidden text-ellipsis w-full" style={{ color: "#4a5565", fontSize: 16, lineHeight: "24px" }}>Customize Underlying</p>
                <p className="overflow-hidden text-ellipsis w-full" style={{ color: "#6a7282", fontSize: 14, lineHeight: "20px" }}>ออกแบบสินทรัพย์ด้วยตนเอง</p>
              </div>
              <button className="flex gap-1 items-center justify-center cursor-pointer shrink-0"
                style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, paddingLeft: 10, paddingRight: 14, paddingTop: 8, paddingBottom: 8, height: 36 }}
              >
                <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
                  <img alt="" className="absolute inset-0 w-full h-full" src={A.phoneIcon} />
                </div>
                <p className="font-bold whitespace-nowrap" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>ติดต่อ</p>
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Container — bg-white (Top Pick) ─────────────────────────── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full px-4 lg:px-6" style={{ backgroundColor: "white", paddingTop: 24, paddingBottom: 24 }}>
          <div className="flex gap-1.5 items-center shrink-0 w-full">
            <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
              <img alt="" className="absolute inset-0 w-full h-full" src={A.fire} />
            </div>
            <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Top pick
            </p>
          </div>
          <div className="flex gap-4 items-start shrink-0 w-full">
            {TOP_PICKS.map((p, i) => (
              <div key={i} className="flex-1 min-w-0">
                <ProductCard {...p} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Container — bg-[#f9fafb] (Structured Product) full-bleed ─── */}
        <div className="flex flex-col gap-4 items-center relative shrink-0 w-full" style={{ backgroundColor: "#f9fafb", paddingTop: 24, paddingBottom: 24 }}>
          {/* Header */}
          <div className="flex gap-2 items-center shrink-0 w-full px-4 lg:px-6">
            <p className="font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#101828", fontSize: 20, lineHeight: "30px" }}>
              Structured Product
            </p>
            <button className="flex items-center cursor-pointer shrink-0"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, paddingLeft: 8, paddingRight: 10, paddingTop: 6, paddingBottom: 6 }}
            >
              <div className="relative shrink-0" style={{ width: 18, height: 18 }}>
                <img alt="" className="absolute inset-0 w-full h-full" src={A.filterIcon} />
              </div>
              <p className="font-bold whitespace-nowrap" style={{ color: "#101828", fontSize: 14, lineHeight: "20px" }}>ตัวกรอง</p>
            </button>
          </div>
          {/* 3-column grid */}
          <div className="grid grid-cols-3 gap-4 shrink-0 w-full px-4 lg:px-6">
            {STRUCTURED_PRODUCTS.map((p, i) => <ProductCard key={i} {...p} />)}
          </div>
          {/* ดูทั้งหมด */}
          <button className="cursor-pointer shrink-0" style={{ borderRadius: 6, paddingLeft: 10, paddingTop: 6, paddingBottom: 6, background: "none", border: "none" }}>
            <p className="font-bold whitespace-nowrap" style={{ color: "#0a6ee7", fontSize: 14, lineHeight: "20px" }}>ดูทั้งหมด</p>
          </button>
        </div>

      </div>
    </div>
  );
}
