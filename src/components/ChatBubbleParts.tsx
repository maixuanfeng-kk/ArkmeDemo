import { cn } from "@/lib/utils";

export function ChatBubbleInlineAction({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "record" | "primary";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "mt-2.5 inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-[8px] border px-2 py-1 text-left text-[12px] font-semibold leading-4 transition active:scale-[0.98]",
        variant === "primary"
          ? "border-white/25 bg-white/12 text-on-primary"
          : "border-primary/20 bg-primary-soft text-primary hover:bg-primary-soft/80"
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
        <LightningIcon />
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

export function SelfMessageAvatar({ label }: { label: string }) {
  return (
    <div
      className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold leading-none text-on-primary"
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function ActionMenuButton({
  icon,
  label,
  onClick,
}: {
  icon: "copy" | "detail" | "open" | "reply";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-col items-center gap-1 rounded-[10px] px-1.5 py-2 text-[11px] leading-4 text-text-tertiary transition hover:bg-hover-overlay hover:text-text active:scale-[0.97]"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
        <ActionMenuIcon icon={icon} />
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
}

function LightningIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </svg>
  );
}

function ActionMenuIcon({ icon }: { icon: "copy" | "detail" | "open" | "reply" }) {
  if (icon === "copy") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }

  if (icon === "open") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
    );
  }

  if (icon === "detail") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 17-5-5 5-5" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
