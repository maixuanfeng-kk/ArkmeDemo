import type {
  ArrangementFormState,
  ArrangementReminderLead,
  ArrangementReminderRepeat,
} from "@/components/arrangements/types";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

const reminderLeadOptions: ArrangementReminderLead[] = [
  "none",
  "10m",
  "30m",
  "1h",
  "1d",
];
const reminderRepeatOptions: ArrangementReminderRepeat[] = ["none", "daily", "weekly"];

export default function ArrangementReminderControls({
  form,
  compact = false,
  onChange,
}: {
  form: ArrangementFormState;
  compact?: boolean;
  onChange: (key: keyof ArrangementFormState, value: string) => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="space-y-2.5">
      <ReminderOptionGroup
        label={t("arrangements.field.reminderLead")}
        options={reminderLeadOptions}
        value={form.reminderLead ?? "none"}
        compact={compact}
        labelFor={(option) => t(`arrangements.reminder.lead.${option}`)}
        onChange={(value) => onChange("reminderLead", value)}
      />
      <ReminderOptionGroup
        label={t("arrangements.field.reminderRepeat")}
        options={reminderRepeatOptions}
        value={form.reminderRepeat ?? "none"}
        compact={compact}
        labelFor={(option) => t(`arrangements.reminder.repeat.${option}`)}
        onChange={(value) => onChange("reminderRepeat", value)}
      />
    </div>
  );
}

function ReminderOptionGroup<Option extends string>({
  label,
  options,
  value,
  compact,
  labelFor,
  onChange,
}: {
  label: string;
  options: Option[];
  value: Option;
  compact: boolean;
  labelFor: (option: Option) => string;
  onChange: (value: Option) => void;
}) {
  return (
    <div>
      <span className="text-[13px] font-medium leading-5 text-primary">
        {label}
      </span>
      <div className="mt-1 flex flex-wrap gap-1 rounded-[8px] bg-surface p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              "min-w-[72px] flex-1 rounded-[7px] px-2 font-semibold transition active:scale-[0.98]",
              compact ? "h-8 text-[11px]" : "h-9 text-[12px]",
              value === option
                ? "bg-bg text-primary shadow-[0_1px_6px_rgba(15,23,42,0.08)]"
                : "text-text-tertiary"
            )}
            onClick={() => onChange(option)}
          >
            {labelFor(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
