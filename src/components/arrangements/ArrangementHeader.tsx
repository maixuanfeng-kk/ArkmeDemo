import ArrangementFilterTabs from "@/components/arrangements/ArrangementFilterTabs";
import { PlusIcon, SparkleIcon } from "@/components/arrangements/icons";
import type { ArrangementFilter } from "@/components/arrangements/types";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementHeader({
  activeFilter,
  counts,
  todayLabel,
  onAiOpen,
  onCreate,
  onFilterChange,
}: {
  activeFilter: ArrangementFilter;
  counts: Record<ArrangementFilter, number>;
  todayLabel: string;
  onAiOpen: () => void;
  onCreate: () => void;
  onFilterChange: (filter: ArrangementFilter) => void;
}) {
  const { t } = usePreferences();

  return (
    <header className="shrink-0 px-4 pb-3 pt-4">
      <div className="rounded-[24px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,250,248,0.94)_100%)] px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium leading-4 text-text-tertiary">
              {todayLabel}
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] text-text">
              {t("arrangements.title")}
            </h1>
            <p className="mt-2 max-w-[15rem] text-[13px] leading-5 text-text-muted">
              {t("arrangements.subtitle")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton label={t("arrangements.new")} tone="primary" onClick={onCreate}>
              <PlusIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center gap-3 rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.72)] px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition active:scale-[0.99]"
          onClick={onAiOpen}
          aria-label={t("arrangements.ai.open")}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[rgba(9,184,62,0.1)] text-primary">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-5 text-text">
              {t("arrangements.ai.entryTitle")}
            </span>
            <span className="mt-1 block text-[12px] leading-4 text-text-muted">
              {t("arrangements.ai.entryDesc")}
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-primary/12 bg-[rgba(9,184,62,0.08)] px-2.5 py-1 text-[11px] font-semibold leading-4 text-primary">
            AI
          </span>
        </button>
      </div>

      <ArrangementFilterTabs
        activeFilter={activeFilter}
        counts={counts}
        onChange={onFilterChange}
      />
    </header>
  );
}

function IconButton({
  children,
  label,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  tone: "primary" | "soft";
  onClick: () => void;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary text-on-primary shadow-[0_12px_24px_rgba(9,184,62,0.2)]"
      : "bg-primary-soft text-primary";

  return (
    <button
      type="button"
      className={`flex h-11 w-11 items-center justify-center rounded-[16px] transition active:scale-[0.96] ${toneClass}`}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
