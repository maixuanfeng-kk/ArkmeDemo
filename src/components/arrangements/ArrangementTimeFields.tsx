import type {
  ArrangementFormState,
  ArrangementTimeKind,
} from "@/components/arrangements/types";
import ArrangementDateTimeSelect from "@/components/arrangements/ArrangementDateTimeSelect";
import ArrangementReminderControls from "@/components/arrangements/ArrangementReminderControls";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

const timeKindOrder: ArrangementTimeKind[] = ["due", "range", "reminder"];

export default function ArrangementTimeFields({
  form,
  compact = false,
  onChange,
}: {
  form: ArrangementFormState;
  compact?: boolean;
  onChange: (key: keyof ArrangementFormState, value: string) => void;
}) {
  const { t } = usePreferences();
  const timeKind = form.timeKind ?? "due";
  const primaryConfig = getPrimaryTimeConfig(timeKind);
  const primaryValue = timeKind === "reminder" ? form.reminderText ?? "" : form.timeText;

  return (
    <div className="space-y-2.5">
      <div>
        <span className="text-[13px] font-medium leading-5 text-primary">
          {t("arrangements.field.timeKind")}
        </span>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-[8px] bg-surface p-1">
          {timeKindOrder.map((kind) => (
            <button
              key={kind}
              type="button"
              className={cn(
                "h-9 rounded-[7px] px-1 text-[12px] font-semibold leading-4 transition active:scale-[0.98]",
                timeKind === kind
                  ? "bg-bg text-primary shadow-[0_1px_6px_rgba(15,23,42,0.08)]"
                  : "text-text-tertiary"
              )}
              onClick={() => onChange("timeKind", kind)}
            >
              {t(`arrangements.timeKind.${kind}`)}
            </button>
          ))}
        </div>
      </div>

      <ArrangementDateTimeSelect
        label={t(primaryConfig.labelKey)}
        value={primaryValue}
        compact={compact}
        defaultTime={primaryConfig.defaultTime}
        onChange={(value) =>
          onChange(timeKind === "reminder" ? "reminderText" : "timeText", value)
        }
      />

      {timeKind === "range" && (
        <ArrangementDateTimeSelect
          label={t("arrangements.field.endTime")}
          value={form.endTimeText ?? ""}
          compact={compact}
          defaultTime="18:00"
          onChange={(value) => onChange("endTimeText", value)}
        />
      )}

      {timeKind !== "reminder" && (
        <ArrangementDateTimeSelect
          label={t("arrangements.field.reminderTime")}
          value={form.reminderText ?? ""}
          compact={compact}
          defaultTime="09:00"
          onChange={(value) => onChange("reminderText", value)}
        />
      )}

      <ArrangementReminderControls
        form={form}
        compact={compact}
        onChange={onChange}
      />
    </div>
  );
}

function getPrimaryTimeConfig(timeKind: ArrangementTimeKind) {
  if (timeKind === "range") {
    return {
      labelKey: "arrangements.field.startTime",
      defaultTime: "09:00",
    };
  }
  if (timeKind === "reminder") {
    return {
      labelKey: "arrangements.field.reminderTime",
      defaultTime: "09:00",
    };
  }
  return {
    labelKey: "arrangements.field.deadlineTime",
    defaultTime: "18:00",
  };
}
