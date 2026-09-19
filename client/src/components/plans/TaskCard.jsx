import React from "react";
import TaskStatus from "./TaskStatus";

const statusStyles = {
  pending: "border-slate-200 bg-white",
  "in-progress": "border-indigo-200 bg-indigo-50/30",
  completed: "border-emerald-200 bg-emerald-50/40",
  locked: "border-slate-200 bg-slate-50",
  skipped: "border-amber-200 bg-amber-50/30",
};

const noop = () => {};

function DetailItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function ResourceItem({ resource }) {
  const title = typeof resource === "string" ? resource : resource?.title;
  if (!title) return null;

  return (
    <li className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 shrink-0 text-indigo-500"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M4.5 5.75A2.25 2.25 0 0 1 6.75 3.5H19.5v14.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 18.25v-12.5Z" />
        <path d="M4.5 18.25A2.25 2.25 0 0 1 6.75 16h10.5a2.25 2.25 0 0 1 2.25 2.25" />
      </svg>
      <span className="truncate">{title}</span>
    </li>
  );
}

export default function TaskCard({
  id,
  title = "",
  description = "",
  status = "pending",
  type = "Learning Task",
  duration,
  difficulty,
  skill,
  dueDate,
  progress = 0,
  resources = [],
  onOpen,
  onComplete,
  compact = false,
  className = "",
}) {
  const normalizedStatus = String(status || "pending").trim().toLowerCase();
  const safeStatus = statusStyles[normalizedStatus] ? normalizedStatus : "pending";
  const numericProgress = Number(progress);
  const clampedProgress = Number.isFinite(numericProgress)
    ? Math.min(100, Math.max(0, numericProgress))
    : 0;
  const isCompleted = safeStatus === "completed";
  const isLocked = safeStatus === "locked";
  const canOpen = typeof onOpen === "function" && !isLocked;
  const canComplete =
    typeof onComplete === "function" && !isLocked && !isCompleted;
  const visibleResources = Array.isArray(resources) ? resources.slice(0, 3) : [];
  const hasProgress = progress !== undefined && progress !== null;

  return (
    <article
      className={`w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm transition-colors duration-200 ${statusStyles[safeStatus]} ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${isLocked ? "opacity-70" : ""} ${
        (canOpen || canComplete) && !isLocked
          ? "hover:border-indigo-200 hover:shadow-md"
          : ""
      } ${className}`}
    >
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`flex shrink-0 items-center justify-center rounded-xl border ${
              compact ? "h-9 w-9" : "h-11 w-11"
            } ${
              isCompleted
                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                : isLocked
                  ? "border-slate-200 bg-slate-100 text-slate-400"
                  : "border-indigo-100 bg-indigo-50 text-indigo-600"
            }`}
            aria-hidden="true"
          >
            {isCompleted ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            ) : isLocked ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {type && (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {type}
                </span>
              )}
              <TaskStatus status={safeStatus} />
            </div>

            {title && (
              <h2
                className={`mt-2 font-semibold tracking-tight ${
                  compact ? "text-base" : "text-lg sm:text-xl"
                } ${isCompleted ? "text-emerald-950 line-through decoration-emerald-400" : "text-slate-950"}`}
              >
                {title}
              </h2>
            )}

            {!compact && description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            )}

            {(duration || skill || difficulty || dueDate) && (
              <dl
                className={`mt-5 grid min-w-0 grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 ${
                  compact ? "mt-3" : ""
                }`}
              >
                <DetailItem label="Duration" value={duration} />
                <DetailItem label="Skill" value={skill} />
                <DetailItem label="Difficulty" value={difficulty} />
                <DetailItem label="Due date" value={dueDate} />
              </dl>
            )}
          </div>
        </div>

        {(canOpen || canComplete) && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {canOpen && (
              <button
                type="button"
                onClick={() => onOpen(id)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Open Task
              </button>
            )}
            {canComplete && (
              <button
                type="button"
                onClick={() => onComplete(id)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>

      {hasProgress && (
        <div className={compact ? "mt-5" : "mt-6"}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">Task Progress</span>
            <span className="font-semibold tabular-nums text-indigo-600">
              {clampedProgress}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`${title || "Task"} progress`}
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                isCompleted
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
              }`}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      )}

      {!compact && visibleResources.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-800">Resources</h3>
          <ul className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleResources.map((resource, index) => (
              <ResourceItem
                key={`${typeof resource === "string" ? resource : resource?.title || "resource"}-${index}`}
                resource={resource}
              />
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
