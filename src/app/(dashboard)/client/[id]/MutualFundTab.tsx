"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button, Chip, Tag } from "@sarunyu/system-one";
import {
  ArrowRightIcon,
  BankIcon,
  BookOpenTextIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CpuIcon,
  HeartbeatIcon,
  MedalIcon,
  PlantIcon,
  ThumbsUpIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react";
import { MutualFundCard } from "./MutualFundCard";
import {
  MUTUAL_FUND_CATEGORIES,
  type MutualFund,
  type MutualFundCategoryId,
  type MutualFundInsight,
  type MutualFundTheme,
  type MutualFundThemeIcon,
} from "./mutual-fund-data";
import { useMutualFundCatalog } from "@/hooks/use-catalog";
import { useDragScroll } from "./use-drag-scroll";

function SectionDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full shrink-0 ${
            i === active ? "h-1.5 w-8 bg-[#0a6ee7]" : "size-1.5 bg-black/10"
          }`}
        />
      ))}
    </div>
  );
}

function ThemeIcon({ icon }: { icon: MutualFundThemeIcon }) {
  const props = { size: 20, weight: "fill" as const, className: "shrink-0 text-white" };
  switch (icon) {
    case "head-circuit":
      return <TreeStructureIcon {...props} />;
    case "bank":
      return <BankIcon {...props} />;
    case "cpu":
      return <CpuIcon {...props} />;
    case "plant":
      return <PlantIcon {...props} />;
    case "health":
      return <HeartbeatIcon {...props} />;
  }
}

function InsightCarousel({ insights }: { insights: MutualFundInsight[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = 343 + 10;
      setActive(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto w-full hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {insights.map((item) => (
          <article
            key={item.id}
            className="relative shrink-0 snap-start w-[343px] rounded-lg border border-black/10 bg-white p-3 flex flex-col gap-2.5 overflow-hidden"
          >
            <h3 className="text-base font-bold leading-6 text-[#0c244a] line-clamp-3">{item.title}</h3>
            <p className="text-xs leading-4 text-[#0c244a]">{item.date}</p>
            <div className="h-px w-full bg-black/10" />
            <div className="flex flex-col gap-2">
              <p className="text-xs leading-4 text-[#0c244a]">กองทุนแนะนำ</p>
              <div className="flex flex-wrap gap-2">
                {item.recommendedFunds.map((symbol) => (
                  <Tag key={symbol} label={symbol} color="blue" />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <SectionDots count={insights.length} active={active} />
    </div>
  );
}

function QuickActionCard({
  title,
  illustration,
}: {
  title: string;
  illustration: string;
}) {
  return (
    <div className="flex-1 min-w-0 rounded-lg bg-white p-1 shadow-[0_0_1px_rgba(102,102,102,0.16),0_4px_4px_rgba(102,102,102,0.12)]">
      <div className="relative flex flex-col gap-1 rounded bg-gradient-to-b from-[#f3f8fe] to-white p-4 h-[92px] overflow-hidden">
        <p className="text-sm font-bold leading-5 text-[#101828]">{title}</p>
        <ArrowRightIcon size={16} className="text-[#4a5565]" />
        <Image
          src={illustration}
          alt=""
          width={68}
          height={68}
          className="absolute bottom-0 right-3 pointer-events-none object-contain"
        />
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: MutualFundTheme }) {
  return (
    <div className="shrink-0 w-[308px] rounded-lg bg-gradient-to-b from-[#0a6ee7] to-[#f3f4f6] to-[85%] p-1 pb-1">
      <div className="flex items-center gap-1 px-3 py-2">
        <ThemeIcon icon={theme.icon} />
        <span className="flex-1 text-base font-bold leading-6 text-white">{theme.title}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="rounded-lg border border-black/10 bg-white overflow-hidden">
          {theme.funds.map((fund, i) => (
            <MutualFundCard key={fund.id} fund={fund} bordered={i > 0} />
          ))}
        </div>
        <Button
          variant="plain"
          size="sm"
          rightIcon={<ArrowRightIcon size={20} />}
          className="w-full justify-center text-[#0a6ee7]"
        >
          ดูเพิ่มเติม
        </Button>
      </div>
    </div>
  );
}

function TopPerformersSection({
  categoryId,
  onCategoryChange,
  funds,
}: {
  categoryId: MutualFundCategoryId;
  onCategoryChange: (id: MutualFundCategoryId) => void;
  funds: MutualFund[];
}) {
  const chipDrag = useDragScroll();

  return (
    <section className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ThumbsUpIcon size={18} weight="fill" className="shrink-0 text-[#0a6ee7]" />
          <h2 className="text-lg font-bold leading-7 text-[#101828]">กองทุนผลตอบแทนเด่น</h2>
        </div>
        <div
          ref={chipDrag.ref}
          className="flex gap-2 overflow-x-auto hide-scrollbar"
          style={{ scrollbarWidth: "none", cursor: "grab" }}
          onMouseDown={chipDrag.onMouseDown}
          onMouseMove={chipDrag.onMouseMove}
          onMouseUp={chipDrag.onMouseUp}
          onMouseLeave={chipDrag.onMouseLeave}
        >
          {MUTUAL_FUND_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              type="single"
              size="small"
              selected={categoryId === cat.id}
              onClick={() => onCategoryChange(cat.id)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-[#f3f4f6] p-2 flex flex-col gap-0.5">
        <p className="text-xs font-semibold leading-4 text-[#101828] text-right px-3 py-2">
          ผลดำเนินงานย้อนหลัง 1 ปี
        </p>
        <div className="rounded-lg border border-black/10 bg-white overflow-hidden">
          {funds.slice(0, 3).map((fund, i) => (
            <MutualFundCard key={fund.id} fund={fund} bordered={i > 0} />
          ))}
        </div>
        <Button
          variant="plain"
          size="sm"
          rightIcon={<ArrowRightIcon size={20} />}
          className="self-center text-[#0a6ee7] max-w-[343px] w-full"
        >
          ดูเพิ่มเติม
        </Button>
      </div>
    </section>
  );
}

function InsightsSection({ insights }: { insights: MutualFundInsight[] }) {
  return (
    <section className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex items-center gap-4">
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1">
            <BookOpenTextIcon size={20} weight="fill" className="shrink-0 text-[#73442b]" />
            <h2 className="text-lg font-bold leading-7 bg-gradient-to-r from-[#73442b] to-[#b58063] bg-clip-text text-transparent">
              เจาะลึกโอกาสลงทุนเด่น
            </h2>
          </div>
          <p className="text-sm leading-5 bg-gradient-to-r from-[#73442b] to-[#b58063] bg-clip-text text-transparent">
            บทวิเคราะห์จาก Yuanta CIO
          </p>
        </div>
        <Button variant="plain" size="sm" rightIcon={<ArrowRightIcon size={20} />} className="shrink-0">
          ดูเพิ่มเติม
        </Button>
      </div>

      <InsightCarousel insights={insights} />

      <div className="flex gap-8 w-full">
        <QuickActionCard
          title="ตัวกรองกองทุน"
          illustration="/products/mutual-fund/filter-illustration.png"
        />
        <QuickActionCard
          title="วางแผนภาษี"
          illustration="/products/mutual-fund/tax-illustration.png"
        />
      </div>
    </section>
  );
}

function ThemesSection({ themes }: { themes: MutualFundTheme[] }) {
  const drag = useDragScroll();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
      const cardWidth = 308 + 10;
      setActive(Math.round(el.scrollLeft / cardWidth));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 318, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-4 w-full pt-3 pb-10">
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-1">
          <MedalIcon size={24} weight="fill" className="shrink-0 text-[#0a6ee7]" />
          <h2 className="text-lg font-bold leading-7 text-[#101828]">5 ธีมกองทุนเด่น</h2>
        </div>
        <p className="text-sm leading-5 text-[#101828]">ธีมกองทุนผลตอบแทนโดดเด่น</p>
      </div>

      <div className="relative w-full">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="เลื่อนซ้าย"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex size-10 items-center justify-center rounded-lg border border-black/10 bg-white shadow-sm"
          >
            <CaretLeftIcon size={20} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="เลื่อนขวา"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex size-10 items-center justify-center rounded-lg border border-black/10 bg-white shadow-sm"
          >
            <CaretRightIcon size={20} />
          </button>
        )}

        <div
          ref={(node) => {
            scrollRef.current = node;
            (drag.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className="overflow-x-auto hide-scrollbar px-0 lg:px-12"
          style={{ scrollbarWidth: "none", cursor: "grab" }}
          onMouseDown={drag.onMouseDown}
          onMouseMove={drag.onMouseMove}
          onMouseUp={drag.onMouseUp}
          onMouseLeave={drag.onMouseLeave}
        >
          <div className="flex gap-2.5 min-w-max">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </div>

      <SectionDots count={Math.max(themes.length - 2, 1)} active={Math.min(active, themes.length - 3)} />
    </section>
  );
}

export function MutualFundTab() {
  const { data } = useMutualFundCatalog();
  const [categoryId, setCategoryId] = useState<MutualFundCategoryId>("global-equity");
  const funds = data.topPerformers[categoryId] ?? data.topPerformers["global-equity"] ?? [];

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <TopPerformersSection
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            funds={funds}
          />
          <InsightsSection insights={data.insights} />
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-6">
        <ThemesSection themes={data.themes} />
      </div>
    </div>
  );
}
