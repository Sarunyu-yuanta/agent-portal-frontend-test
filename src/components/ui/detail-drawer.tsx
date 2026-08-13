"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Standard right-side drawer widths used across the dashboard. */
const SIZE_CLASSES = {
  /** Client / product / nine-box detail drawers. */
  wide: "md:w-[55vw] md:max-w-[55vw] lg:w-[40vw] lg:max-w-[40vw] xl:w-[30vw] xl:max-w-[30vw]",
  /** Compact side panels (insight / KYC detail). */
  narrow: "sm:w-[400px] sm:max-w-[400px]",
  /** Slightly wider compact panel (client intelligence). */
  compact: "sm:w-[420px] sm:max-w-[420px]",
} as const;

/**
 * Right-side sliding drawer with the app's standard responsive widths.
 * Non-modal so the page underneath stays interactive, matching existing usage.
 *
 * Content-flow classes (`overflow-*`, `flex`) are intentionally NOT baked in —
 * pass them via `className` so wide detail panels (`overflow-hidden flex
 * flex-col`) and scrolling side panels (`overflow-y-auto`) both stay pixel-exact.
 */
export function DetailDrawer({
  open,
  onOpenChange,
  size = "wide",
  showCloseButton,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: keyof typeof SIZE_CLASSES;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={showCloseButton}
        className={cn("w-full p-0", SIZE_CLASSES[size], className)}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
