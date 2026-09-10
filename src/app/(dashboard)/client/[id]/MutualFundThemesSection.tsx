"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, PaginationBanner } from "@sarunyu/system-one";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { MutualFundSeeMoreIcon, MutualFundThemeList } from "./MutualFundCard";
import { MF_ASSETS } from "./mutual-fund-assets";
import type { MutualFundTheme, MutualFundThemeIcon } from "./mutual-fund-data";
import { useDragScroll } from "./use-drag-scroll";

const THEME_PAGE_COUNT = 2;

function getThemeActiveIndex(el: HTMLElement) {
  const maxScroll = el.scrollWidth - el.clientWidth;
  if (maxScroll <= 1) return 0;
  return el.scrollLeft >= maxScroll / 2 ? 1 : 0;
}

function scrollThemeToPage(el: HTMLElement, pageIndex: number) {
  const maxScroll = el.scrollWidth - el.clientWidth;
  el.scrollTo({ left: pageIndex === 0 ? 0 : maxScroll, behavior: "smooth" });
}

function ThemeIcon({ icon }: { icon: MutualFundThemeIcon }) {
  return (
    <Image
      src={MF_ASSETS.themeIcon[icon]}
      alt=""
      width={20}
      height={20}
      className="size-5 shrink-0 object-contain"
    />
  );
}

/** Figma 40118:77413 — theme card 308×364 */
function ThemeCard({ theme }: { theme: MutualFundTheme }) {
  return (
    <div className="flex h-[364px] w-[308px] shrink-0 flex-col gap-[10px] rounded-lg bg-gradient-to-b from-[#0a6ee7] to-[#f3f4f6] to-[85.462%] px-1 pb-1 pt-2">
      <div className="flex w-full items-center gap-1 px-3">
        <ThemeIcon icon={theme.icon} />
        <span className="min-w-0 flex-1 text-base font-bold leading-6 text-white">{theme.title}</span>
      </div>
      <div className="flex w-full flex-col gap-0.5">
        <MutualFundThemeList funds={theme.funds} />
        <div className="flex h-10 w-full items-center justify-center">
          <Button
            variant="plain"
            size="xl"
            rightIcon={<MutualFundSeeMoreIcon />}
            className="w-fit shrink-0"
          >
            ดูเพิ่มเติม
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Figma 40118:77403 — full-width themes band */
export function MutualFundThemesSection({ themes }: { themes: MutualFundTheme[] }) {
  const drag = useDragScroll();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = drag.ref.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
      setActiveIndex(getThemeActiveIndex(el));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [drag.ref, themes.length]);

  const scrollBy = (dir: -1 | 1) => {
    const el = drag.ref.current;
    if (!el) return;
    scrollThemeToPage(el, dir === -1 ? 0 : 1);
  };

  return (
    <section className="flex w-full flex-col gap-4 pb-10 pt-3">
      <div>
        <div className="flex items-center gap-1">
          <Image src={MF_ASSETS.medal} alt="" width={24} height={24} className="size-6 shrink-0" />
          <h2 className="text-lg font-bold leading-7 text-[#101828]">5 ธีมกองทุนเด่น</h2>
        </div>
        <p className="text-sm leading-5 text-[#101828]">ธีมกองทุนผลตอบแทนโดดเด่น</p>
      </div>

      <div className="relative w-full px-0 lg:px-12">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon-md"
            aria-label="เลื่อนซ้าย"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 lg:flex"
            onClick={() => scrollBy(-1)}
          >
            <CaretLeftIcon size={20} />
          </Button>
        )}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon-md"
            aria-label="เลื่อนขวา"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 lg:flex"
            onClick={() => scrollBy(1)}
          >
            <CaretRightIcon size={20} />
          </Button>
        )}

        <div
          ref={drag.ref}
          className="overflow-x-auto hide-scrollbar"
          style={{ scrollbarWidth: "none", cursor: "grab" }}
          onMouseDown={drag.onMouseDown}
          onMouseMove={drag.onMouseMove}
          onMouseUp={drag.onMouseUp}
          onMouseLeave={drag.onMouseLeave}
        >
          <div className="flex min-w-max gap-2.5">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </div>

      <PaginationBanner
        count={THEME_PAGE_COUNT}
        activeIndex={activeIndex}
        className="w-full justify-center"
        onIndexChange={(index) => {
          const el = drag.ref.current;
          if (el) scrollThemeToPage(el, index);
        }}
      />
    </section>
  );
}
