import { TrashIcon } from "@/components/arrangements/icons";
import type { ArrangementItem, ArrangementStatus } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementDetailActions({
  arrangement,
  onDeleteRequest,
  onStatusRequest,
}: {
  arrangement: ArrangementItem;
  onDeleteRequest: () => void;
  onStatusRequest: (status: ArrangementStatus) => void;
}) {
  const { t } = usePreferences();

  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {arrangement.status !== "completed" && (
        <ActionButton
          label={t("arrangements.action.complete")}
          variant="primary"
          onClick={() => onStatusRequest("completed")}
        />
      )}
      {arrangement.status !== "later" && (
        <ActionButton
          label={t("arrangements.action.later")}
          onClick={() => onStatusRequest("later")}
        />
      )}
      {arrangement.status !== "active" && (
        <ActionButton
          className="col-span-2"
          label={t("arrangements.action.restore")}
          onClick={() => onStatusRequest("active")}
        />
      )}
      <ActionButton
        className="col-span-2"
        label={t("arrangements.action.delete")}
        variant="danger"
        icon={<TrashIcon className="h-4 w-4" />}
        onClick={onDeleteRequest}
      />
    </div>
  );
}

function ActionButton({
  className = "",
  icon,
  label,
  variant = "default",
  onClick,
}: {
  className?: string;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "primary" | "danger";
  onClick: () => void;
}) {
  const variantClass =
    variant === "primary"
      ? "bg-primary text-on-primary shadow-[0_10px_20px_rgba(9,184,62,0.16)]"
      : variant === "danger"
        ? "border border-danger/16 bg-[rgba(255,255,255,0.78)] text-danger"
        : "border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] text-text";

  return (
    <button
      type="button"
      className={`flex h-11 items-center justify-center gap-1.5 rounded-[14px] px-3 text-[14px] font-semibold transition active:scale-[0.98] ${variantClass} ${className}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
