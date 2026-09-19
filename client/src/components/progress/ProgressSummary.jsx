function clampPercentage(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
}

function MetricIcon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (type === "skills") {
    return (
      <svg {...props}>
        <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
      </svg>
    );
  }

  if (type === "tasks") {
    return (
      <svg {...props}>
        <rect x="4.5" y="4" width="15" height="16" rx="2" />
        <path d="m8 12 2.25 2.25L16 8.5" />
      </svg>
    );
  }

  if (type === "streak") {
    return (
      <svg {...props}>
        <path d="M13.5 3.5c.5 3-1.5 4.5-3 6.5-.7-1.4-1.8-2.2-2.8-2.8C6.3 10 5 11.8 5 14a7 7 0 0 0 14 0c0-3.2-2.2-6.2-5.5-10.5Z" />
        <path d="M10.5 15.5a2 2 0 0 0 3 1.7" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

function ChangeIndicator({ change }) {
  const roundedChange = Math.round(change * 10) / 10;
  const isPositive = roundedChange > 0;
  const isNegative = roundedChange < 0;
  const tone = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-rose-600"
      : "text-slate-500";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${tone}`}>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        {isPositive ? (
          <path d="m4 13 4-4 3 3 5-6M12.5 6H16v3.5" />
        ) : isNegative ? (
          <path d="m4 7 4 4 3-3 5 6M12.5 14H16v-3.5" />
        ) : (
          <path d="M4 10h12" />
        )}
      </svg>
      {isPositive || isNegative ? `${isPositive ? "+" : ""}${roundedChange}%` : "No change"}
      <span className="sr-only">
        {isPositive ? "increase from previous progress" : isNegative ? "decrease from previous progress" : "from previous progress"}
      </span>
    </span>
  );
}

export default function ProgressSummary({
  overallProgress = 0,
  skillsImproved = 0,
  tasksCompleted = 0,
  totalTasks = 0,
  learningStreak = 0,
  previousProgress,
  title = "Learning Progress",
  subtitle = "Track your progress toward your goal",
  showProgressBar = true,
  showChange = true,
  compact = false,
  className = "",
}) {
  const progress = clampPercentage(overallProgress);
  const completed = Number.isFinite(Number(tasksCompleted)) ? Number(tasksCompleted) : 0;
  const total = Number.isFinite(Number(totalTasks)) ? Math.max(0, Number(totalTasks)) : 0;
  const skills = Number.isFinite(Number(skillsImproved)) ? Number(skillsImproved) : 0;
  const streak = Number.isFinite(Number(learningStreak)) ? Number(learningStreak) : 0;
  const hasPreviousProgress = previousProgress !== undefined && previousProgress !== null;
  const progressChange = hasPreviousProgress
    ? progress - clampPercentage(previousProgress)
    : null;

  const metrics = [
    {
      key: "skills",
      label: "Skills Improved",
      value: skills,
      icon: "skills",
      iconClasses: "bg-indigo-50 text-indigo-600",
    },
    {
      key: "tasks",
      label: "Tasks Completed",
      value: total > 0 ? `${completed} / ${total}` : "0 tasks",
      icon: "tasks",
      iconClasses: "bg-violet-50 text-violet-600",
    },
    {
      key: "streak",
      label: "Learning Streak",
      value: `${streak} ${streak === 1 ? "day" : "days"}`,
      icon: "streak",
      iconClasses: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <section
      className={`w-full min-w-0 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${className}`}
      aria-labelledby="progress-summary-title"
    >
      <header>
        <h2
          id="progress-summary-title"
          className={`font-semibold tracking-tight text-slate-950 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </header>

      <div className={compact ? "mt-5" : "mt-7"}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={`font-semibold tabular-nums text-indigo-600 ${compact ? "text-3xl" : "text-4xl"}`}>
              {Math.round(progress)}%
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">Overall Progress</p>
          </div>
          {showChange && hasPreviousProgress && <ChangeIndicator change={progressChange} />}
        </div>

        {showProgressBar && (
          <div
            className={`w-full overflow-hidden rounded-full bg-slate-100 ${compact ? "mt-4 h-2" : "mt-5 h-3"}`}
            role="progressbar"
            aria-label="Overall learning progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <dl className={`grid grid-cols-2 border-t border-slate-100 ${compact ? "mt-5 gap-3 pt-4" : "mt-7 gap-4 pt-5 sm:grid-cols-3"}`}>
        {metrics.map((metric) => (
          <div key={metric.key} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`flex shrink-0 items-center justify-center rounded-lg ${metric.iconClasses} ${compact ? "h-7 w-7" : "h-8 w-8"}`}
                aria-hidden="true"
              >
                <MetricIcon type={metric.icon} />
              </span>
              <dt className="min-w-0 truncate text-xs font-medium text-slate-500">{metric.label}</dt>
            </div>
            <dd className={`mt-2 font-semibold tabular-nums text-slate-900 ${compact ? "text-base" : "text-lg"}`}>
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
