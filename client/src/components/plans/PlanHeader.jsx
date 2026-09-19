import React from "react";
import { useId } from "react";

export default function PlanHeader({
  title = "Your Learning Plan",
  description = "A personalized roadmap designed to help you reach your career goal.",
  role,
  duration,
  progress = 0,
  completedTasks = 0,
  totalTasks = 0,
  onRefresh,
  onEdit,
  className = "",
}) {
  const titleId = useId();
  const numericProgress = Number(progress);
  const clampedProgress = Number.isFinite(numericProgress)
    ? Math.min(100, Math.max(0, numericProgress))
    : 0;
  const hasRefreshAction = typeof onRefresh === "function";
  const hasEditAction = typeof onEdit === "function";

  return (
    <section
      className={`w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6 lg:p-8 ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          {(role || duration) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {role && (
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
                  </svg>
                  {role}
                </span>
              )}

              {duration && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="8.25" />
                    <path d="M12 7.5v5l3.25 2" />
                  </svg>
                  {duration}
                </span>
              )}
            </div>
          )}

          <h1
            id={titleId}
            className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
          >
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        </div>

        {(hasEditAction || hasRefreshAction) && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {hasEditAction && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m14.5 5.5 4 4M4.5 19.5l1-4.5L16.8 3.7a1.7 1.7 0 0 1 2.4 2.4L7.9 18.5l-3.4 1Z" />
                </svg>
                Edit Plan
              </button>
            )}

            {hasRefreshAction && (
              <button
                type="button"
                onClick={onRefresh}
                aria-label="Refresh learning plan"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M20 11a8 8 0 0 0-13.7-4.8L4 8.5M4 5v3.5h3.5M4 13a8 8 0 0 0 13.7 4.8L20 15.5M20 19v-3.5h-3.5" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Overall Progress</h2>
            <p className="mt-1 text-sm text-slate-500">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-indigo-600">
            {clampedProgress}%
          </span>
        </div>

        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Overall learning plan progress"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
