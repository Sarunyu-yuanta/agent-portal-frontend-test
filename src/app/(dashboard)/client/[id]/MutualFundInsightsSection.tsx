"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, PaginationBanner } from "@sarunyu/system-one";
import { MutualFundQuickActionsDesktop } from "./MutualFundQuickActions";
import { MutualFundSeeMoreIcon, MutualFundSymbolTag } from "./MutualFundCard";
import { MF_ASSETS } from "./mutual-fund-assets";
import type { MutualFundInsight } from "./mutual-fund-data";
import { useDragScroll } from "./use-drag-scroll";

function getInsightActiveIndex(container: HTMLElement, count: number): number {
  const cards = container.querySelectorAll<HTMLElement>("[data-insight-card]");
  if (cards.length === 0) return 0;

  const maxScroll = container.scrollWidth - container.clientWidth;
  if (container.scrollLeft >= maxScroll - 1) return count - 1;

  let bestIndex = 0;
  let bestDistance = Infinity;
  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - container.scrollLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function scrollInsightToIndex(container: HTMLElement, index: number) {
  const card = container.querySelectorAll<HTMLElement>("[data-insight-card]")[index];
  if (!card) return;
  container.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
}

function InsightCard({ item }: { item: MutualFundInsight }) {
  return (
    <article
      data-insight-card
      className="relative w-[266.5px] shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white p-3 lg:w-[343px]"
    >
      <h3 className="text-base font-bold leading-6 text-[#0c244a] line-clamp-3">{item.title}</h3>
      <p className="mt-2.5 text-xs leading-4 text-[#0c244a]">{item.date}</p>
      <div className="my-2.5 h-2 w-full">
        <div className="h-px w-full bg-black/10" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs leading-4 text-[#0c244a]">กองทุนแนะนำ</p>
        <div className="flex flex-wrap gap-2">
          {item.recommendedFunds.map((symbol) => (
            <MutualFundSymbolTag key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
      <Image
        src={MF_ASSETS.insightCardChart}
        alt=""
        width={100}
        height={92}
        className="pointer-events-none absolute -right-11 -top-11 size-[100px] opacity-30"
      />
    </article>
  );
}

/** Figma 40118:77268 (desktop) / 40135:224291 (mobile) */
export function MutualFundInsightsSection({ insights }: { insights: MutualFundInsight[] }) {
  const drag = useDragScroll();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = drag.ref.current;
    if (!el) return;
    const update = () => {
      setActiveIndex(getInsightActiveIndex(el, insights.length));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [drag.ref, insights.length]);

  return (
    <section className="relative flex w-full min-w-0 flex-col gap-4">
      <div className="relative flex min-h-[342px] flex-col gap-4 overflow-hidden py-4 lg:gap-8 lg:py-0">
        <Image
          src={MF_ASSETS.insightsSectionBgMobile}
          alt=""
          fill
          className="pointer-events-none object-cover object-top lg:hidden"
          sizes="100vw"
        />
        <Image
          src={MF_ASSETS.insightsSectionBg}
          alt=""
          fill
          className="pointer-events-none hidden object-cover object-left-top lg:block"
          sizes="568px"
        />

        <div className="relative z-10 flex items-center gap-4 px-0 lg:px-0">
          <div className="flex min-w-0 flex-1 flex-col gap-0 lg:gap-1">
            <div className="flex items-center gap-1">
              <Image src={MF_ASSETS.bookOpen} alt="" width={20} height={20} className="size-5 shrink-0" />
              <h2 className="flex-1 text-lg font-bold leading-7 bg-gradient-to-r from-[#73442b] to-[#b58063] bg-clip-text text-transparent">
                <span className="lg:hidden">เจาะลึกโอกาสลงทุน</span>
                <span className="hidden lg:inline">เจาะลึกโอกาสลงทุนเด่น</span>
              </h2>
            </div>
            <p className="text-sm leading-5 bg-gradient-to-r from-[#73442b] to-[#b58063] bg-clip-text text-transparent">
              บทวิเคราะห์จาก Yuanta CIO
            </p>
          </div>
          <Button
            variant="plain"
            size="xl"
            rightIcon={<MutualFundSeeMoreIcon />}
            className="hidden w-fit shrink-0 lg:flex"
          >
            ดูเพิ่มเติม
          </Button>
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:gap-6">
          <div
            ref={drag.ref}
            className="overflow-x-auto hide-scrollbar"
            style={{ scrollbarWidth: "none", cursor: "grab" }}
            onMouseDown={drag.onMouseDown}
            onMouseMove={drag.onMouseMove}
            onMouseUp={drag.onMouseUp}
            onMouseLeave={drag.onMouseLeave}
          >
            <div className="flex w-max gap-2.5">
              {insights.map((item) => (
                <InsightCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <PaginationBanner
            count={insights.length}
            activeIndex={activeIndex}
            className="w-full justify-center"
            onIndexChange={(index) => {
              const el = drag.ref.current;
              if (el) scrollInsightToIndex(el, index);
            }}
          />
        </div>

        <div className="relative z-10 flex w-full justify-center lg:hidden">
          <Button variant="plain" size="xl" rightIcon={<MutualFundSeeMoreIcon />} className="w-fit shrink-0">
            ดูเพิ่มเติม
          </Button>
        </div>
      </div>

      <MutualFundQuickActionsDesktop />
    </section>
  );
}
