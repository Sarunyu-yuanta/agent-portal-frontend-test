"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Avatar, Button } from "@sarunyu/system-one";
import {
  PhoneListIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  UserIcon,
  NotePencilIcon,
  BellSimpleIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import { getCallLogs, relativeCallDate, type CallLogEntry } from "@/data/call-log-data";
import { usePrivacy } from "@/contexts/privacy-context";
import { maskName } from "@/lib/mask-name";
import { getInitials } from "@/lib/client-utils";
import { useSlideOver, SlideOverPanel } from "@/components/ui/slide-over";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ClientAssetSidebarContent, type AssetListViewMode } from "@/components/ClientAssetSidebarContent";
import { HoldingDetailContent } from "@/components/HoldingDetailContent";
import { LiabilitiesDetailContent } from "@/components/LiabilitiesDetailModal";
import type { LiabilitiesDetail } from "@/data/liabilities-details";
import { NineBoxCellPill } from "./NineBoxTab";
import {
  getAssetAccountDetail,
  getAssetProductDetail,
  type AssetAccountItem,
} from "@/data/asset-account-details";
import type { Client } from "@/types/domain";

export function ClientDetailPanel({
  client,
  onViewFull,
  onBack,
}: {
  client: Client;
  onViewFull: () => void;
  onBack?: () => void;
}) {
  const { isPrivate } = usePrivacy();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const detail = useSlideOver<{ item: AssetAccountItem; viewMode: AssetListViewMode }>();
  const liabilities = useSlideOver<{ amount: string; detail: LiabilitiesDetail }>();
  const [callLogOpen, setCallLogOpen] = useState(false);
  const callLogs = getCallLogs(client.id);

  const { reset: resetDetail } = detail;
  const { reset: resetLiabilities } = liabilities;
  const [prevClientId, setPrevClientId] = useState(client.id);
  if (prevClientId !== client.id) {
    setPrevClientId(client.id);
    setCompact(false);
    resetDetail();
    resetLiabilities();
  }
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [client.id]);

  const holdingDetail = detail.data
    ? detail.data.viewMode === "account"
      ? getAssetAccountDetail(detail.data.item.accountNo)
      : getAssetProductDetail(detail.data.item.name)
    : null;

  const detailTitle = holdingDetail?.viewByLabel.replace(/^view by /i, "") ?? "";

  const handleScroll = useCallback(() => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setCompact((prev) => {
      if (prev && top <= 4) return false;
      if (!prev && top > 12) return true;
      return prev;
    });
  }, []);

  const callLogCards = (
    <>
      {callLogs.map((log: CallLogEntry) => (
        <div key={log.id} className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="type-body-2 text-foreground font-semibold">{log.date} · {log.time}</span>
            <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
              {log.direction === "outbound" ? (
                <PhoneOutgoingIcon size={14} className="text-[var(--text-brand-primary)]" />
              ) : (
                <PhoneIncomingIcon size={14} className="text-[var(--icon-success)]" />
              )}
              <span className="type-caption">{log.direction === "outbound" ? "Outbound" : "Inbound"}</span>
            </div>
          </div>
          <p className="type-caption text-muted-foreground">{relativeCallDate(log.date)} · {log.duration}</p>
          <p className="type-body-2 text-foreground mt-1">{log.summary}</p>
        </div>
      ))}
      {callLogs.length === 0 && (
        <p className="type-body-2 text-muted-foreground text-center py-6">No call history yet.</p>
      )}
    </>
  );

  return (
    <>
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        className={`flex flex-col shrink-0 border-b border-[var(--border-default)] transition-[padding,gap] duration-300 ease-out ${
          compact ? "px-5 py-3 gap-0" : "px-5 pt-5 pb-4 gap-4"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
          )}
          <Avatar
            type="text"
            initials={getInitials(maskName(client.name, isPrivate))}
            size={compact ? "s" : "m"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-foreground leading-tight transition-all duration-300 ${
                  compact ? "type-subtitle-2 font-bold" : "type-subtitle-1"
                }`}
              >
                {maskName(client.name, isPrivate)}
              </p>
              {!compact && <NineBoxCellPill client={client} />}
            </div>
            <p className="type-caption text-muted-foreground">{client.id}</p>
          </div>
          {compact ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 mr-8 whitespace-nowrap"
              leftIcon={<UserIcon size={14} />}
              onClick={onViewFull}
            >
              View Full Profile
            </Button>
          ) : (
            <div className="w-10 shrink-0" />
          )}
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <PhoneListIcon size={20} />,   label: "Call log", onClick: () => setCallLogOpen(true), comingSoon: false },
                { icon: <NotePencilIcon size={20} />,  label: "Notes",    onClick: () => {},                  comingSoon: true  },
                { icon: <BellSimpleIcon size={20} />,  label: "Reminder", onClick: () => {},                  comingSoon: true  },
              ].map(({ icon, label, onClick, comingSoon }) => (
                <button
                  key={label}
                  onClick={comingSoon ? undefined : onClick}
                  disabled={comingSoon}
                  className={`relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-colors overflow-hidden ${
                    comingSoon
                      ? "bg-[var(--bg-default-secondary)] border-[var(--border-default)]/40 cursor-not-allowed"
                      : "bg-[var(--bg-default-secondary)] border-primary-action/20 hover:bg-[var(--bg-brand-light)] hover:border-[var(--bg-brand-primary)] cursor-pointer"
                  }`}
                >
                  <span className={`text-primary-action ${comingSoon ? "opacity-15" : ""}`}>{icon}</span>
                  <span className={`text-[11px] font-medium text-primary-action leading-none ${comingSoon ? "opacity-15" : ""}`}>
                    {label}
                  </span>
                  {comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-primary-action bg-[var(--bg-brand-light)] border border-primary-action/30 px-1.5 py-0.5 rounded-full">Coming soon</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              leftIcon={<UserIcon size={16} />}
              onClick={onViewFull}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto hide-scrollbar"
      >
        <ClientAssetSidebarContent
          clientId={client.id}
          client={client}
          onItemClick={(item, viewMode) => detail.open({ item, viewMode })}
          onLiabilitiesOpen={(amount, detailData) => liabilities.open({ amount, detail: detailData })}
        />
      </div>

      {/* Detail view — covers entire panel including sticky header */}
      {detail.mounted && holdingDetail && (
        <SlideOverPanel visible={detail.visible}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
            <button
              type="button"
              onClick={detail.close}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] flex-1 min-w-0 truncate">
              {detailTitle}
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            <HoldingDetailContent detail={holdingDetail} />
          </div>
        </SlideOverPanel>
      )}

      {/* Liabilities view — same slide-in pattern */}
      {liabilities.mounted && liabilities.data && (
        <SlideOverPanel visible={liabilities.visible}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] shrink-0">
            <button
              type="button"
              onClick={liabilities.close}
              className="flex items-center justify-center size-8 rounded-lg hover:bg-[var(--bg-default-secondary)] transition-colors text-[var(--text-default-primary)] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <p className="type-subtitle-2 font-bold text-[var(--text-default-primary)] flex-1 min-w-0 truncate">
              Liabilities
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            <div className="flex flex-col gap-4 p-4">
              <LiabilitiesDetailContent
                totalAmount={liabilities.data.amount}
                detail={liabilities.data.detail}
              />
            </div>
          </div>
        </SlideOverPanel>
      )}
    </div>

    {/* Call log — BottomSheet on mobile, Modal on tablet/desktop */}
    <ResponsiveDialog
      open={callLogOpen}
      onOpenChange={setCallLogOpen}
      title={`Call log — ${client.name}`}
      mobileContentClassName="flex flex-col gap-3 p-4"
      desktopContentClassName="flex flex-col gap-3 min-w-[420px] max-w-[520px]"
    >
      {callLogCards}
    </ResponsiveDialog>
    </>
  );
}
