import { useEduPath } from "../context/LearnerContext";
import PageContainer from "../components/layout/PageContainer";
import PlanHeader from "../components/plans/PlanHeader";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function statusDotClass(status) {
  if (status === "done") return "border-emerald-200 bg-emerald-500";
  if (status === "stuck") return "border-rose-200 bg-rose-500";
  return "border-slate-200 bg-slate-300";
}

function statusBadge(task) {
  if (task.status === "done") {
    return { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (task.status === "stuck") {
    return { label: "Stuck", className: "border-rose-200 bg-rose-50 text-rose-700" };
  }
  return { label: "To do", className: "border-slate-200 bg-slate-50 text-slate-600" };
}

function difficultyBadge(difficulty) {
  if (difficulty === "easier") return { label: "Easier", className: "border-sky-200 bg-sky-50 text-sky-700" };
  if (difficulty === "harder") return { label: "Stretch", className: "border-violet-200 bg-violet-50 text-violet-700" };
  return null;
}

function TaskRow({ task, onDone, onStuck, onReset, busy }) {
  const badge = statusBadge(task);
  const difficulty = difficultyBadge(task.difficulty);
  const isDone = task.status === "done";
  const isStuck = task.status === "stuck";

  return (
    <li className="relative flex min-w-0 gap-4 sm:gap-6">
      <div className="relative hidden w-4 shrink-0 sm:block" aria-hidden="true">
        {!busy && <span className="absolute left-1/2 top-10 h-[calc(100%+1.5rem)] w-px -translate-x-1/2 bg-slate-200" />}
        <span className={`relative z-10 mt-6 block h-4 w-4 rounded-full border-4 border-white shadow-sm ${statusDotClass(task.status)}`} />
      </div>

      <article
        className={`w-full min-w-0 rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${
          isDone ? "border-emerald-200 bg-emerald-50/40" : isStuck ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                Day {task.day} · {DAY_NAMES[task.day - 1]}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                {badge.label}
              </span>
              {difficulty && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficulty.className}`}>
                  {difficulty.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.25" />
                  <path d="M12 7.5v5l3.25 2" />
                </svg>
                {task.effortMinutes} min
              </span>
              {task.revision > 0 && (
                <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                  Rev {task.revision}
                </span>
              )}
            </div>

            <h3 className={`mt-2.5 text-lg font-semibold tracking-tight ${isDone ? "text-emerald-950 line-through decoration-emerald-400" : "text-slate-950"}`}>
              {task.title}
            </h3>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{task.description}</p>

            {task.resource && (
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4.5 5.75A2.25 2.25 0 0 1 6.75 3.5H19.5v14.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 18.25v-12.5Z" />
                  <path d="M4.5 18.25A2.25 2.25 0 0 1 6.75 16h10.5a2.25 2.25 0 0 1 2.25 2.25" />
                </svg>
                <span>{task.resource}</span>
              </p>
            )}

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {task.completionAction && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">✓ Complete when</dt>
                  <dd className="mt-0.5 text-slate-700">{task.completionAction}</dd>
                </div>
              )}
              {task.stuckAction && (
                <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">⚠ If stuck</dt>
                  <dd className="mt-0.5 text-slate-700">{task.stuckAction}</dd>
                </div>
              )}
            </dl>

            {task.dependsOn && (
              <p className="mt-3 text-xs text-slate-400">Depends on: {task.dependsOn}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => onDone(task.id)}
              disabled={isDone || busy}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✓ Done
            </button>
            <button
              type="button"
              onClick={() => onStuck(task.id)}
              disabled={isStuck || isDone || busy}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ⚠ Stuck
            </button>
            {(isDone || isStuck) && (
              <button
                type="button"
                onClick={() => onReset(task.id)}
                disabled={busy}
                className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default function LearningPlan() {
  const {
    plan,
    planTasks,
    profile,
    generate,
    revise,
    setTaskStatus,
    loading,
    agentMode,
    showToast,
  } = useEduPath();

  const [justAdapted, setJustAdapted] = React.useState(false);
  const [latestAdaptation, setLatestAdaptation] = React.useState(null);

  const doneCount = planTasks.filter((task) => task.status === "done").length;
  const stuckCount = planTasks.filter((task) => task.status === "stuck").length;
  const total = planTasks.length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  const hasOutstandingSignals = planTasks.some((task) => task.status !== "todo");

  const handleRevise = async () => {
    const adaptation = await revise();
    if (adaptation) {
      setLatestAdaptation(adaptation);
      setJustAdapted(true);
    }
  };

  const handleDone = async (taskId) => {
    const result = await setTaskStatus(taskId, "done");
    if (result) showToast("Marked done — dependent tasks unlock on revise.", "info");
  };

  const handleStuck = async (taskId) => {
    const result = await setTaskStatus(taskId, "stuck");
    if (result) showToast("Stuck signal recorded. Revise the plan to adapt it.", "info");
  };

  const handleReset = (taskId) => setTaskStatus(taskId, "todo");

  if (!plan) {
    return (
      <PageContainer
        title="Weekly Plan"
        description={`A 7-day roadmap for ${profile?.name || "you"} toward ${profile?.targetRole || "the target role"}.`}
      >
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">No plan yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Generate a weekly plan from your prioritized skill gaps.
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {loading ? "Generating…" : "Generate Weekly Plan"}
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Weekly Plan"
      description={`Concrete, measurable tasks sized to ${profile?.weeklyHours || 5} hours per week.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={handleRevise}
            disabled={loading || !hasOutstandingSignals}
            title={hasOutstandingSignals ? "Adapt the plan to your done/stuck signals" : "Mark a task done or stuck first"}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Revising…" : "Adapt Plan"}
          </button>
        </div>
      }
    >
      <PlanHeader
        title={`Week ${plan.weekNumber}: ${profile?.targetRole || "Learning"} path`}
        description={plan.objectives?.join(" ") || "Objectives appear here after generation."}
        role={profile?.targetRole}
        duration={`${total} tasks · ${planTasks.reduce((sum, task) => sum + (task.effortMinutes || 0), 0)} min total`}
        progress={progress}
        completedTasks={doneCount}
        totalTasks={total}
      />

      {(stuckCount > 0 || doneCount > 0) && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6 text-indigo-950/80">
              {doneCount > 0 && <><strong className="font-semibold">{doneCount} task{doneCount === 1 ? "" : "s"} done.</strong> </>}
              {stuckCount > 0 && <><strong className="font-semibold">{stuckCount} stuck.</strong> EduPath can insert easier prerequisite practice. </>}
              Adapt the plan to apply the deterministic rules and see what changes.
            </p>
            <button
              type="button"
              onClick={handleRevise}
              disabled={loading}
              className="inline-flex min-h-9 shrink-0 items-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
            >
              {loading ? "Revising…" : "Adapt Plan Now"}
            </button>
          </div>
        </div>
      )}

      {justAdapted && latestAdaptation && (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/60 p-5" aria-live="polite">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
              What changed & why
            </span>
            {latestAdaptation.source && (
              <span className="text-[11px] font-medium text-violet-500">
                {latestAdaptation.source === "live_ai" ? "Claude-revised" : "Deterministic rules"}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{latestAdaptation.title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-700">{latestAdaptation.reason}</p>
          {latestAdaptation.affectedGap && (
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold text-violet-700">Affected skill:</span> {latestAdaptation.affectedGap}
            </p>
          )}
          <ul className="mt-3 space-y-1.5">
            {(latestAdaptation.changes || []).map((change, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-violet-500" aria-hidden="true">→</span>
                <span><strong className="font-medium">{change.type.replace(/_/g, " ")}:</strong> {change.detail}</span>
              </li>
            ))}
          </ul>
          {latestAdaptation.nextAction && (
            <p className="mt-3 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-sm text-slate-700">
              <strong className="font-semibold text-violet-700">New next step:</strong> {latestAdaptation.nextAction}
            </p>
          )}
          <button
            type="button"
            onClick={() => setJustAdapted(false)}
            className="mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Dismiss
          </button>
        </section>
      )}

      <section className="mt-8" aria-label="Plan tasks by day">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Your tasks</h2>
        <p className="mt-1 text-sm text-slate-500">Work in order, or jump to what fits today. Mark done or stuck — the plan reacts.</p>
        <ol className="mt-5 space-y-5">
          {planTasks.map((task) => (
            <TaskRow key={task.id} task={task} onDone={handleDone} onStuck={handleStuck} onReset={handleReset} busy={loading} />
          ))}
        </ol>
      </section>
    </PageContainer>
  );
}
