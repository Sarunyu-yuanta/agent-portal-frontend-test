export type TopIdeaSector =
  | "Energy"
  | "Material"
  | "Industrials"
  | "Consumer Discretionary"
  | "Consumer Staples";

export const TOP_IDEA_THEMES: Record<TopIdeaSector, string> = {
  Energy: "สงครามน้ำมันแพง",
  Material: "ต้นทุนการผลิตสูงขึ้น",
  Industrials: "การขนส่งล่าช้าและมีราคาแพง",
  "Consumer Discretionary": "ความต้องการสินค้าอุตสาหกรรมลดลง",
  "Consumer Staples": "ผู้บริโภคลดการใช้จ่าย",
};

export const TOP_IDEA_SUBTITLES: Record<TopIdeaSector, string> = {
  Energy: "อุตหกรรมที่ตอนนี้กำลังมาแรงที่สุด",
  Material: "อุตหกรรมที่ตอนนี้กำลังมาแรงที่สุด",
  Industrials: "อุตหกรรมที่ตอนนี้กำลังมาแรงที่สุด",
  "Consumer Discretionary": "อุตหกรรมที่ตอนนี้กำลังมาแรงที่สุด",
  "Consumer Staples": "อุตหกรรมที่ตอนนี้กำลังมาแรงที่สุด",
};

export const TOP_IDEA_MAX_COUPON = "30.5%";

export const TOP_IDEA_UPDATED_AT = "10 September 2026 - 09:00";

export const TOP_IDEA_UPDATED_AT_MOBILE = "10 Sep 2026 - 09:00";

/** Horizontal scroll strip on catalog home */
export const TOP_IDEAS: { sector: TopIdeaSector }[] = [
  { sector: "Energy" },
  { sector: "Material" },
  { sector: "Industrials" },
  { sector: "Consumer Discretionary" },
  { sector: "Consumer Staples" },
  { sector: "Material" },
  { sector: "Energy" },
  { sector: "Consumer Discretionary" },
];

/** Full grid on All Top idea page — Figma 34079:506878 */
export const ALL_TOP_IDEAS: { sector: TopIdeaSector }[] = [
  { sector: "Energy" },
  { sector: "Consumer Discretionary" },
  { sector: "Consumer Staples" },
  { sector: "Industrials" },
  { sector: "Industrials" },
  { sector: "Material" },
  { sector: "Consumer Discretionary" },
  { sector: "Consumer Staples" },
  { sector: "Consumer Discretionary" },
  { sector: "Consumer Discretionary" },
  { sector: "Energy" },
  { sector: "Material" },
  { sector: "Material" },
  { sector: "Material" },
  { sector: "Consumer Staples" },
];
