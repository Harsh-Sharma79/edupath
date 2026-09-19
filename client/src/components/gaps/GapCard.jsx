import React from "react";
const noop = () => {};

const severityStyles = {
  low: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    label: "Low Gap",
  },
  medium: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    label: "Medium Gap",
  },
  high: {
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
    label: "High Gap",
  },
  critical: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    label: "Critical Gap",
  },
};

function normalizeSeverity(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return normalized.replace(/\s+gap$/, "");
}

function clampScore(score) {
  if (score === undefined || score === null || score === "") return null;

  const numericScore = Number(score);
  return Number.isFinite(numericScore)
    ? Math.min(100, Math.max(0, numericScore))
    : null;
}

function ScoreBar({ label, score, tone = "current" }) {
  const toneClasses =
    tone === "target"
      ? {
          label: "text-violet-700",
          track: "bg-violet-100",
          fill: "bg-violet-500",
        }
      : {
          label: "text-indigo-700",
          track: "bg-indigo-100",
          fill: "bg-indigo-500",
        };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className={`font-medium ${toneClasses.label}`}>{label}</span>
        <span className="font-semibold tabular-nums text-slate-700">{score}%</span>
      </div>
      <div
        className={`h-2 w-full overflow-hidden rounded-full ${toneClasses.track}`}
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${toneClasses.fill}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function LevelComparison({ currentLevel, requiredLevel }) {
  if (!currentLevel && !requiredLevel) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {currentLevel && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current Level
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{currentLevel}</p>
        </div>
      )}
      {requiredLevel && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
            Required Level
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{requiredLevel}</p>
        </div>
      )}
    </div>
  );
}

export default function GapCard({
  skill = "",
  currentLevel = "",
  requiredLevel = "",
  gap = "",
  currentScore,
  targetScore,
  category = "",
  description = "",
  recommendation = "",
  onAction,
  actionLabel = "Start Learning",
  compact = false,
  showScores = true,
  showRecommendation = true,
  disabled = false,
  className = "",
}) {
  const current = clampScore(currentScore);
  const target = clampScore(targetScore);
  const hasCurrentScore = current !== null;
  const hasTargetScore = target !== null;
  const shouldShowScores = showScores && (hasCurrentScore || hasTargetScore);
  const pointsToTarget =
    hasCurrentScore && hasTargetScore
      ? Math.max(0, Math.round(target - current))
      : null;
  const normalizedSeverity = normalizeSeverity(gap);
  const severity = severityStyles[normalizedSeverity];
  const displaySeverity = severity || {
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
    label: typeof gap === "string" ? gap : "Gap",
  };
  const hasAction = typeof onAction === "function";

  return (
    <article
      className={`w-full min-w-0 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition duration-200 ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${
        hasAction && !disabled ? "hover:border-indigo-200 hover:shadow-md" : ""
      } ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <header className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            className={`truncate font-semibold tracking-tight text-slate-950 ${
              compact ? "text-base" : "text-lg sm:text-xl"
            }`}
          >
            {skill || "Skill gap"}
          </h2>
          {category && (
            <p className="mt-1 truncate text-sm text-slate-500">{category}</p>
          )}
        </div>

        {gap && (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${displaySeverity.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${displaySeverity.dot}`}
              aria-hidden="true"
            />
            {displaySeverity.label}
          </span>
        )}
      </header>

      <div className={compact ? "mt-4" : "mt-6"}>
        <LevelComparison
          currentLevel={currentLevel}
          requiredLevel={requiredLevel}
        />
      </div>

      {shouldShowScores && (
        <section className={compact ? "mt-5" : "mt-6"} aria-label="Skill score comparison">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Skill Progress</h3>
            {pointsToTarget !== null && (
              <span className="text-xs font-medium text-slate-500">
                {pointsToTarget} points to target
              </span>
            )}
          </div>

          <div className="space-y-4">
            {hasCurrentScore && <ScoreBar label="Current Skill" score={current} />}
            {hasTargetScore && <ScoreBar label="Target Level" score={target} tone="target" />}
          </div>
        </section>
      )}

      {!compact && description && (
        <p className="mt-6 text-sm leading-6 text-slate-600">{description}</p>
      )}

      {!compact && showRecommendation && recommendation && (
        <section className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <span className="text-indigo-600" aria-hidden="true">
              ✦
            </span>
            Recommended next step
          </div>
          <p className="mt-2 text-sm leading-6 text-indigo-950/75">{recommendation}</p>
        </section>
      )}

      {hasAction && (
        <div className={`flex ${compact ? "mt-5" : "mt-6"} justify-end`}>
          <button
            type="button"
            disabled={disabled}
            onClick={onAction}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {actionLabel}
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      )}
    </article>
  );
}
