import {
  ArrangementStatusIcon,
  ClockIcon,
  PinIcon,
  UserIcon,
} from "@/components/arrangements/icons";
import { getArrangementTimeSummary } from "@/components/arrangements/arrangementTime";
import {
  formatTimestamp,
  getArrangementInfoToneClass,
  getArrangementStatusClass,
} from "@/components/arrangements/ui";
import type { ArrangementItem } from "@/data/arrangements";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementDetailHero({
  arrangement,
  locale,
  relatedSourceCount,
}: {
  arrangement: ArrangementItem;
  locale: string;
  relatedSourceCount: number;
}) {
  const { t } = usePreferences();
  const statusClass = getArrangementStatusClass(arrangement.status);
  const timeSummary = getArrangementTimeSummary(arrangement, t);

  return (
    <section className="rounded-[22px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,248,246,0.94)_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4",
                statusClass.badgeClass
              )}
            >
              {t(`arrangements.status.${arrangement.status}`)}
            </span>
            {arrangement.createdBy === "ai" && (
              <span className="inline-flex rounded-full border border-primary/12 bg-[rgba(9,184,62,0.08)] px-2.5 py-1 text-[11px] font-semibold leading-4 text-primary">
                {t("arrangements.ai.createdByAi")}
              </span>
            )}
            {relatedSourceCount > 1 && (
              <span className="inline-flex rounded-full border border-primary/12 bg-[rgba(9,184,62,0.08)] px-2.5 py-1 text-[11px] font-semibold leading-4 text-primary">
                {t("arrangements.ai.mergedContext")}
              </span>
            )}
          </div>

          {(arrangement.timeText || arrangement.reminderText) && (
            <SummaryChip className="mt-3" icon={<ClockIcon className="h-3.5 w-3.5" />} tone="time">
              {timeSummary}
            </SummaryChip>
          )}

          <h2 className="mt-3 break-words text-[24px] font-semibold leading-8 text-text">
            {arrangement.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {arrangement.personText && (
              <SummaryChip icon={<UserIcon className="h-3.5 w-3.5" />} tone="person">
                {arrangement.personText}
              </SummaryChip>
            )}
            {arrangement.placeText && (
              <SummaryChip icon={<PinIcon className="h-3.5 w-3.5" />}>
                {arrangement.placeText}
              </SummaryChip>
            )}
          </div>
        </div>

        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px]",
            statusClass.iconClass
          )}
        >
          <ArrangementStatusIcon className="h-5 w-5" status={arrangement.status} />
        </span>
      </div>

      <div className="mt-4 rounded-[16px] border border-[rgba(43,43,43,0.05)] bg-[rgba(255,255,255,0.72)] px-3 py-2.5">
        <p className="text-[11px] leading-4 text-text-tertiary">
          {t("arrangements.updatedAt")} {formatTimestamp(arrangement.updatedAt, locale)}
        </p>
      </div>
    </section>
  );
}

function SummaryChip({
  children,
  className = "",
  icon,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  icon: React.ReactNode;
  tone?: "default" | "time" | "person";
}) {
  const toneClass = getArrangementInfoToneClass(tone);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-4",
        toneClass.container,
        className
      )}
    >
      <span className={cn("shrink-0", toneClass.icon)}>{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
