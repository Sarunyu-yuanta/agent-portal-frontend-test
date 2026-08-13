/**
 * Client 360 detail — static data and helpers.
 *
 * ─── Backend handoff ─────────────────────────────────────────────────────────
 * `IMPORTANT_FORMS` is hard-coded and should come from the API per client
 * (form title, description, last-updated date, completion status). "Last
 * contact" is derived from the call log here; the backend may return it directly.
 */

import { mockClients, mockClientDetails } from "@/lib/mock-data";
import type { CallLogEntry } from "@/data/call-log-data";

/** Per-client detail keyed by client id, aligned with the client roster. */
export const clientDetailById = Object.fromEntries(
  mockClients.map((c) => [c.id, mockClientDetails[c.id]]),
);

export const ALLOCATION_COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6",
  "#06b6d4", "#6366f1", "#f97316", "#ec4899",
] as const;

export type SortDir = "none" | "asc" | "desc";
export type HoldingsSortKey = "value" | "pnlPct" | "pct" | null;

/** Human "last contact" label derived from the most recent call log. */
export function lastContactFromCallLogs(logs: CallLogEntry[]): string {
  if (logs.length === 0) return "No contact";
  const MONTHS: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parsed = logs
    .map((log) => {
      const [d, m, y] = log.date.split(" ");
      return new Date(Number(y), MONTHS[m] ?? 0, Number(d));
    })
    .filter((d) => !isNaN(d.getTime()));
  if (parsed.length === 0) return "No contact";
  const latest = new Date(Math.max(...parsed.map((d) => d.getTime())));
  const now = new Date();
  const days = Math.floor((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export type FormStatus = "done" | "pending" | "not-done" | "oncoming" | null;

export const IMPORTANT_FORMS: {
  title: string;
  description: string;
  date: string;
  status: FormStatus;
}[] = [
  { title: "Wealth Declaration", description: "แบบแจ้งการเป็นผู้ลงทุนรายใหญ่ / รายใหญ่พิเศษ / ที่มีลักษณะเฉพาะ", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "done" },
  { title: "FATCA and CRS", description: "แบบแจ้งความเป็นบุคคลอเมริกัน และผู้มีถิ่นที่อยู่ทางภาษีในประเทศอื่น", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "pending" },
  { title: "W-8Ben", description: "แบบฟอร์มภาษีของกรมสรรพากรแห่งสหรัฐอเมริกา", date: "อัปเดตล่าสุด: 24 Jul 2024", status: null },
  { title: "แบบประเมินความรู้ความสามารถในการลงทุน (Knowledge Assessment)", description: "สำหรับการลงทุนในผลิตภัณฑ์ในตลาดทุนที่มีความเสี่ยงสูงหรือมีความซับซ้อน", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "not-done" },
  { title: "แบบทดสอบความรู้ผู้ลงทุน เกี่ยวกับตราสารหนี้", description: "สำหรับการจองซื้อ/ซื้อขายตราสารหนี้ (Perpetual Bond)", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "not-done" },
  { title: "แบบประเมินความเหมาะสมในการลงทุน (Suitability Test)", description: "ประเมินระดับความสามารถในการรับความเสี่ยงจากการลงทุน เพื่อหาประเภทหลักทรัพย์ที่เหมาะสม", date: "อัปเดตล่าสุด: 24 Jul 2024", status: "oncoming" },
];
