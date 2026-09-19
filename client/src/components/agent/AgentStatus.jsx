import React from "react";
const statusConfig = {
  online: { label: "Online", tone: "green", icon: "check", active: false },
  working: { label: "Working", tone: "blue", icon: "activity", active: true },
  analyzing: { label: "Analyzing", tone: "blue", icon: "search", active: true },
  planning: { label: "Planning", tone: "violet", icon: "plan", active: true },
  updating: { label: "Updating", tone: "violet", icon: "refresh", active: true },
  completed: { label: "Completed", tone: "green", icon: "check", active: false },
  paused: { label: "Paused", tone: "amber", icon: "pause", active: false },
  error: { label: "Error", tone: "red", icon: "warning", active: false },
  offline: { label: "Offline", tone: "gray", icon: "minus", active: false },
};

const toneVariants = {
  green: {
    soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    solid: "border-emerald-600 bg-emerald-600 text-white",
    outline: "border-emerald-300 bg-white text-emerald-700",
    dot: "bg-emerald-500",
  },
  blue: {
    soft: "border-blue-200 bg-blue-50 text-blue-700",
    solid: "border-blue-600 bg-blue-600 text-white",
    outline: "border-blue-300 bg-white text-blue-700",
    dot: "bg-blue-500",
  },
  violet: {
    soft: "border-violet-200 bg-violet-50 text-violet-700",
    solid: "border-violet-600 bg-violet-600 text-white",
    outline: "border-violet-300 bg-white text-violet-700",
    dot: "bg-violet-500",
  },
  amber: {
    soft: "border-amber-200 bg-amber-50 text-amber-700",
    solid: "border-amber-500 bg-amber-500 text-white",
    outline: "border-amber-300 bg-white text-amber-700",
    dot: "bg-amber-500",
  },
  red: {
    soft: "border-rose-200 bg-rose-50 text-rose-700",
    solid: "border-rose-600 bg-rose-600 text-white",
    outline: "border-rose-300 bg-white text-rose-700",
    dot: "bg-rose-500",
  },
  gray: {
    soft: "border-slate-200 bg-slate-100 text-slate-600",
    solid: "border-slate-600 bg-slate-600 text-white",
    outline: "border-slate-300 bg-white text-slate-600",
    dot: "bg-slate-400",
  },
};

const sizeConfig = {
  sm: {
    container: "gap-1 px-2 py-0.5",
    text: "text-[11px]",
    icon: "h-3.5 w-3.5",
    dot: "h-1.5 w-1.5",
  },
  md: {
    container: "gap-1.5 px-2.5 py-1",
    text: "text-xs",
    icon: "h-4 w-4",
    dot: "h-2 w-2",
  },
  lg: {
    container: "gap-2 px-3 py-1.5",
    text: "text-sm",
    icon: "h-5 w-5",
    dot: "h-2.5 w-2.5",
  },
};

function StatusIcon({ name, className }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }

  if (name === "activity") {
    return (
      <svg {...props}>
        <path d="M3.5 12h4l2-6 4.5 12 2-6h4.5" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...props}>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="m15 15 4.25 4.25" />
      </svg>
    );
  }

  if (name === "plan") {
    return (
      <svg {...props}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...props}>
        <path d="M20 11a8 8 0 0 0-13.7-4.8L4 8.5M4 5v3.5h3.5M4 13a8 8 0 0 0 13.7 4.8L20 15.5M20 19v-3.5h-3.5" />
      </svg>
    );
  }

  if (name === "pause") {
    return (
      <svg {...props}>
        <path d="M8 5v14M16 5v14" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...props}>
        <path d="m12 4 8 15H4L12 4Z" />
        <path d="M12 9v4M12 16.5v.1" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export default function AgentStatus({
  status = "online",
  label,
  size = "md",
  variant = "soft",
  showIcon = false,
  showLabel = true,
  showDot = true,
  className = "",
}) {
  const normalizedStatus = String(status || "online").trim().toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.offline;
  const safeSize = sizeConfig[size] ? size : "md";
  const safeVariant = ["soft", "solid", "outline", "minimal"].includes(variant)
    ? variant
    : "soft";
  const tone = toneVariants[config.tone];
  const displayLabel = label || config.label;
  const containerStyle =
    safeVariant === "minimal"
      ? "border-transparent bg-transparent px-0 py-0 shadow-none"
      : tone[safeVariant];
  const dotAnimation = config.active
    ? "motion-safe:animate-pulse motion-reduce:animate-none"
    : "";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border font-semibold leading-none transition-colors duration-200 ${sizeConfig[safeSize].container} ${sizeConfig[safeSize].text} ${containerStyle} ${className}`}
      aria-label={displayLabel}
      title={displayLabel}
    >
      {showDot && (
        <span
          className={`shrink-0 rounded-full ${sizeConfig[safeSize].dot} ${tone.dot} ${dotAnimation}`}
          aria-hidden="true"
        />
      )}
      {showIcon && (
        <span className="flex shrink-0 items-center justify-center" aria-hidden="true">
          <StatusIcon name={config.icon} className={sizeConfig[safeSize].icon} />
        </span>
      )}
      {showLabel && <span className="break-words">{displayLabel}</span>}
    </span>
  );
}
