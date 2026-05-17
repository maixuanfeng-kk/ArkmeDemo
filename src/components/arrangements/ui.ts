import type { ArrangementStatus } from "@/data/arrangements";
import type { ArrangementInfoTone } from "@/components/arrangements/types";

export function getArrangementInfoToneClass(tone: ArrangementInfoTone) {
  if (tone === "time") {
    return {
      container:
        "border-primary/15 bg-[rgba(9,184,62,0.08)] font-semibold text-primary",
      icon: "text-primary",
      label: "text-primary",
      detail: "border-primary/12 bg-[rgba(9,184,62,0.07)]",
      iconBox: "bg-[rgba(255,255,255,0.88)] text-primary",
    };
  }

  if (tone === "person") {
    return {
      container:
        "border-[rgba(11,141,239,0.14)] bg-[rgba(11,141,239,0.08)] font-semibold text-[var(--tag-blue)]",
      icon: "text-[var(--tag-blue)]",
      label: "text-[var(--tag-blue)]",
      detail: "border-[rgba(11,141,239,0.12)] bg-[rgba(11,141,239,0.06)]",
      iconBox: "bg-[rgba(255,255,255,0.88)] text-[var(--tag-blue)]",
    };
  }

  return {
    container:
      "border-[rgba(43,43,43,0.06)] bg-[rgba(43,43,43,0.035)] text-text-muted",
    icon: "text-text-tertiary",
    label: "text-text-muted",
    detail: "border-[rgba(43,43,43,0.05)] bg-[rgba(255,255,255,0.75)]",
    iconBox: "bg-[rgba(255,255,255,0.88)] text-text-tertiary",
  };
}

export function getArrangementStatusClass(status: ArrangementStatus) {
  if (status === "completed") {
    return {
      iconClass:
        "bg-[rgba(9,184,62,0.1)] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
      badgeClass:
        "border border-primary/12 bg-[rgba(9,184,62,0.08)] text-primary",
    };
  }

  if (status === "later") {
    return {
      iconClass:
        "bg-[rgba(131,99,255,0.12)] text-vip shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
      badgeClass:
        "border border-[rgba(131,99,255,0.12)] bg-[rgba(131,99,255,0.08)] text-vip",
    };
  }

  return {
    iconClass:
      "bg-[rgba(43,43,43,0.04)] text-text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
    badgeClass:
      "border border-[rgba(43,43,43,0.06)] bg-[rgba(43,43,43,0.04)] text-text-muted",
  };
}

export function formatTimestamp(value: number, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  } catch {
    return new Date(value).toLocaleString();
  }
}
