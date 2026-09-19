import React from "react";
import ProgressSummary from "../components/progress/ProgressSummary";
import SkillProgress from "../components/progress/SkillProgress";
import NextAction from "../components/progress/NextAction";

const metricConfig = [
  { key: "completed", label: "Tasks Completed", tone: "text-emerald-600 bg-emerald-50" },
  { key: "inProgress", label: "In Progress", tone: "text-indigo-600 bg-indigo-50" },
  { key: "remaining", label: "Tasks Remaining", tone: "text-slate-600 bg-slate-100" },
];

function MetricIcon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (type === "completed") {
    return (
      <svg {...props}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }

  if (type === "inProgress") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.75 2" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </svg>
  );
}

function ProgressSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading progress">
      <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
        ))}
      </div>
      <span className="sr-only">Loading progress</span>
    </div>
  );
}

function EmptyProgressState() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center shadow-sm sm:px-8" role="status">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
          <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Your progress will appear here</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Complete a learning task or begin your plan to start seeing progress across your skills and activities.</p>
    </section>
  );
}

export default function Progress({
  overallProgress,
  skills = [],
  tasksCompleted = 0,
  totalTasks = 0,
  learningStreak = 0,
  previousProgress,
  nextAction,
  insights = [],
  loading = false,
  onNextAction,
}) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeInsights = Array.isArray(insights) ? insights : [];
  const completed = Number.isFinite(Number(tasksCompleted)) ? Number(tasksCompleted) : 0;
  const total = Number.isFinite(Number(totalTasks)) ? Math.max(0, Number(totalTasks)) : 0;
  const inProgress = safeInsights.find((insight) => insight?.type === "in-progress")?.value ?? "—";
  const skillsImproved = safeInsights.find((insight) => insight?.type === "skills-improved")?.value ?? 0;
  const remaining = total > 0 ? Math.max(0, total - completed) : "—";
  const hasProgressData = overallProgress !== undefined || safeSkills.length > 0 || completed > 0 || total > 0 || learningStreak > 0;
  const hasNextAction = nextAction && typeof nextAction === "object";

  const activityMetrics = {
    completed: total > 0 ? `${completed} / ${total}` : completed,
    inProgress,
    remaining,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Learning insights</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Your Progress</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Track how your skills and learning activity are improving over time.</p>
          </div>
          <span className="inline-flex self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm sm:self-auto">Progress overview</span>
        </header>

        <div className="mt-8">
          {loading ? (
            <ProgressSkeleton />
          ) : !hasProgressData ? (
            <EmptyProgressState />
          ) : (
            <>
              <section aria-labelledby="overall-progress-title">
                <h2 id="overall-progress-title" className="sr-only">Overall progress</h2>
                <ProgressSummary
                  overallProgress={overallProgress}
                  skillsImproved={skillsImproved}
                  tasksCompleted={completed}
                  totalTasks={total}
                  learningStreak={learningStreak}
                  previousProgress={previousProgress}
                />
              </section>

              <section className="mt-8" aria-labelledby="learning-activity-title">
                <div className="mb-4">
                  <h2 id="learning-activity-title" className="text-xl font-semibold tracking-tight text-slate-950">Learning Activity</h2>
                  <p className="mt-1 text-sm text-slate-500">A lightweight view of your current task momentum.</p>
                </div>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {metricConfig.map((metric) => (
                    <div key={metric.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.tone}`} aria-hidden="true">
                          <MetricIcon type={metric.key} />
                        </span>
                        <dt className="text-sm font-medium text-slate-500">{metric.label}</dt>
                      </div>
                      <dd className="mt-4 text-2xl font-semibold tabular-nums text-slate-950">{activityMetrics[metric.key]}</dd>
                    </div>
                  ))}
                </dl>
                {safeInsights.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800">Recent learning activity</h3>
                    <ul className="mt-3 divide-y divide-slate-100">
                      {safeInsights.slice(0, 4).map((insight, index) => (
                        <li key={insight?.id || index} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700">{insight?.title || insight?.label || "Progress update"}</p>
                            {insight?.description && <p className="mt-1 text-sm leading-5 text-slate-500">{insight.description}</p>}
                          </div>
                          {insight?.timestamp && <time className="shrink-0 text-xs text-slate-400">{insight.timestamp}</time>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section className="mt-8" aria-labelledby="skill-progress-title">
                <div className="mb-5">
                  <h2 id="skill-progress-title" className="text-xl font-semibold tracking-tight text-slate-950">Skill Progress</h2>
                  <p className="mt-1 text-sm text-slate-500">Compare your current skill levels with the targets supplied for your learning journey.</p>
                </div>
                {safeSkills.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {safeSkills.map((skill, index) => (
                      <SkillProgress
                        key={skill?.id || skill?.skill || skill?.name || index}
                        skill={skill?.skill || skill?.name || "Skill"}
                        category={skill?.category}
                        currentScore={skill?.currentScore}
                        targetScore={skill?.targetScore}
                        currentLevel={skill?.currentLevel}
                        targetLevel={skill?.targetLevel}
                        progress={skill?.progress}
                        previousScore={skill?.previousScore}
                        showScores
                        showLevels
                        showCategory
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">Skill-level progress will appear after skill data is supplied.</p>
                  </div>
                )}
              </section>

              {hasNextAction && (
                <section className="mt-8" aria-labelledby="next-action-title">
                  <div className="mb-5">
                    <h2 id="next-action-title" className="text-xl font-semibold tracking-tight text-slate-950">Next Action</h2>
                    <p className="mt-1 text-sm text-slate-500">Keep your momentum with the recommended step supplied for your plan.</p>
                  </div>
                  <NextAction {...nextAction} onAction={typeof onNextAction === "function" ? onNextAction : undefined} />
                </section>
              )}

              {safeInsights.length > 0 && (
                <section className="mt-8" aria-labelledby="progress-insights-title">
                  <div className="mb-5">
                    <h2 id="progress-insights-title" className="text-xl font-semibold tracking-tight text-slate-950">Progress Insights</h2>
                    <p className="mt-1 text-sm text-slate-500">Information supplied for your learning dashboard.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {safeInsights.slice(0, 3).map((insight, index) => (
                      <article key={insight?.id || `insight-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{insight?.label || insight?.type || "Insight"}</p>
                        <h3 className="mt-3 text-base font-semibold text-slate-900">{insight?.title || "Progress update"}</h3>
                        {insight?.description && <p className="mt-2 text-sm leading-6 text-slate-500">{insight.description}</p>}
                        {insight?.value !== undefined && <p className="mt-4 text-xl font-semibold tabular-nums text-slate-950">{insight.value}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
