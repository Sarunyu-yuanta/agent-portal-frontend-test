/**
 * Command Center static data.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * `kpiItems`, `automationLog`, and `clientIntelligenceMap` are hard-coded mock
 * data today. Replace each with an API response: KPI figures, the automation
 * activity feed, and per-client intelligence (assets, cash drag, AI insight,
 * talking points) keyed by client id.
 */

import { mockNBAActions } from "@/lib/mock-data";

export type NBAActionItem = (typeof mockNBAActions)[number];

export type KanbanStage = "Idea" | "Pitch" | "Client Review" | "Executed";

export const KANBAN_STAGES: KanbanStage[] = [
  "Idea",
  "Pitch",
  "Client Review",
  "Executed",
];

export const automationLog = [
  {
    id: "a1",
    done: true,
    label: "Morning brief sent to 8 clients",
    time: "07:00",
  },
  {
    id: "a2",
    done: true,
    label: "KYC reminder sent to Malee Pongpipat",
    time: "08:15",
  },
  {
    id: "a3",
    done: false,
    label: "Structured Note pitch scheduled for Nattaporn — 14:00",
    time: "08:30",
  },
  {
    id: "a4",
    done: true,
    label: "AI matched 5 UHNW clients to Structured Note Series 12",
    time: "09:00",
  },
  {
    id: "a5",
    done: false,
    label: "Re-engagement message queued for Wichai Thongkam",
    time: "09:10",
  },
];

export const kpiItems = [
  {
    label: "Total AUM",
    value: "฿ 2.4B",
    delta: "+8.2% MoM",
    deltaVariant: "green" as const,
    progress: 80,
    target: "Target ฿ 3.0B",
  },
  {
    label: "Net New Money",
    value: "฿ 180M",
    delta: "+22% QoQ",
    deltaVariant: "green" as const,
    progress: 90,
    target: "Target ฿ 200M",
  },
  {
    label: "YTD Revenue",
    value: "฿ 24.2M",
    delta: "81% of target",
    deltaVariant: "yellow" as const,
    progress: 81,
    target: "Target ฿ 30M",
  },
  {
    label: "Proposals",
    value: "8",
    delta: "3 High Priority",
    deltaVariant: "red" as const,
    progress: null,
    target: "Est. ฿ 4.7M AUM",
  },
];

export type ClientIntelligence = {
  totalAssets: string;
  cashDrag: string;
  cashDragPct: number;
  ytdReturn: string;
  ytdPositive: boolean;
  riskProfile: string;
  aiInsight: string;
  talkingPoints: { text: string; category: string }[];
};

export const clientIntelligenceMap: Record<string, ClientIntelligence> = {
  "1": {
    totalAssets: "฿ 450M",
    cashDrag: "฿ 81M",
    cashDragPct: 18,
    ytdReturn: "+4.2%",
    ytdPositive: true,
    riskProfile: "Aggressive",
    aiInsight:
      "คุณสมชายมีแนวโน้มตัดสินใจลงทุนช่วงเช้า และเปิดรับข้อเสนอหลัง market update ประวัติชี้ว่าให้น้ำหนักกับผลตอบแทนระยะสั้นมากกว่าการกระจายความเสี่ยง",
    talkingPoints: [
      {
        text: "ทบทวนสัดส่วนเงินสด 18% — สูงกว่า target allocation 8pp",
        category: "Portfolio Review",
      },
      {
        text: "เสนอ Structured Note Series 12 อัตราดอก 8.5% p.a., tenor 6 เดือน",
        category: "Product Match",
      },
      {
        text: "เริ่มด้วย market outlook Q3 ก่อนเข้าเรื่อง product",
        category: "Portfolio Review",
      },
    ],
  },
  "2": {
    totalAssets: "฿ 120M",
    cashDrag: "฿ 8M",
    cashDragPct: 7,
    ytdReturn: "-3.1%",
    ytdPositive: false,
    riskProfile: "Moderate",
    aiInsight:
      "คุณมาลีแสดงความกังวลเรื่อง downside risk ช่วง 2 เดือนที่ผ่านมา และมักถามเรื่อง capital protection KYC หมดอายุใน 14 วัน — โอกาสดีในการนัดพบและ rebalance",
    talkingPoints: [
      {
        text: "ต่ออายุ KYC — หมดอายุวันที่ 11 มิ.ย. 2026",
        category: "Compliance",
      },
      {
        text: "ทบทวน YTD P&L -3.1% และแผน rebalance",
        category: "Portfolio Review",
      },
      {
        text: "เสนอ Capital Protection product เพื่อลด downside anxiety",
        category: "Product Match",
      },
    ],
  },
  "3": {
    totalAssets: "฿ 85M",
    cashDrag: "฿ 4M",
    cashDragPct: 5,
    ytdReturn: "+6.8%",
    ytdPositive: true,
    riskProfile: "Moderate-Aggressive",
    aiInsight:
      "คุณนัตถพรเคยลงทุนใน Structured Note ปี 2024 และได้รับผลตอบแทนดี มีแนวโน้ม respond ดีต่อ product ที่มี track record ชัดเจน เหมาะ pitch ผ่าน LINE ช่วง 10:00–11:00",
    talkingPoints: [
      {
        text: "อ้างอิง Structured Note ปี 2024 — return 7.2% p.a.",
        category: "Product Match",
      },
      {
        text: "เสนอ Series 12 พร้อม historical performance",
        category: "Product Match",
      },
      {
        text: "ติดต่อผ่าน LINE ช่วง 10:00–11:00 ตามพฤติกรรมที่ผ่านมา",
        category: "Portfolio Review",
      },
    ],
  },
  "4": {
    totalAssets: "฿ 62M",
    cashDrag: "฿ 10M",
    cashDragPct: 16,
    ytdReturn: "+1.1%",
    ytdPositive: true,
    riskProfile: "Conservative",
    aiInsight:
      "คุณวิชัยไม่มีการเคลื่อนไหวในพอร์ตตั้งแต่ ก.พ. 2026 แต่เคย engage สูงช่วง SET ลด AI ประเมิน 72% ที่เขาจะ respond ต่อ market update หรือ exclusive content",
    talkingPoints: [
      {
        text: "เริ่มด้วย market update ที่ relate กับ portfolio ของเขา",
        category: "Re-Engagement",
      },
      {
        text: "เสนอ exclusive morning brief สำหรับ HNW clients",
        category: "Re-Engagement",
      },
      {
        text: "ทบทวนเงินสด 16% — โอกาสใน money market fund",
        category: "Portfolio Review",
      },
    ],
  },
};
