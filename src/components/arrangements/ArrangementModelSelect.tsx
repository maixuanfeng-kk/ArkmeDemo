import { RefreshIcon } from "@/components/arrangements/icons";
import type { ArrangementModelOption } from "@/services/arrangementModels";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementModelSelect({
  model,
  options,
  message,
  isLoading,
  onChange,
  onLoad,
}: {
  model: string;
  options: ArrangementModelOption[];
  message: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onLoad: () => void;
}) {
  const { t } = usePreferences();
  const selectedModel = options.some((option) => option.id === model) ? model : "";

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium leading-4 text-text-muted">
          {t("arrangements.ai.model")}
        </span>
        <button
          type="button"
          className="flex h-8 shrink-0 items-center gap-1 rounded-[8px] border border-border-light bg-bg px-2.5 text-[12px] font-medium text-text transition active:scale-[0.98] disabled:opacity-60"
          disabled={isLoading}
          onClick={onLoad}
        >
          <RefreshIcon className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          {isLoading ? t("arrangements.ai.loadingModels") : t("arrangements.ai.loadModels")}
        </button>
      </div>

      <select
        value={selectedModel}
        disabled={!options.length}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-[8px] border border-border-light bg-bg px-3 text-[13px] text-text outline-none transition disabled:text-text-tertiary focus:border-primary focus:bg-input-bg-focus"
      >
        <option value="">{t("arrangements.ai.modelPlaceholder")}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.id}
          </option>
        ))}
      </select>

      {message && (
        <p className="mt-1 whitespace-pre-line text-[12px] leading-4 text-text-tertiary">
          {message}
        </p>
      )}
    </div>
  );
}
