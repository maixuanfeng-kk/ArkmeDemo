import React from "react";
import type { ArrangementInfoTone } from "@/components/arrangements/types";
import { getArrangementInfoToneClass } from "@/components/arrangements/ui";
import { cn } from "@/lib/utils";

export default function ArrangementDetailRow({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: ArrangementInfoTone;
}) {
  const toneClass = getArrangementInfoToneClass(tone);

  return (
    <div
      className={cn(
        "flex gap-3 rounded-[16px] border px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
        toneClass.detail
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px]",
          toneClass.iconBox
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] font-medium leading-4", toneClass.label)}>{label}</p>
        <p
          className={cn(
            "mt-1 whitespace-pre-wrap break-words text-[14px] leading-5",
            tone === "default" ? "text-text" : "font-semibold text-text"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
