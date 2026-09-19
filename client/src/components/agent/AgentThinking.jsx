const statusConfig = {
  thinking: {
    label: "Thinking",
    message: "EduPath AI is working...",
    icon: "sparkle",
    classes: "border-violet-100 bg-violet-50 text-violet-700",
    isProcessing: true,
  },
  analyzing: {
    label: "Analyzing",
    message: "Analyzing your skills...",
    icon: "chart",
    classes: "border-indigo-100 bg-indigo-50 text-indigo-700",
    isProcessing: true,
  },
  planning: {
    label: "Planning",
    message: "Building your learning plan...",
    icon: "map",
    classes: "border-violet-100 bg-violet-50 text-violet-700",
    isProcessing: true,
  },
  updating: {
    label: "Updating",
    message: "Updating recommendations...",
    icon: "refresh",
    classes: "border-blue-100 bg-blue-50 text-blue-700",
    isProcessing: true,
  },
  success: {
    label: "Complete",
    message: "Your next steps are ready.",
    icon: "check",
    classes: "border-emerald-100 bg-emerald-50 text-emerald-700",
    isProcessing: false,
  },
  error: {
    label: "Needs attention",
    message: "EduPath AI could not complete that update.",
    icon: "warning",
    classes: "border-rose-100 bg-rose-50 text-rose-700",
    isProcessing: false,
  },
};

const sizeConfig = {
  sm: {
    container: "gap-2 rounded-lg px-3 py-2",
    icon: "h-7 w-7",
    iconSvg: "h-3.5 w-3.5",
    label: "text-[10px]",
    message: "text-xs",
  },
  md: {
    container: "gap-3 rounded-xl px-4 py-3",
    icon: "h-9 w-9",
    iconSvg: "h-4 w-4",
    label: "text-[11px]",
    message: "text-sm",
  },
  lg: {
    container: "gap-3.5 rounded-xl px-5 py-4",
    icon: "h-11 w-11",
    iconSvg: "h-5 w-5",
    label: "text-xs",
    message: "text-base",
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

  if (name === "chart") {
    return (
      <svg {...props}>
        <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...props}>
        <path d="m4 6.5 5-2 6 2 5-2v13l-5 2-6-2-5 2v-13Z" />
        <path d="M9 4.5v13M15 6.5v13" />
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

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
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
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
    </svg>
  );
}

function ActivityDots({ animated, size }) {
  const dotSize = size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1";
  const animation = animated ? "animate-bounce motion-reduce:animate-none" : "";

  return (
    <span className="ml-1 inline-flex items-center gap-1" aria-hidden="true">
      <span className={`${dotSize} rounded-full bg-current opacity-60 ${animation}`} />
      <span
        className={`${dotSize} rounded-full bg-current opacity-60 delay-150 ${animation}`}
      />
      <span
        className={`${dotSize} rounded-full bg-current opacity-60 delay-300 ${animation}`}
      />
    </span>
  );
}

export default function AgentThinking({
  message,
  status = "thinking",
  size = "md",
  showIcon = true,
  animated = true,
  className = "",
}) {
  const normalizedStatus = String(status || "thinking").trim().toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.thinking;
  const safeSize = sizeConfig[size] ? size : "md";
  const displayMessage = message || config.message;
  const animation = animated
    ? "motion-safe:animate-pulse motion-reduce:animate-none"
    : "";

  return (
    <div
      className={`inline-flex max-w-full items-center border shadow-sm ${sizeConfig[safeSize].container} ${config.classes} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={config.isProcessing}
    >
      {showIcon && (
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg bg-white/70 ${sizeConfig[safeSize].icon} ${animation}`}
          aria-hidden="true"
        >
          <StatusIcon name={config.icon} className={sizeConfig[safeSize].iconSvg} />
        </span>
      )}

      <span className="min-w-0">
        <span
          className={`flex flex-wrap items-center font-semibold uppercase tracking-wide ${sizeConfig[safeSize].label}`}
        >
          {config.label}
          {config.isProcessing && animated && <ActivityDots animated={animated} size={safeSize} />}
        </span>
        <span className={`mt-0.5 block break-words font-medium ${sizeConfig[safeSize].message}`}>
          {displayMessage}
        </span>
      </span>
    </div>
  );
}
