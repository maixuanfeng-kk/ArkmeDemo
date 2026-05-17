import { ClockIcon } from "@/components/arrangements/icons";
import { getArrangementTimeSummary } from "@/components/arrangements/arrangementTime";
import type { ArrangementItem } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementCalendarListItem({
  arrangement,
  onOpen,
}: {
  arrangement: ArrangementItem;
  onOpen: () => void;
}) {
  const { t } = usePreferences();

  return (
    <button
      type="button"
      className="w-full rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,246,0.92)_100%)] px-3 py-3 text-left transition active:scale-[0.99]"
      onClick={onOpen}
    >
      <p className="break-words text-[15px] font-semibold leading-5 text-text">
        {arrangement.title}
      </p>
      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-primary">
        <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{getArrangementTimeSummary(arrangement, t)}</span>
      </p>
    </button>
  );
}
