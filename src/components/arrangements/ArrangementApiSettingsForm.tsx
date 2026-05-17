import { KeyIcon } from "@/components/arrangements/icons";
import ArrangementModelSelect from "@/components/arrangements/ArrangementModelSelect";
import type { ArrangementAiSettings } from "@/data/aiSettings";
import type { ArrangementModelOption } from "@/services/arrangementModels";
import { usePreferences } from "@/settings/preferences";

type SettingKey = keyof ArrangementAiSettings;

export default function ArrangementApiSettingsForm({
  settings,
  modelOptions,
  modelMessage,
  isLoadingModels,
  savedMessage,
  onChange,
  onLoadModels,
  onSave,
}: {
  settings: ArrangementAiSettings;
  modelOptions: ArrangementModelOption[];
  modelMessage: string;
  isLoadingModels: boolean;
  savedMessage: string;
  onChange: (key: SettingKey, value: string) => void;
  onLoadModels: () => void;
  onSave: () => void;
}) {
  const { t } = usePreferences();

  return (
    <section className="rounded-[8px] border border-border-light bg-surface px-3 py-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-soft text-primary">
          <KeyIcon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-[15px] font-semibold leading-5 text-text">
            {t("arrangements.ai.apiTitle")}
          </h3>
          <p className="text-[11px] leading-4 text-text-tertiary">
            {t("arrangements.ai.localNote")}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <SettingsInput
          label={t("arrangements.ai.baseUrl")}
          value={settings.baseUrl}
          onChange={(value) => onChange("baseUrl", value)}
        />
        <SettingsInput
          label={t("arrangements.ai.apiKey")}
          value={settings.apiKey}
          type="password"
          onChange={(value) => onChange("apiKey", value)}
        />
        <ArrangementModelSelect
          model={settings.model}
          options={modelOptions}
          message={modelMessage}
          isLoading={isLoadingModels}
          onChange={(value) => onChange("model", value)}
          onLoad={onLoadModels}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 shrink-0 items-center justify-center rounded-[8px] bg-text px-3 text-[13px] font-semibold text-bg transition active:scale-[0.98]"
          onClick={onSave}
        >
          {t("arrangements.ai.saveApi")}
        </button>
        {savedMessage && (
          <p className="min-w-0 text-[12px] leading-5 text-primary">{savedMessage}</p>
        )}
      </div>
    </section>
  );
}

function SettingsInput({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "password";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium leading-4 text-text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-[8px] border border-border-light bg-bg px-3 text-[13px] text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:bg-input-bg-focus"
      />
    </label>
  );
}
