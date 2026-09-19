import React from "react";
const activityTypeConfig = {
  analysis: {
    label: "Analysis",
    icon: "chart",
    iconClasses: "border-indigo-100 bg-indigo-50 text-indigo-600",
  },
  "skill-gap": {
    label: "Skill Gap",
    icon: "target",
    iconClasses: "border-orange-100 bg-orange-50 text-orange-600",
  },
  plan: {
    label: "Learning Plan",
    icon: "map",
    iconClasses: "border-violet-100 bg-violet-50 text-violet-600",
  },
  task: {
    label: "Task",
    icon: "check",
    iconClasses: "border-emerald-100 bg-emerald-50 text-emerald-600",
  },
  adaptation: {
    label: "Adaptation",
    icon: "sparkle",
    iconClasses: "border-violet-100 bg-violet-50 text-violet-600",
  },
  recommendation: {
    label: "Recommendation",
    icon: "lightbulb",
    iconClasses: "border-amber-100 bg-amber-50 text-amber-600",
  },
  success: {
    label: "Success",
    icon: "check",
    iconClasses: "border-emerald-100 bg-emerald-50 text-emerald-600",
  },
  info: {
    label: "Info",
    icon: "info",
    iconClasses: "border-slate-200 bg-slate-50 text-slate-600",
  },
  warning: {
    label: "Warning",
    icon: "warning",
    iconClasses: "border-amber-100 bg-amber-50 text-amber-600",
  },
};

const defaultTypeConfig = activityTypeConfig.info;

function ActivityIcon({ name }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (name === "chart") {
    return (
      <svg {...commonProps}>
        <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="3" />
        <path d="m17.5 6.5 2-2M19.5 4.5h-2.25M19.5 4.5v2.25" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...commonProps}>
        <path d="m4 6.5 5-2 6 2 5-2v13l-5 2-6-2-5 2v-13Z" />
        <path d="M9 4.5v13M15 6.5v13" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...commonProps}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }

  if (name === "sparkle") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      </svg>
    );
  }

  if (name === "lightbulb") {
    return (
      <svg {...commonProps}>
        <path d="M9 18h6M9.5 21h5M8 14.5a6 6 0 1 1 8 0c-.9.7-1.5 1.5-1.5 2.5h-5c0-1-.6-1.8-1.5-2.5Z" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...commonProps}>
        <path d="m12 4 8 15H4L12 4Z" />
        <path d="M12 9v4M12 16.5v.1" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 10v5M12 7.5v.1" />
    </svg>
  );
}

function ActivitySkeleton() {
  return (
    <li className="relative flex gap-3.5 sm:gap-4">
      <div
        className="relative z-10 flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-xl border border-slate-100 bg-slate-100"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 pb-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-slate-100" />
      </div>
    </li>
  );
}

function EmptyActivity({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600"
        aria-hidden="true"
      >
        <ActivityIcon name="sparkle" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}

function StatusLabel({ status }) {
  if (!status) return null;

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
      {String(status).replace(/[-_]/g, " ")}
    </span>
  );
}

export default function AgentActivity({
  activities = [],
  title = "Agent Activity",
  maxItems = 5,
  loading = false,
  emptyMessage = "No agent activity yet.",
  onViewAll,
  className = "",
}) {
  const safeActivities = Array.isArray(activities) ? activities : [];
  const visibleActivities =
    maxItems === undefined || maxItems === null
      ? safeActivities
      : safeActivities.slice(0, Math.max(0, Number(maxItems) || 0));
  const hasViewAllAction = typeof onViewAll === "function";

  return (
    <section
      className={`w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6 ${className}`}
      aria-labelledby="agent-activity-title"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600"
            aria-hidden="true"
          >
            <ActivityIcon name="sparkle" />
          </div>
          <div className="min-w-0">
            <h2 id="agent-activity-title" className="truncate text-base font-semibold text-slate-950">
              {title}
            </h2>
            {!loading && safeActivities.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-400">
                {safeActivities.length} {safeActivities.length === 1 ? "update" : "updates"}
              </p>
            )}
          </div>
        </div>

        {hasViewAllAction && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            View All
          </button>
        )}
      </header>

      <div className="mt-6">
        {loading ? (
          <ol
            className="space-y-4"
            aria-busy="true"
            aria-label="Loading agent activity"
          >
            <span className="sr-only">Loading agent activity</span>
            {Array.from({ length: 4 }, (_, index) => (
              <ActivitySkeleton key={index} />
            ))}
          </ol>
        ) : visibleActivities.length === 0 ? (
          <EmptyActivity message={emptyMessage} />
        ) : (
          <ol className="space-y-1">
            {visibleActivities.map((activity, index) => {
              const config = activityTypeConfig[activity?.type] || defaultTypeConfig;
              const isLast = index === visibleActivities.length - 1;
              const metadataEntries =
                activity?.metadata && typeof activity.metadata === "object" && !Array.isArray(activity.metadata)
                  ? Object.entries(activity.metadata).filter(([, value]) => value !== null && value !== undefined && value !== "")
                  : [];

              return (
                <li key={activity?.id ?? index} className="relative flex gap-3.5 sm:gap-4">
                  <div className="relative z-10 shrink-0" aria-hidden="true">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${config.iconClasses}`}
                    >
                      <ActivityIcon name={config.icon} />
                    </div>
                    {!isLast && (
                      <span className="absolute left-1/2 top-9 h-[calc(100%+1.25rem)] w-px -translate-x-1/2 bg-slate-200" />
                    )}
                  </div>

                  <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-5"}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {config.label}
                      </span>
                      <StatusLabel status={activity?.status} />
                      {activity?.timestamp && (
                        <time className="text-xs text-slate-400">{activity.timestamp}</time>
                      )}
                    </div>

                    {activity?.title && (
                      <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                        {activity.title}
                      </h3>
                    )}
                    {activity?.description && (
                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {activity.description}
                      </p>
                    )}

                    {metadataEntries.length > 0 && (
                      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        {metadataEntries.map(([key, value]) => (
                          <div key={key} className="flex min-w-0 gap-1">
                            <dt className="capitalize">{key.replace(/[-_]/g, " ")}:</dt>
                            <dd className="truncate font-medium text-slate-500">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
