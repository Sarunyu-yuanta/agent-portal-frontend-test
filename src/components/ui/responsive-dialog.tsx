"use client";

import { BottomSheet, Modal } from "@sarunyu/system-one";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * One content, two containers: a bottom sheet on mobile and a centered modal on
 * tablet/desktop. Children render once, so the body markup lives in a single
 * place instead of being duplicated per breakpoint.
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  mobileContentClassName,
  desktopContentClassName,
  closeOnBackdrop = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Applied to the BottomSheet body on mobile. */
  mobileContentClassName?: string;
  /** Applied to the wrapper inside the Modal on desktop. */
  desktopContentClassName?: string;
  /** Close when the desktop backdrop is clicked (mobile always closes on scrim). */
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        showHandle
        showHeader
        rightSide="none"
        contentClassName={mobileContentClassName}
      >
        {children}
      </BottomSheet>
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={
        closeOnBackdrop
          ? (e) => {
              if (e.target === e.currentTarget) onOpenChange(false);
            }
          : undefined
      }
    >
      <Modal
        variant="content"
        actionLayout="none"
        title={title}
        onClose={() => onOpenChange(false)}
      >
        <div className={desktopContentClassName}>{children}</div>
      </Modal>
    </div>
  );
}
