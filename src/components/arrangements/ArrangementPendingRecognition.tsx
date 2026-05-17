import type { ArrangementAiMetadata, ArrangementFormState } from "@/components/arrangements/types";
import ArrangementTimeFields from "@/components/arrangements/ArrangementTimeFields";
import { formatTimestamp } from "@/components/arrangements/ui";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementPendingRecognition({
  form,
  metadata,
  onChange,
  onConfirm,
  onIgnore,
}: {
  form: ArrangementFormState;
  metadata: ArrangementAiMetadata;
  onChange: (key: keyof ArrangementFormState, value: string) => void;
  onConfirm: () => void;
  onIgnore: () => void;
}) {
  const { resolvedLocale, t } = usePreferences();
  const confidence = `${Math.round(metadata.recognitionConfidence * 100)}%`;
  const sourceTime =
    typeof metadata.sourceSentAt === "number"
      ? formatTimestamp(metadata.sourceSentAt, resolvedLocale)
      : "";

  return (
    <section className="rounded-[8px] border border-primary/20 bg-primary-soft/60 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold leading-5 text-text">
            {t("arrangements.ai.pendingTitle")}
          </h3>
          <p className="mt-0.5 text-[12px] leading-5 text-text-muted">
            {t("arrangements.ai.pendingDesc")}
          </p>
        </div>
        <span className="shrink-0 rounded-[7px] bg-bg px-2 py-1 text-[11px] font-semibold leading-4 text-primary">
          {confidence}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <PendingInput
          label={t("arrangements.field.title")}
          value={form.title}
          onChange={(value) => onChange("title", value)}
        />
        <ArrangementTimeFields form={form} compact onChange={onChange} />
        <PendingInput
          label={t("arrangements.field.person")}
          value={form.personText}
          onChange={(value) => onChange("personText", value)}
        />
        <PendingInput
          label={t("arrangements.field.place")}
          value={form.placeText}
          onChange={(value) => onChange("placeText", value)}
        />
        <PendingInput
          label={t("arrangements.field.note")}
          value={form.note}
          onChange={(value) => onChange("note", value)}
        />
      </div>
      <div className="mt-3 space-y-1.5 text-[12px] leading-5 text-text-muted">
        {metadata.mergeTargetTitle && (
          <p className="rounded-[8px] bg-bg px-2.5 py-2 text-primary">
            <span className="font-semibold">{t("arrangements.ai.mergeTarget")}：</span>
            {metadata.mergeTargetTitle}
          </p>
        )}
        {metadata.sourceLabel && (
          <p>
            <span className="font-semibold text-text">{t("arrangements.ai.sourceLocation")}：</span>
            {metadata.sourceLabel}
          </p>
        )}
        {sourceTime && (
          <p>
            <span className="font-semibold text-text">{t("arrangements.ai.sourceTime")}：</span>
            {sourceTime}
          </p>
        )}
        <p>
          <span className="font-semibold text-text">{t("arrangements.ai.source")}：</span>
          {metadata.sourceText}
        </p>
        {metadata.recognitionReason && (
          <p>
            <span className="font-semibold text-text">{t("arrangements.ai.reason")}：</span>
            {metadata.recognitionReason}
          </p>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex h-10 items-center justify-center rounded-[8px] border border-border bg-surface text-[14px] font-semibold text-text transition active:scale-[0.98]"
          onClick={onIgnore}
        >
          {t("arrangements.ai.ignore")}
        </button>
        <button
          type="button"
          className="flex h-10 items-center justify-center rounded-[8px] bg-primary text-[14px] font-semibold text-on-primary transition active:scale-[0.98]"
          onClick={onConfirm}
        >
          {t("arrangements.ai.confirmCreate")}
        </button>
      </div>
    </section>
  );
}
function PendingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium leading-4 text-text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-[8px] border border-border-light bg-bg px-2.5 text-[13px] text-text outline-none transition focus:border-primary"
      />
    </label>
  );
}
