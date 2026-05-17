import { createPortal } from "react-dom";
import { ActionMenuButton } from "@/components/ChatBubbleParts";
import { cn } from "@/lib/utils";

export type ActionMenuPlacement = "above" | "below";

export type ActionMenuPosition = {
  left: number;
  top: number;
  arrowLeft: number;
  placement: ActionMenuPlacement;
};

export default function ChatBubbleActionMenu({
  menuOpen,
  menuPosition,
  textContent,
  wordCount,
  t,
  onClose,
  onOpenDetail,
  onOpenMemorySnapshot,
}: {
  menuOpen: boolean;
  menuPosition: ActionMenuPosition;
  textContent: string;
  wordCount: number;
  t: (key: string) => string;
  onClose: () => void;
  onOpenDetail?: () => void;
  onOpenMemorySnapshot?: () => void;
}) {
  if (!menuOpen) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[9998] cursor-default bg-transparent"
        onClick={onClose}
        aria-label={t("recordAction.close")}
      />
      <div
        className="fixed z-[9999] w-[224px]"
        style={{
          left: `${menuPosition.left}px`,
          top: `${menuPosition.top}px`,
        }}
      >
        <span
          className={cn(
            "absolute z-0 h-3 w-3 rotate-45 border border-[rgba(15,23,42,0.14)] bg-[var(--dialog-bg)] shadow-[0_1px_4px_rgba(15,23,42,0.18)] dark:border-white/15",
            menuPosition.placement === "below" ? "-top-1.5" : "-bottom-1.5"
          )}
          style={{ left: `${menuPosition.arrowLeft}px` }}
          aria-hidden="true"
        />
        <div className="relative z-10 overflow-hidden rounded-[14px] border border-border-light bg-[var(--dialog-bg)] text-text shadow-[0_12px_36px_rgba(0,0,0,0.24)]">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            <ActionMenuButton
              label={t("recordAction.copy")}
              icon="copy"
              onClick={async () => {
                onClose();
                try {
                  await navigator.clipboard?.writeText(textContent);
                } catch {
                  // Clipboard availability differs across browsers in local demos.
                }
              }}
            />
            <ActionMenuButton
              label={t("recordAction.fullscreen")}
              icon="open"
              onClick={() => {
                onClose();
                onOpenDetail?.();
              }}
            />
            <ActionMenuButton
              label={t("recordAction.extend")}
              icon="reply"
              onClick={() => {
                onClose();
                onOpenDetail?.();
              }}
            />
            <ActionMenuButton
              label={t("recordAction.detail")}
              icon="detail"
              onClick={() => {
                onClose();
                onOpenDetail?.();
              }}
            />
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-border-light px-3 py-2.5 text-left transition hover:bg-hover-overlay active:scale-[0.99]"
            onClick={() => {
              onClose();
              onOpenMemorySnapshot?.();
            }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill-3 text-[11px] font-semibold text-text-tertiary">
              i
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-5 text-text">
                {t("recordAction.memorySnapshot")}
              </span>
              <span className="block truncate text-[11px] leading-4 text-text-tertiary">
                {wordCount}{t("recordDetail.wordUnit")} · {t("recordAction.moreDetail")}
              </span>
            </span>
            <svg
              className="h-3.5 w-3.5 shrink-0 text-text-tertiary"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
