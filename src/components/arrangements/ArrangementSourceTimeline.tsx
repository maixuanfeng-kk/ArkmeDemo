import { SparkleIcon } from "@/components/arrangements/icons";
import { formatTimestamp } from "@/components/arrangements/ui";
import type { ArrangementRelatedSource } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementSourceTimeline({
  sources,
}: {
  sources: ArrangementRelatedSource[];
}) {
  const { resolvedLocale, t } = usePreferences();
  if (sources.length === 0) return null;

  const countLabel = `${sources.length}${t("arrangements.ai.sourceUnit")}`;

  return (
    <section className="rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(9,184,62,0.1)] text-primary">
          <SparkleIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold leading-5 text-text">
              {t("arrangements.ai.contextTimeline")}
            </p>
            <span className="shrink-0 rounded-full border border-primary/12 bg-[rgba(9,184,62,0.08)] px-2.5 py-1 text-[11px] font-semibold leading-4 text-primary">
              {countLabel}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] leading-5 text-text-muted">
            {t("arrangements.ai.contextTimelineDesc")}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {sources.map((source, index) => (
          <TimelineItem
            key={source.id}
            index={index}
            source={source}
            locale={resolvedLocale}
          />
        ))}
      </div>
    </section>
  );
}

function TimelineItem({
  index,
  source,
  locale,
}: {
  index: number;
  source: ArrangementRelatedSource;
  locale: string;
}) {
  const { t } = usePreferences();
  const sourceTime =
    typeof source.sourceSentAt === "number"
      ? formatTimestamp(source.sourceSentAt, locale)
      : formatTimestamp(source.addedAt, locale);
  const confidence =
    typeof source.recognitionConfidence === "number"
      ? `${Math.round(source.recognitionConfidence * 100)}%`
      : "";
  const reason = [source.recognitionReason, confidence]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex gap-3">
      <div className="flex w-7 shrink-0 flex-col items-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg text-[11px] font-semibold text-primary">
          {index + 1}
        </span>
        <span className="mt-1 h-full min-h-5 w-px bg-primary/20" />
      </div>
      <div className="min-w-0 flex-1 rounded-[16px] border border-[rgba(43,43,43,0.05)] bg-[rgba(255,255,255,0.72)] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[12px] font-semibold leading-4 text-text">
            {source.sourceLabel || t("arrangements.ai.sourceLocation")}
          </span>
          <span className="text-[11px] leading-4 text-text-tertiary">
            {sourceTime}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-5 text-text">
          {source.sourceText}
        </p>
        {reason && (
          <p className="mt-1 text-[12px] leading-5 text-text-muted">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}
