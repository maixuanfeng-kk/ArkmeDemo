import type { ArrangementViewMode } from "@/components/arrangements/types";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

const viewModes: ArrangementViewMode[] = ["list", "calendar"];

export default function ArrangementViewSwitch({
  viewMode,
  onChange,
}: {
  viewMode: ArrangementViewMode;
  onChange: (viewMode: ArrangementViewMode) => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.7)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="grid grid-cols-2 gap-1">
        {viewModes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={cn(
              "h-10 rounded-[14px] text-[13px] font-semibold leading-4 transition active:scale-[0.98]",
              viewMode === mode
                ? "bg-[rgba(255,255,255,0.96)] text-text shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                : "text-text-tertiary"
            )}
            onClick={() => onChange(mode)}
          >
            {t(`arrangements.view.${mode}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
