"use client";

import { useState } from "react";
import { BottomSheet } from "@sarunyu/system-one";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AlertDetail } from "./AlertDetail";
import type { DayItem } from "./day-items";

/** An alert plus the day it was read off — a `DayItem` carries no date of its
 * own, it is only ever pulled out of a map keyed by one. */
export type AlertTarget = { item: DayItem; day: Date };

/**
 * The shell `AlertDetail` opens in: a sheet on a phone, a centred panel on a
 * pointer device.
 *
 * Its own component because two places open it now — the Calendar grid and a
 * client's Reminders tab — and the last time a piece of this panel was written
 * out twice, the two copies drifted (the source badge stayed green in one after
 * the other turned orange). One definition, so there is nothing to keep in step.
 */
export function AlertOverlay({
  target,
  clients,
  onClose,
  showHolders = true,
}: {
  /** `null` closes it. The panel keeps drawing the last one while it leaves. */
  target: AlertTarget | null;
  clients: { id: string; name: string }[];
  onClose: () => void;
  /** Passed through to `AlertDetail` — off inside one client's own profile. */
  showHolders?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  /**
   * The alert being *drawn*, which lags `target` by one slide.
   *
   * vaul keeps the sheet mounted while it animates out, so a panel rendered
   * straight off `target` would empty the moment you dismissed it and leave a
   * blank card sliding down. Same split, and the same reason, as `shown` inside
   * `AlertDetail`.
   */
  const [shown, setShown] = useState<AlertTarget | null>(null);
  if (target && target !== shown) setShown(target);

  if (isMobile) {
    return (
      // Mounted whenever the viewport is a phone rather than only while open —
      // see `DayCell`. `px-0` so the "raised by the system" band and the row
      // hovers reach the edges; the sheet's own `pb-6` stays, since this panel
      // ends on a list and has no bottom padding of its own. `overflow-hidden`
      // because it opens on a tinted band, whose square corners would otherwise
      // sit proud of the sheet's rounded top.
      <BottomSheet
        open={target !== null}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
        showHeader={false}
        title={shown?.item.title ?? "Alert"}
        className="px-0 overflow-hidden"
        contentClassName="pt-0"
      >
        {shown && (
          <AlertDetail
            item={shown.item}
            day={shown.day}
            clients={clients}
            variant="sheet"
            showHolders={showHolders}
            onClose={onClose}
          />
        )}
      </BottomSheet>
    );
  }

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* `role`/`aria-modal` to match what `BottomSheet` already declares on the
          phone side — the same panel shouldn't be a dialog on one device and an
          anonymous div on the other. */}
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[75vh] w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl"
      >
        <AlertDetail
          item={target.item}
          day={target.day}
          clients={clients}
          showHolders={showHolders}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
