import { SparkleIcon } from "@/components/arrangements/icons";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementRecognitionForm({
  text,
  error,
  isLoading,
  onTextChange,
  onRecognize,
}: {
  text: string;
  error: string;
  isLoading: boolean;
  onTextChange: (value: string) => void;
  onRecognize: () => void;
}) {
  const { t } = usePreferences();

  return (
    <section className="rounded-[8px] border border-border-light bg-surface px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold leading-5 text-text">
            {t("arrangements.ai.textTitle")}
          </h3>
          <p className="mt-0.5 text-[12px] leading-5 text-text-muted">
            {t("arrangements.ai.textDesc")}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-primary-soft text-primary">
          <SparkleIcon className="h-4 w-4" />
        </span>
      </div>

      <textarea
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder={t("arrangements.ai.textPlaceholder")}
        rows={4}
        className="mt-3 min-h-[104px] w-full resize-none rounded-[8px] border border-border-light bg-bg px-3 py-2.5 text-[15px] leading-6 text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:bg-input-bg-focus"
      />

      {error && (
        <p className="mt-2 whitespace-pre-wrap rounded-[8px] bg-primary-soft px-3 py-2 text-[12px] leading-5 text-primary">
          {error}
        </p>
      )}

      <button
        type="button"
        className="mt-3 flex h-11 w-full items-center justify-center rounded-[8px] bg-primary text-[15px] font-semibold text-on-primary transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        onClick={onRecognize}
        disabled={isLoading}
      >
        {isLoading ? t("arrangements.ai.recognizing") : t("arrangements.ai.recognize")}
      </button>
    </section>
  );
}
