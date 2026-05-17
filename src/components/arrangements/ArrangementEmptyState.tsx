import { CalendarIcon } from "@/components/arrangements/icons";
import type { ArrangementFilter } from "@/components/arrangements/types";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementEmptyState({
  filter,
  onCreate,
}: {
  filter: ArrangementFilter;
  onCreate: () => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="mt-4 flex min-h-[310px] flex-col items-center justify-center rounded-[24px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,246,0.92)_100%)] px-6 text-center shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[rgba(43,43,43,0.04)] text-text-tertiary">
        <CalendarIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-[18px] font-semibold leading-6 text-text">
        {t(`arrangements.empty.${filter}.title`)}
      </h2>
      <p className="mt-1 max-w-[240px] text-[13px] leading-5 text-text-muted">
        {t(`arrangements.empty.${filter}.desc`)}
      </p>
      {filter === "active" && (
        <button
          type="button"
          className="mt-5 rounded-[14px] bg-primary px-5 py-2.5 text-[14px] font-semibold leading-5 text-on-primary shadow-[0_12px_24px_rgba(9,184,62,0.18)] transition active:scale-[0.98]"
          onClick={onCreate}
        >
          {t("arrangements.new")}
        </button>
      )}
    </div>
  );
}
