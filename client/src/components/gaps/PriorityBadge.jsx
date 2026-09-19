import React from "react";
const priorityConfig = {
  low: {
    label: "Low",
    icon: "✓",
    accessibleLabel: "Low priority",
    soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    solid: "border-emerald-600 bg-emerald-600 text-white",
    outline: "border-emerald-300 bg-transparent text-emerald-700",
  },
  medium: {
    label: "Medium",
    icon: "•",
    accessibleLabel: "Medium priority",
    soft: "border-amber-200 bg-amber-50 text-amber-700",
    solid: "border-amber-500 bg-amber-500 text-white",
    outline: "border-amber-300 bg-transparent text-amber-700",
  },
  high: {
    label: "High",
    icon: "!",
    accessibleLabel: "High priority",
    soft: "border-orange-200 bg-orange-50 text-orange-700",
    solid: "border-orange-500 bg-orange-500 text-white",
    outline: "border-orange-300 bg-transparent text-orange-700",
  },
  critical: {
    label: "Critical",
    icon: "!!",
    accessibleLabel: "Critical priority",
    soft: "border-rose-200 bg-rose-50 text-rose-700",
    solid: "border-rose-600 bg-rose-600 text-white",
    outline: "border-rose-300 bg-transparent text-rose-700",
  },
};

const sizeClasses = {
  sm: "gap-1 px-2 py-0.5 text-[11px]",
  md: "gap-1.5 px-2.5 py-1 text-xs",
  lg: "gap-2 px-3 py-1.5 text-sm",
};

export default function PriorityBadge({
  priority = "medium",
  showIcon = true,
  size = "md",
  variant = "soft",
  className = "",
  showLabel = true,
  label,
}) {
  const normalizedPriority = String(priority || "medium").trim().toLowerCase();
  const config = priorityConfig[normalizedPriority] || priorityConfig.medium;
  const safeSize = sizeClasses[size] ? size : "md";
  const safeVariant = config[variant] ? variant : "soft";
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full border font-semibold leading-none transition-colors duration-200 ${sizeClasses[safeSize]} ${config[safeVariant]} ${className}`}
      aria-label={showLabel ? undefined : config.accessibleLabel}
      title={showLabel ? undefined : config.accessibleLabel}
    >
      {showIcon && (
        <span className="shrink-0 font-bold" aria-hidden="true">
          {config.icon}
        </span>
      )}
      {showLabel && <span className="break-words">{displayLabel}</span>}
    </span>
  );
}
