import React from "react";
export default function ProfileCard({
  name = "",
  email = "",
  avatar = "",
  course = "",
  year = "",
  level = "",
  progress = 0,
  compact = false,
  showProgress = true,
  onClick,
  className = "",
}) {
  const hasProgress = showProgress && progress !== undefined && progress !== null;
  const numericProgress = Number(progress);
  const clampedProgress = Number.isFinite(numericProgress)
    ? Math.min(100, Math.max(0, numericProgress))
    : 0;

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const educationDetails = [course, year].filter(Boolean).join(" • ");
  const isInteractive = typeof onClick === "function";

  const handleKeyDown = (event) => {
    if (!isInteractive) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <article
      className={`group w-full rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition duration-200 ${
        compact ? "p-3" : "p-5 sm:p-6"
      } ${
        isInteractive
          ? "cursor-pointer hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          : ""
      } ${className}`}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open profile for ${name}` : undefined}
    >
      <div className={`flex min-w-0 items-start ${compact ? "gap-3" : "gap-4"}`}>
        {avatar ? (
          <img
            src={avatar}
            alt={`${name || "Student"}'s profile`}
            className={`shrink-0 rounded-full object-cover ring-1 ring-indigo-100 ${
              compact ? "h-10 w-10" : "h-14 w-14"
            }`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white shadow-sm ring-4 ring-indigo-50 ${
              compact ? "h-10 w-10 text-xs" : "h-14 w-14 text-base"
            }`}
            aria-hidden="true"
          >
            {initials || "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                className={`truncate font-semibold text-slate-950 ${
                  compact ? "text-sm" : "text-base sm:text-lg"
                }`}
              >
                {name || "Unnamed student"}
              </h2>

              {educationDetails && (
                <p
                  className={`mt-1 truncate text-slate-500 ${
                    compact ? "text-xs" : "text-sm"
                  }`}
                >
                  {educationDetails}
                </p>
              )}

              {!compact && email && (
                <p className="mt-1 truncate text-xs text-slate-400">{email}</p>
              )}
            </div>

            {!compact && level && (
              <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {level}
              </span>
            )}
          </div>

          {compact && level && (
            <span className="mt-2 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
              {level}
            </span>
          )}
        </div>
      </div>

      {!compact && hasProgress && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-700">Learning Progress</span>
            <span className="font-semibold tabular-nums text-indigo-600">
              {clampedProgress}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Learning progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedProgress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
