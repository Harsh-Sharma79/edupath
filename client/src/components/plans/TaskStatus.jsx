import React from "react";
const statusConfig = {
  completed: {
    label: "Completed",
    icon: "check",
    variants: {
      soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
      solid: "border-emerald-600 bg-emerald-600 text-white",
      outline: "border-emerald-300 bg-white text-emerald-700",
    },
  },
  "in-progress": {
    label: "In Progress",
    icon: "progress",
    variants: {
      soft: "border-indigo-200 bg-indigo-50 text-indigo-700",
      solid: "border-indigo-600 bg-indigo-600 text-white",
      outline: "border-indigo-300 bg-white text-indigo-700",
    },
  },
  pending: {
    label: "Pending",
    icon: "circle",
    variants: {
      soft: "border-slate-200 bg-slate-100 text-slate-600",
      solid: "border-slate-600 bg-slate-600 text-white",
      outline: "border-slate-300 bg-white text-slate-600",
    },
  },
  locked: {
    label: "Locked",
    icon: "lock",
    variants: {
      soft: "border-slate-200 bg-slate-100 text-slate-500",
      solid: "border-slate-500 bg-slate-500 text-white",
      outline: "border-slate-300 bg-white text-slate-500",
    },
  },
  skipped: {
    label: "Skipped",
    icon: "dash",
    variants: {
      soft: "border-amber-200 bg-amber-50 text-amber-700",
      solid: "border-amber-500 bg-amber-500 text-white",
      outline: "border-amber-300 bg-white text-amber-700",
    },
  },
};

const sizeClasses = {
  sm: "gap-1 px-2 py-0.5 text-[11px]",
  md: "gap-1.5 px-2.5 py-1 text-xs",
  lg: "gap-2 px-3 py-1.5 text-sm",
};

function StatusIcon({ icon }) {
  if (icon === "check") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
        <path d="m3 8.25 3.1 3.1L13 4.75" />
      </svg>
    );
  }

  if (icon === "progress") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 4.5v3.75l2.25 1.5" />
      </svg>
    );
  }

  if (icon === "lock") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.7">
        <rect x="3.25" y="7" width="9.5" height="6.25" rx="1.5" />
        <path d="M5.25 7V5.5a2.75 2.75 0 0 1 5.5 0V7" />
      </svg>
    );
  }

  if (icon === "dash") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
        <path d="M4 8h8" />
      </svg>
    );
  }

  if (icon === "circle") {
    return <span className="block h-1.5 w-1.5 rounded-full bg-current" />;
  }

  return null;
}

export default function TaskStatus({
  status = "pending",
  size = "md",
  variant = "soft",
  showIcon = true,
  showLabel = true,
  label,
  className = "",
}) {
  const normalizedStatus = String(status || "pending").trim().toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.pending;
  const safeSize = sizeClasses[size] ? size : "md";
  const safeVariant = config.variants[variant] ? variant : "soft";
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full border font-semibold leading-none transition-colors duration-200 ${sizeClasses[safeSize]} ${config.variants[safeVariant]} ${className}`}
      aria-label={displayLabel}
      title={displayLabel}
    >
      {showIcon && (
        <span className="flex shrink-0 items-center justify-center" aria-hidden="true">
          <StatusIcon icon={config.icon} />
        </span>
      )}
      {showLabel && <span className="break-words">{displayLabel}</span>}
    </span>
  );
}
