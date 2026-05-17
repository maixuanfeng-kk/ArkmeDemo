import ArrangementPendingRecognition from "@/components/arrangements/ArrangementPendingRecognition";
import {
  getArrangementSourceLabel,
  isGroupArrangementSource,
} from "@/components/arrangements/recordArrangementSource";
import { useArrangementSourceRecognition } from "@/components/arrangements/useArrangementSourceRecognition";
import type { ArrangementItem } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";
import type { RecordItem } from "@/types/record";

type ArrangementSourceRecognitionDialogProps = {
  record: RecordItem | null;
  contextRecords?: RecordItem[];
  locale: string;
  onClose: () => void;
  onCreated: (arrangement: ArrangementItem) => void;
  onOpenArrangements: () => void;
};

export default function ArrangementSourceRecognitionDialog({
  record,
  contextRecords,
  locale,
  onClose,
  onCreated,
  onOpenArrangements,
}: ArrangementSourceRecognitionDialogProps) {
  const { t } = usePreferences();
  const sourceLabel = record
    ? getArrangementSourceLabel(record, t("sendToSelf.title"))
    : t("sendToSelf.title");
  const isTestSource = record?.sourceConversation?.type === "test";
  const isGroupSource = record ? isGroupArrangementSource(record) : false;
  const dialogTitle = isTestSource
    ? t(
        isGroupSource
          ? "arrangements.ai.groupSourceDialogTitle"
          : "arrangements.ai.testSourceDialogTitle"
      )
    : t("arrangements.ai.sourceDialogTitle");
  const recognition = useArrangementSourceRecognition({
    record,
    contextRecords,
    locale,
    sourceLabel,
    onCreated,
  });

  const openArrangements = () => {
    onClose();
    onOpenArrangements();
  };

  if (!record) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
        aria-label={t("arrangements.closeAi")}
      />
      <section
        className="relative z-10 max-h-[88%] w-full max-w-[360px] overflow-y-auto rounded-[14px] border border-border-light bg-bg p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
        role="dialog"
        aria-modal="true"
        aria-label={dialogTitle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold leading-6 text-text">
              {dialogTitle}
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-text-muted">
              {t("arrangements.ai.sourceDialogDesc")}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-text-muted transition hover:bg-hover-overlay active:scale-[0.96]"
            onClick={onClose}
            aria-label={t("arrangements.closeAi")}
          >
            ×
          </button>
        </div>

        <div className="mt-3 rounded-[8px] border border-border-light bg-surface px-3 py-2.5">
          <p className="text-[11px] leading-4 text-text-tertiary">{sourceLabel}</p>
          {recognition.sourceContext?.hasContext && (
            <p className="mt-1 text-[11px] font-semibold leading-4 text-primary">
              {t("arrangements.ai.contextIncluded")} ·{" "}
              {recognition.sourceContext.contextCount}
              {t("arrangements.ai.contextMessageUnit")}
            </p>
          )}
          <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-5 text-text">
            {recognition.sourceContext?.previewText ?? record.text_content}
          </p>
        </div>

        {recognition.isLoading && (
          <p className="mt-3 rounded-[8px] bg-primary-soft px-3 py-2 text-[13px] leading-5 text-primary">
            {t("arrangements.ai.loadingSource")}
          </p>
        )}

        {recognition.error && (
          <div className="mt-3 rounded-[8px] border border-danger/20 bg-danger/10 px-3 py-2.5">
            <p className="text-[13px] font-semibold leading-5 text-danger">
              {recognition.needsSettings
                ? t("arrangements.ai.sourceSettingsTitle")
                : t("arrangements.ai.recognizeFailedTitle")}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-danger">
              {recognition.error}
            </p>
          </div>
        )}

        {recognition.form && recognition.metadata && (
          <div className="mt-3">
            <ArrangementPendingRecognition
              form={recognition.form}
              metadata={recognition.metadata}
              onChange={recognition.updateForm}
              onConfirm={recognition.confirmCreate}
              onIgnore={onClose}
            />
          </div>
        )}

        {recognition.error && !recognition.form && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-[8px] border border-border bg-surface text-[14px] font-semibold text-text transition active:scale-[0.98]"
              onClick={onClose}
            >
              {t("arrangements.action.cancel")}
            </button>
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-[8px] bg-primary text-[14px] font-semibold text-on-primary transition active:scale-[0.98]"
              onClick={
                recognition.needsSettings
                  ? openArrangements
                  : recognition.recognizeRecord
              }
            >
              {recognition.needsSettings
                ? t("arrangements.ai.openArrangementSettings")
                : t("arrangements.ai.retry")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
