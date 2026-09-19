import React from "react";
export default function AdaptationCard({
  title = "Plan Adapted",
  reason,
  description,
  changes = [],
  timestamp,
  type = "AI Adaptation",
  onViewPlan,
  onDismiss,
  className = "",
}) {
  const hasViewPlanAction = typeof onViewPlan === "function";
  const hasDismissAction = typeof onDismiss === "function";
  const visibleChanges = Array.isArray(changes)
    ? changes.filter((change) => {
        const text = typeof change === "string" ? change : change?.text;
        return Boolean(text);
      })
    : [];
  const hasReasonSection = Boolean(reason || description);

  return (
    <article
      className={`w-full min-w-0 rounded-2xl border border-violet-100 bg-white p-5 text-slate-900 shadow-sm sm:p-6 ${className}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
              <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                {type}
              </span>
              {timestamp && (
                <time className="text-xs text-slate-400">{timestamp}</time>
              )}
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
              {title}
            </h2>
          </div>
        </div>

        {hasDismissAction && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss adaptation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
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

      {(hasReasonSection || visibleChanges.length > 0) && (
        <div className="mt-6 space-y-6 border-t border-violet-50 pt-6">
          {hasReasonSection && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Why this changed
              </h3>
              {reason && (
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                  {reason}
                </p>
              )}
              {description && (
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
              )}
            </section>
          )}

          {visibleChanges.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-800">Changes made</h3>
              <ul className="mt-3 space-y-2">
                {visibleChanges.map((change, index) => {
                  const text = typeof change === "string" ? change : change.text;
                  const key = typeof change === "object" && change.id
                    ? change.id
                    : `${text}-${index}`;

                  return (
                    <li key={key} className="flex min-w-0 items-start gap-2.5 text-sm leading-6 text-slate-600">
                      <span
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-3.5 w-3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m3 8.25 3.1 3.1L13 4.75" />
                        </svg>
                      </span>
                      <span className="min-w-0 break-words">{text}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      {hasViewPlanAction && (
        <div className="mt-6 flex justify-end border-t border-violet-50 pt-5">
          <button
            type="button"
            onClick={onViewPlan}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            View Updated Plan
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
