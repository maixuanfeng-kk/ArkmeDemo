import {
  ArrangementStatusIcon,
  ClockIcon,
  PinIcon,
  UserIcon,
} from "@/components/arrangements/icons";
import { getArrangementTimeSummary } from "@/components/arrangements/arrangementTime";
import { formatTimestamp, getArrangementStatusClass } from "@/components/arrangements/ui";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";
import type { ArrangementInfoTone } from "@/components/arrangements/types";
import type { ArrangementItem } from "@/data/arrangements";
import { getArrangementInfoToneClass } from "@/components/arrangements/ui";

export default function ArrangementCard({
  arrangement,
  locale,
  onOpen,
}: {
  arrangement: ArrangementItem;
  locale: string;
  onOpen: () => void;
}) {
  const { t } = usePreferences();
  const statusClass = getArrangementStatusClass(arrangement.status);
  const timeSummary = getArrangementTimeSummary(arrangement, t);

  return (
    <button
      type="button"
      className="group w-full rounded-[20px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,248,246,0.92)_100%)] px-4 py-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
      onClick={onOpen}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {(arrangement.timeText || arrangement.reminderText) && (
              <ArrangementChip tone="time" icon={<ClockIcon className="h-3.5 w-3.5" />}>
                {timeSummary}
              </ArrangementChip>
            )}
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-1 text-[10px] font-semibold leading-4",
                statusClass.badgeClass
              )}
            >
              {t(`arrangements.status.${arrangement.status}`)}
            </span>
          </div>

          <h2 className="mt-3 min-w-0 break-words text-[18px] font-semibold leading-6 text-text">
            {arrangement.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {arrangement.personText && (
              <ArrangementChip tone="person" icon={<UserIcon className="h-3.5 w-3.5" />}>
                {arrangement.personText}
              </ArrangementChip>
            )}
            {arrangement.placeText && (
              <ArrangementChip icon={<PinIcon className="h-3.5 w-3.5" />}>
                {arrangement.placeText}
              </ArrangementChip>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-4 text-text-tertiary">
            {t("arrangements.updatedAt")} {formatTimestamp(arrangement.updatedAt, locale)}
          </p>
        </div>
        <span
          className={cn(
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] transition group-hover:scale-[1.02]",
            statusClass.iconClass
          )}
          aria-hidden="true"
        >
          <ArrangementStatusIcon className="h-5 w-5" status={arrangement.status} />
        </span>
      </div>
    </button>
  );
}

function ArrangementChip({
  icon,
  children,
  tone = "default",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: ArrangementInfoTone;
}) {
  const toneClass = getArrangementInfoToneClass(tone);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-4",
        toneClass.container
      )}
    >
      <span className={cn("shrink-0", toneClass.icon)}>{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
