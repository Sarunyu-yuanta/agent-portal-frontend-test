"use client";

import { ResponsiveBottomSheetModal } from "@/components/ResponsiveBottomSheetModal";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import type { AssetAccountDetail } from "@/data/asset-account-details";

export function AssetAccountDetailModal({
  open,
  accountName,
  detail,
  onClose,
}: {
  open: boolean;
  accountName: string;
  detail: AssetAccountDetail;
  onClose: () => void;
}) {
  return (
    <ResponsiveBottomSheetModal
      open={open}
      onClose={onClose}
      title={detail.viewByLabel.replace(/^view by /i, "")}
      titleId="asset-account-modal-title"
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <HoldingDetailContent detail={detail} />
      </div>
    </ResponsiveBottomSheetModal>
  );
}
