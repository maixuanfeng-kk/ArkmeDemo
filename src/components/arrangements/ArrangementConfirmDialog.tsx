import type { ArrangementPendingAction } from "@/components/arrangements/types";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementConfirmDialog({
  pendingAction,
  onCancel,
  onConfirm,
}: {
  pendingAction: ArrangementPendingAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = usePreferences();
  const isDelete = pendingAction.type === "delete";
  const descriptionKey = isDelete
    ? "arrangements.confirm.deleteDesc"
    : `arrangements.confirm.status.${pendingAction.status}`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        onClick={onCancel}
        aria-label={t("arrangements.action.cancel")}
      />
      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[310px] rounded-[8px] bg-bg px-4 py-4 shadow-[0_16px_44px_rgba(0,0,0,0.22)]"
      >
        <p className="text-[16px] font-semibold leading-6 text-text">
          {t(isDelete ? "arrangements.confirm.deleteTitle" : "arrangements.confirm.statusTitle")}
        </p>
        <p className="mt-2 text-[13px] leading-5 text-text-muted">{t(descriptionKey)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-[8px] border border-border bg-surface text-[14px] font-semibold text-text transition active:scale-[0.98]"
            onClick={onCancel}
          >
            {t("arrangements.action.cancel")}
          </button>
          <button
            type="button"
            className={`flex h-11 items-center justify-center rounded-[8px] text-[14px] font-semibold transition active:scale-[0.98] ${isDelete ? "bg-danger text-white" : "bg-primary text-on-primary"}`}
            onClick={onConfirm}
          >
            {t(isDelete ? "arrangements.action.confirmDelete" : "arrangements.action.confirmStatus")}
          </button>
        </div>
      </section>
    </div>
  );
}
