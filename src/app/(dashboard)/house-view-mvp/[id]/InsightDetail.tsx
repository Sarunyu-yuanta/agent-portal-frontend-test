"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@sarunyu/system-one";
import { Tag, Button } from "@sarunyu/system-one";
import { SparkleIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { mockHouseViewStrategies, mockAnalysts } from "@/lib/mock-data";
import { CATEGORY_TAG_VARIANT, getCategory, getInsightDetail } from "../house-view-data";
import { AIRecommendCard } from "../AIRecommendCard";
import { PlaybookCardCompact } from "../PlaybookCardCompact";

export function InsightDetail({ id }: { id: string }) {
  const router = useRouter();
  const strategy = mockHouseViewStrategies.find((s) => s.id === id);

  if (!strategy) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="type-subtitle-1 text-foreground">ไม่พบบทวิเคราะห์นี้</p>
        <Link href="/house-view-mvp" className="text-[13px] text-primary-action hover:underline">
          กลับไปหน้า Insights
        </Link>
      </div>
    );
  }

  const cat = getCategory(strategy);
  const detail = getInsightDetail(strategy);
  const related = mockHouseViewStrategies
    .filter((s) => s.periodLabel === strategy.periodLabel && s.id !== strategy.id);

  const aiSummary = detail.aiSummary && (
    <div
      className="rounded-2xl border border-border p-6 flex flex-col gap-3"
      style={{ background: "linear-gradient(120deg, var(--card) 0%, var(--muted) 100%)" }}
    >
      <div className="flex items-center gap-2.5">
        <SparkleIcon size={24} weight="fill" className="text-primary-action shrink-0" />
        <p className="type-subtitle-1 font-bold text-foreground">AI Summary</p>
      </div>
      <p className="text-[12px] text-muted-foreground -mt-2">บทสรุปจาก AI อ้างอิงโดยบทวิเคราะห์</p>
      <p className="text-[14px] text-foreground leading-relaxed">{detail.aiSummary}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 lg:grid lg:gap-6" style={{ gridTemplateColumns: "1fr 400px" }}>
      <div className="flex flex-col gap-6 pb-12 min-w-0 max-lg:max-w-xl max-lg:mx-auto max-lg:w-full">
        <div className="xl:hidden">
          <Breadcrumb items={[
            { label: "Insights", href: "/house-view-mvp" },
            { label: strategy.name.length > 28 ? `${strategy.name.slice(0, 28)}…` : strategy.name },
          ]} />
        </div>

        <Button variant="plain" size="sm" leftIcon={<ArrowLeftIcon size={16} />} onClick={() => router.back()} className="self-start hidden xl:inline-flex">
          กลับ
        </Button>

        <div className="flex flex-col gap-4">
          <Tag text={cat} variant={CATEGORY_TAG_VARIANT[cat] ?? "gray"} size="small" />
          <h1 className="type-h4 sm:type-h3 font-bold text-foreground leading-tight">{strategy.name}</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <p className="type-subtitle-2 text-muted-foreground">{detail.subtitle}</p>
          <p className="text-[13px] text-muted-foreground sm:shrink-0">{detail.date}</p>
        </div>
        <div className="border-t border-border" />

        {/* AI Summary sits inline on mobile/tablet; on desktop it moves to the sticky sidebar */}
        <div className="lg:hidden">{aiSummary}</div>

        {detail.sections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <h2 className="type-subtitle-1 font-bold text-foreground">{section.heading}</h2>
            <p className="text-[14px] text-foreground leading-relaxed">{section.content}</p>
            {section.image && (
              <div className="rounded-xl border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mock chart, intrinsic size varies per chart */}
                <img src={section.image} alt={section.heading} className="w-full h-auto" />
              </div>
            )}
          </div>
        ))}

        <div className="border-t border-border mt-4" />

        <div className="flex flex-col gap-4">
          <h2 className="type-subtitle-1 font-bold text-foreground">บทวิเคราะห์โดย</h2>
          <div className="flex flex-wrap gap-6">
            {mockAnalysts.slice(0, 3).map((analyst) => (
              <div key={analyst.id} className="flex items-center gap-3 w-full sm:w-auto">
                {/* eslint-disable-next-line @next/next/no-img-element -- small fixed-size headshot, no responsive sizes needed */}
                <img src={analyst.photo} alt={analyst.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex flex-col min-w-0 max-w-[180px]">
                  <p className="text-[14px] font-bold text-foreground">{analyst.name}</p>
                  <p className="text-[12px] text-muted-foreground">{analyst.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="border-t border-border" />
            <h2 className="type-subtitle-1 font-bold text-foreground mt-2">บทวิเคราะห์อื่นๆ ประจำ{strategy.periodLabel}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((s) => (
                <PlaybookCardCompact key={s.id} strategy={s} />
              ))}
            </div>
          </div>
        )}

        {/* AI Recommend sits at the very bottom on mobile/tablet; on desktop it's in the sticky sidebar */}
        <div className="lg:hidden">
          <AIRecommendCard />
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-6 flex flex-col gap-5">
          {aiSummary}
          <AIRecommendCard />
        </div>
      </div>
    </div>
  );
}
