import { XIcon } from "@/components/arrangements/icons";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementAiSheetHeader({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences();

  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-semibold leading-6 text-text">
        {t("arrangements.ai.sheetTitle")}
      </h2>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-[8px] text-text-muted transition hover:bg-hover-overlay active:scale-[0.96]"
        onClick={onClose}
        aria-label={t("arrangements.closeAi")}
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
