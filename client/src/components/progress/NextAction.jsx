import PriorityBadge from "../gaps/PriorityBadge";

export default function NextAction({
  title = "Your Next Step",
  description,
  actionLabel = "Start Task",
  type = "Recommended Action",
  priority = "medium",
  skill,
  duration,
  reason,
  onAction,
  onDismiss,
  showReason = true,
  compact = false,
  className = "",
}) {
  const hasAction = typeof onAction === "function";
  const hasDismiss = typeof onDismiss === "function";

  return (
    <article
      className={`w-full min-w-0 rounded-2xl border border-indigo-100 bg-white text-slate-900 shadow-sm ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${className}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={compact ? "h-4 w-4" : "h-5 w-5"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
              <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
            </svg>
          </span>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
              <span className="truncate">{type}</span>
            </span>
            <PriorityBadge priority={priority} size={compact ? "sm" : "md"} />
          </div>
        </div>

        {hasDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss next action"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M6 6 18 18M18 6 6 18" />
            </svg>
          </button>
        )}
      </header>

      <div className={compact ? "mt-5" : "mt-7"}>
        {title && (
          <h2 className={`font-semibold tracking-tight text-slate-950 ${compact ? "text-base" : "text-xl"}`}>
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        )}

        {(skill || duration) && (
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${compact ? "mt-4" : "mt-5"}`}>
            {skill && (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5 shrink-0 text-indigo-500"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
                </svg>
                <span className="truncate">{skill}</span>
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5 shrink-0"
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

        {showReason && reason && (
          <div className={`border-l-2 border-indigo-200 pl-3 ${compact ? "mt-4" : "mt-6"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Why this?</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{reason}</p>
          </div>
        )}
      </div>

      {hasAction && (
        <div className={`flex ${compact ? "mt-5" : "mt-7"}`}>
          <button
            type="button"
            onClick={onAction}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto ${
              compact ? "min-h-9 px-3 py-1.5 text-xs" : "min-h-10 px-4 py-2 text-sm"
            }`}
          >
            {actionLabel}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}
