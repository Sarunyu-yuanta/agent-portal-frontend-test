"use client";

import { useEffect } from "react";
import { Button } from "@sarunyu/system-one";
import {
  ArrowLeftIcon,
  LightningIcon,
  WallIcon,
  FactoryIcon,
  BasketIcon,
  ShirtFoldedIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import { StructuredProductCard } from "./StructuredProductCard";
import { TOP_IDEA_DETAIL_PRODUCTS, type StructuredProduct } from "./structured-product-data";
import {
  TOP_IDEA_THEMES,
  TOP_IDEA_SUBTITLES,
  TOP_IDEA_MAX_COUPON,
  TOP_IDEA_UPDATED_AT,
  type TopIdeaSector,
} from "./top-idea-data";

const ASSETS = {
  detailWave: "/top-idea-detail-wave.svg",
  detailEnergy: "/top-idea-detail-energy.png",
  heroLightning: "/top-idea-hero-lightning.svg",
  wall1: "/top-idea-wall-img.svg",
  effect: "/top-idea-effect.png",
  graphic: "/top-idea-graphic.png",
};

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

const BANNER_SHADOW =
  "0px 4px 6px -1px rgba(0,0,0,0.1),0px 2px 4px -2px rgba(0,0,0,0.1)";

function SectorHeroIcon({ sector }: { sector: TopIdeaSector }) {
  if (sector === "Energy") {
    return (
      <div className="relative shrink-0 size-10">
        <img alt="" className="block max-w-none size-full" src={ASSETS.heroLightning} />
      </div>
    );
  }

  const iconProps = { size: 20 as const, color: "white", weight: "fill" as const };
  let icon;
  switch (sector) {
    case "Material":
      icon = <WallIcon {...iconProps} />;
      break;
    case "Industrials":
      icon = <FactoryIcon {...iconProps} />;
      break;
    case "Consumer Discretionary":
      icon = <BasketIcon {...iconProps} />;
      break;
    case "Consumer Staples":
      icon = <ShirtFoldedIcon {...iconProps} />;
      break;
    default:
      icon = <LightningIcon {...iconProps} />;
  }
  return (
    <div className="flex items-center justify-center size-10 rounded-full bg-[#101828] shrink-0">
      {icon}
    </div>
  );
}

function EnergyHeroGlow() {
  return (
    <div
      className="absolute pointer-events-none -translate-x-1/2 h-[118px] w-[115.839px]
        max-md:left-[58%] max-md:bottom-[40px]
        md:left-[calc(50%-329.08px)] md:bottom-[75px]"
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          alt=""
          className="absolute h-full max-w-none top-0 w-[100.62%]"
          style={{ left: "-0.31%", mixBlendMode: "screen" }}
          src={ASSETS.detailEnergy}
        />
      </div>
    </div>
  );
}

function DetailHeroWave() {
  return (
    <div
      className="absolute flex h-[93.968px] items-center justify-center pointer-events-none"
      style={{ left: -5.63, top: -14.22, width: 552.711 }}
      aria-hidden
    >
      <div className="flex-none rotate-[178.69deg]">
        <div className="relative h-[81.39px] w-[550.994px]">
          <div className="absolute inset-[-24.57%_-4.36%_-34.4%_-4.36%]">
            <img alt="" className="block max-w-none size-full" src={ASSETS.detailWave} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopIdeaHeroBanner({ sector }: { sector: TopIdeaSector }) {
  const theme = TOP_IDEA_THEMES[sector];
  const subtitle = TOP_IDEA_SUBTITLES[sector];

  return (
    <div
      className="relative flex w-full items-center -mb-6 min-h-[155px] pt-8 pb-14"
      style={{ backgroundColor: "#f3f4f6", boxShadow: BANNER_SHADOW }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <DetailHeroWave />
        {sector === "Energy" && <EnergyHeroGlow />}
        {sector === "Material" && (
          <div
            className="absolute pointer-events-none max-md:right-4 max-md:top-4 md:right-20 md:top-5"
            style={{ width: 180, height: 66 }}
          >
            <img alt="" className="absolute inset-0 w-full h-full" src={ASSETS.wall1} />
          </div>
        )}
        {sector === "Industrials" &&
          IND_CLOUDS.map((c, i) => (
            <div
              key={i}
              className="absolute pointer-events-none max-md:hidden"
              style={{
                right: 40 + (171 - c.l) * 0.5,
                top: 10 + c.t * 0.5,
                width: c.w * 1.5,
                height: c.h * 1.5,
              }}
            >
              <img alt="" className="absolute inset-0 max-w-none w-full h-full" src={c.src} />
            </div>
          ))}
        {sector === "Consumer Discretionary" && (
          <div
            className="absolute pointer-events-none overflow-hidden max-md:right-0 max-md:top-2 md:right-16 md:top-2"
            style={{ width: 140, height: 84 }}
          >
            <img
              alt=""
              className="absolute max-w-none"
              style={{ height: "167.51%", left: "-22.85%", top: "-14.39%", width: "167.05%", mixBlendMode: "screen" }}
              src={ASSETS.effect}
            />
          </div>
        )}
        {sector === "Consumer Staples" && (
          <div
            className="absolute pointer-events-none flex items-center justify-center max-md:right-4 md:right-20"
            style={{ top: 16, width: 80, height: 54, mixBlendMode: "luminosity" }}
          >
            <div style={{ transform: "rotate(-15deg)", flexShrink: 0 }}>
              <img alt="" className="max-w-none opacity-80" style={{ width: 75, height: 37 }} src={ASSETS.graphic} />
            </div>
          </div>
        )}
      </div>

      {/* Content — Figma flex row */}
      <div className="relative z-[1] flex flex-1 gap-4 items-center w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
        <div className="flex flex-1 gap-4 items-center min-w-0">
          <SectorHeroIcon sector={sector} />
          <div className="flex flex-1 flex-col gap-2 items-start justify-center min-w-[141px]">
            <p className="font-bold text-lg leading-6 text-[#101828] truncate w-full">{theme}</p>
            <p className="text-sm leading-5 text-[#6a7282] truncate w-full">{subtitle}</p>
          </div>
        </div>
        <div className="relative flex flex-col gap-2 items-end justify-center shrink-0">
          <div className="flex items-center gap-1 px-1 rounded-md bg-white">
            <span className="text-sm leading-5 text-[#6a7282]">up to</span>
            <span className="font-bold text-xl leading-[30px] text-[#008236]">{TOP_IDEA_MAX_COUPON}</span>
          </div>
          <span className="text-sm leading-5 text-[#6a7282]">Coupon</span>
        </div>
      </div>
    </div>
  );
}

export function TopIdeaDetail({
  sector,
  onBack,
  onProductSelect,
}: {
  sector: TopIdeaSector;
  onBack: () => void;
  onProductSelect: (product: StructuredProduct) => void;
}) {
  const theme = TOP_IDEA_THEMES[sector];
  const products = TOP_IDEA_DETAIL_PRODUCTS;

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [sector]);

  return (
    <div className="flex flex-col gap-2 w-full bg-white pt-6">
      <div className="flex gap-2 items-center h-[46px] py-2 w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
        <Button variant="plain" size="icon-sm" onClick={onBack} aria-label="กลับ" className="shrink-0">
          <ArrowLeftIcon size={20} />
        </Button>
        <h1 className="flex-1 min-w-0 text-lg font-bold leading-[26px] text-[#101828] truncate">{theme}</h1>
      </div>

      <TopIdeaHeroBanner sector={sector} />

      <div className="relative z-10 w-full bg-white rounded-t-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-2 items-center w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="flex gap-3 items-center w-full">
            <p className="flex-1 min-w-0 text-base leading-5 text-[#4a5565]">{products.length} รายการ</p>
            <Button
              variant="outline-black"
              size="sm"
              leftIcon={<FunnelSimpleIcon size={18} />}
              className="shrink-0"
            >
              ตัวกรอง
            </Button>
          </div>
          <p className="w-full text-xs leading-4 text-[#6a7282]">อัปเดตล่าสุด {TOP_IDEA_UPDATED_AT}</p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full">
            {products.map((product) => (
              <StructuredProductCard
                key={product.id}
                {...product}
                variant="grid"
                onClick={() => onProductSelect(product)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
