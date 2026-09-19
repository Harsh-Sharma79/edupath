function toScore(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clampProgress(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
}

function ScoreChange({ change }) {
  const roundedChange = Math.round(change * 10) / 10;
  const isPositive = roundedChange > 0;
  const isNegative = roundedChange < 0;
  const iconClass = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-rose-600"
      : "text-slate-400";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${iconClass}`}>
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
      <span>
        {isPositive ? "+" : ""}
        {roundedChange} pts
      </span>
      <span className="sr-only">
        {isPositive ? "increase" : isNegative ? "decrease" : "no change"}
      </span>
    </span>
  );
}

export default function SkillProgress({
  skill = "",
  category,
  currentScore = 0,
  targetScore = 100,
  currentLevel,
  targetLevel,
  progress,
  previousScore,
  showScores = true,
  showLevels = true,
  showCategory = false,
  compact = false,
  className = "",
}) {
  const current = toScore(currentScore);
  const target = toScore(targetScore, 100);
  const hasExplicitProgress = progress !== undefined && progress !== null;
  const derivedProgress = target > 0 ? (current / target) * 100 : 0;
  const progressValue = clampProgress(
    hasExplicitProgress ? progress : derivedProgress,
  );
  const hasPreviousScore = previousScore !== undefined && previousScore !== null;
  const scoreChange = hasPreviousScore ? current - toScore(previousScore) : null;

  return (
    <article
      className={`w-full min-w-0 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${className}`}
    >
      <header className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          {skill && (
            <h2
              className={`truncate font-semibold tracking-tight text-slate-950 ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              {skill}
            </h2>
          )}
          {showCategory && category && (
            <span className="mt-2 inline-flex max-w-full rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              <span className="truncate">{category}</span>
            </span>
          )}
        </div>

        {showLevels && (currentLevel || targetLevel) && (
          <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
            {currentLevel && (
              <span className="max-w-32 truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {currentLevel}
              </span>
            )}
            {targetLevel && (
              <span className="max-w-32 truncate rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
                Target: {targetLevel}
              </span>
            )}
          </div>
        )}
      </header>

      <div className={compact ? "mt-5" : "mt-7"}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {showScores && (
              <p className="text-sm font-medium text-slate-700">
                <span className="text-lg font-semibold tabular-nums text-slate-950">
                  {current}
                </span>
                <span className="mx-1 text-slate-400">/</span>
                <span className="tabular-nums text-slate-500">{target}</span>
              </p>
            )}
            {hasPreviousScore && <div className="mt-1.5"><ScoreChange change={scoreChange} /></div>}
          </div>
          <span className="text-xl font-semibold tabular-nums text-indigo-600">
            {Math.round(progressValue)}%
          </span>
        </div>

        <div
          className={`w-full overflow-hidden rounded-full bg-slate-100 ${
            compact ? "mt-3 h-2" : "mt-4 h-3"
          }`}
          role="progressbar"
          aria-label={`${skill || "Skill"} progress`}
          aria-valuenow={Math.round(progressValue)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300 ease-out"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </article>
  );
}
