import { XIcon } from "@/components/arrangements/icons";
import ArrangementTimeFields from "@/components/arrangements/ArrangementTimeFields";
import type {
  ArrangementFormState,
  ArrangementInfoTone,
} from "@/components/arrangements/types";
import { getArrangementInfoToneClass } from "@/components/arrangements/ui";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementCreateSheet({
  form,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  form: ArrangementFormState;
  error: string;
  onChange: (key: keyof ArrangementFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay-light"
        onClick={onClose}
        aria-label={t("arrangements.closeCreate")}
      />
      <form
        className="relative max-h-[90%] overflow-y-auto rounded-t-[20px] bg-bg px-4 pb-5 pt-4 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold leading-6 text-text">
            {t("arrangements.createTitle")}
          </h2>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-text-muted transition hover:bg-hover-overlay active:scale-[0.96]"
            onClick={onClose}
            aria-label={t("arrangements.closeCreate")}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <ArrangementField
            id="arrangement-title"
            label={t("arrangements.field.title")}
            value={form.title}
            placeholder={t("arrangements.placeholder.title")}
            autoFocus
            onChange={(value) => onChange("title", value)}
          />
          <ArrangementTimeFields form={form} onChange={onChange} />
          <ArrangementField
            id="arrangement-person"
            label={t("arrangements.field.person")}
            value={form.personText}
            placeholder={t("arrangements.placeholder.person")}
            tone="person"
            onChange={(value) => onChange("personText", value)}
          />
          <ArrangementField
            id="arrangement-place"
            label={t("arrangements.field.place")}
            value={form.placeText}
            placeholder={t("arrangements.placeholder.place")}
            onChange={(value) => onChange("placeText", value)}
          />
          <ArrangementTextarea
            id="arrangement-note"
            label={t("arrangements.field.note")}
            value={form.note}
            placeholder={t("arrangements.placeholder.note")}
            onChange={(value) => onChange("note", value)}
          />
        </div>

        {error && (
          <p className="mt-3 rounded-[8px] bg-primary-soft px-3 py-2 text-[12px] leading-5 text-primary">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-[8px] bg-primary text-[15px] font-semibold text-on-primary transition active:scale-[0.98]"
        >
          {t("arrangements.create")}
        </button>
      </form>
    </div>
  );
}

function ArrangementField({
  id,
  label,
  value,
  placeholder,
  autoFocus,
  tone = "default",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoFocus?: boolean;
  tone?: ArrangementInfoTone;
  onChange: (value: string) => void;
}) {
  const toneClass = getArrangementInfoToneClass(tone);

  return (
    <label htmlFor={id} className="block">
      <span className={cn("text-[13px] font-medium leading-5", toneClass.label)}>
        {label}
      </span>
      <input
        id={id}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-[8px] border border-border-light bg-surface px-3 text-[15px] text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:bg-input-bg-focus"
      />
    </label>
  );
}

function ArrangementTextarea({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[13px] font-medium leading-5 text-text-muted">
        {label}
      </span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-1 min-h-[88px] w-full resize-none rounded-[8px] border border-border-light bg-surface px-3 py-2.5 text-[15px] leading-6 text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:bg-input-bg-focus"
      />
    </label>
  );
}
