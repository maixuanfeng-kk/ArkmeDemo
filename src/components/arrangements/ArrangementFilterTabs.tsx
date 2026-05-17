import type { ArrangementFilter } from "@/components/arrangements/types";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

const filterOrder: ArrangementFilter[] = ["active", "later", "completed"];

export default function ArrangementFilterTabs({
  activeFilter,
  counts,
  onChange,
}: {
  activeFilter: ArrangementFilter;
  counts: Record<ArrangementFilter, number>;
  onChange: (filter: ArrangementFilter) => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="mt-4 rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.7)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-1">
        {filterOrder.map((filter) => {
          const active = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              className={cn(
                "flex h-[46px] min-w-0 flex-col items-center justify-center rounded-[14px] px-1 text-center transition active:scale-[0.98]",
                active
                  ? "bg-[rgba(255,255,255,0.96)] text-text shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                  : "text-text-tertiary"
              )}
              onClick={() => onChange(filter)}
            >
              <span className="text-[13px] font-medium leading-4">
                {t(`arrangements.filter.${filter}`)}
              </span>
              <span
                className={cn(
                  "mt-1 rounded-full px-1.5 py-0.5 text-[10px] leading-3",
                  active
                    ? "bg-[rgba(43,43,43,0.05)] text-text-muted"
                    : "text-text-tertiary"
                )}
              >
                {formatCount(counts[filter], t("arrangements.itemUnit"))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatCount(count: number, unit: string) {
  return /^[a-zA-Z]/.test(unit) ? `${count} ${unit}` : `${count}${unit}`;
}
