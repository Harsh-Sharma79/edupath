import React from "react";
import PlanHeader from "../components/plans/PlanHeader";
import TaskTimeline from "../components/plans/TaskTimeline";
import AdaptationCard from "../components/plans/AdaptationCard";

const fallbackPlan = {
  title: "Your Frontend Learning Plan",
  description: "A personalized roadmap designed to help you reach your career goal.",
  role: "Frontend Developer",
  duration: "12 weeks",
  progress: 42,
  completedTasks: 5,
  totalTasks: 12,
};

function FocusIcon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-5 w-5",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (type === "clock") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.5v5l3.25 2" />
      </svg>
    );
  }

  if (type === "sparkle") {
    return (
      <svg {...props}>
        <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      <path d="M5 20h14" />
    </svg>
  );
}

export default function LearningPlan({
  plan,
  tasks = [],
  latestAdaptation,
  loading = false,
  onTaskOpen,
  onTaskComplete,
  onRefreshPlan,
  onViewAdaptation,
}) {
  const safePlan = plan && typeof plan === "object" ? plan : {};
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const planData = { ...fallbackPlan, ...safePlan };
  const completedFromTasks = safeTasks.filter(
    (task) => String(task?.status || "").toLowerCase() === "completed",
  ).length;
  const totalTasks = safePlan.totalTasks ?? (safeTasks.length || planData.totalTasks);
  const completedTasks = safePlan.completedTasks ?? (safeTasks.length ? completedFromTasks : planData.completedTasks);
  const focusTask = safeTasks.find(
    (task) => !["completed", "skipped", "locked"].includes(String(task?.status || "").toLowerCase()),
  );
  const currentFocus = safePlan.currentFocus || focusTask?.title || "Build stronger frontend fundamentals";
  const focusSkill = safePlan.currentSkill || focusTask?.skill || "JavaScript";
  const focusDuration = safePlan.currentFocusDuration || focusTask?.duration || "45 min";
  const focusReason = safePlan.currentFocusReason || "This focus area supports the next stage of your target role and keeps your plan moving forward.";
  const hasAdaptation = latestAdaptation && typeof latestAdaptation === "object";
  const canRefresh = typeof onRefreshPlan === "function";
  const canViewAdaptation = typeof onViewAdaptation === "function";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-indigo-600">Personalized learning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Learning Plan</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Follow your focused roadmap one task at a time and keep building toward your target role.
          </p>
        </header>

        <PlanHeader
          title={planData.title}
          description={planData.description}
          role={planData.role || planData.targetRole}
          duration={planData.duration}
          progress={planData.progress}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          onRefresh={canRefresh ? onRefreshPlan : undefined}
        />

        <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="current-focus-title">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                <FocusIcon type="sparkle" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Current focus</p>
                <h2 id="current-focus-title" className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{currentFocus}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{focusReason}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <span className="inline-flex max-w-full items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                <span className="truncate">{focusSkill}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FocusIcon type="clock" />
                {focusDuration}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="timeline-title">
          <div className="mb-5">
            <h2 id="timeline-title" className="text-xl font-semibold tracking-tight text-slate-950">Your Learning Tasks</h2>
            <p className="mt-1 text-sm text-slate-500">Work through the plan in order, or choose the task that best fits your focus today.</p>
          </div>
          {!loading && safeTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8" role="status">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                <FocusIcon type="sparkle" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Your learning plan is ready to begin</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">No tasks have been added to this plan yet. Refresh the plan to generate the next set of learning steps.</p>
              {canRefresh && (
                <button
                  type="button"
                  onClick={onRefreshPlan}
                  className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Refresh Learning Plan
                </button>
              )}
            </div>
          ) : (
            <TaskTimeline
              tasks={safeTasks}
              loading={loading}
              onOpenTask={onTaskOpen}
              onCompleteTask={onTaskComplete}
              emptyMessage="No tasks have been added to your learning plan yet. Refresh the plan to generate your next steps."
            />
          )}
        </section>

        {hasAdaptation && (
          <section className="mt-8" aria-labelledby="latest-adaptation-title">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Latest update</p>
              <h2 id="latest-adaptation-title" className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Latest AI Adaptation</h2>
            </div>
            <AdaptationCard
              {...latestAdaptation}
              onViewPlan={canViewAdaptation ? () => onViewAdaptation(latestAdaptation) : undefined}
            />
          </section>
        )}
      </div>
    </main>
  );
}
