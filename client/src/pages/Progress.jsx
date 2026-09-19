import { useNavigate } from "react-router-dom";
import { useEduPath } from "../context/LearnerContext";
import PageContainer from "../components/layout/PageContainer";
import ProgressSummary from "../components/progress/ProgressSummary";

const momentumCopy = {
  strong: { label: "Strong momentum", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  steady: { label: "Steady momentum", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  needs_attention: { label: "Needs attention", className: "border-amber-200 bg-amber-50 text-amber-700" },
  just_starting: { label: "Just getting started", className: "border-slate-200 bg-slate-50 text-slate-600" },
};

function Icon({ name, className = "h-5 w-5" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };
  if (name === "check") return <svg {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
  if (name === "warn") return <svg {...props}><path d="m12 4 8 15H4L12 4Z" /><path d="M12 9v4M12 16.5v.1" /></svg>;
  if (name === "target") return <svg {...props}><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="3" /></svg>;
  return <svg {...props}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
}

export default function Progress() {
  const navigate = useNavigate();
  const { report, profile, refreshReport, loading } = useEduPath();

  if (!report) {
    return (
      <PageContainer title="Progress Report" description="Computed from your actual task events — no AI call involved.">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Nothing to report yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Complete or mark tasks in your weekly plan, then return here for the computed summary.
          </p>
          <button
            type="button"
            onClick={() => refreshReport()}
            disabled={loading}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {loading ? "Loading…" : "Refresh Report"}
          </button>
        </div>
      </PageContainer>
    );
  }

  const tasks = report.tasks || {};
  const skills = report.skills || {};
  const momentum = momentumCopy[report.momentum] || momentumCopy.just_starting;

  return (
    <PageContainer
      title="Progress Report"
      description={`Derived from task events and gap states for ${profile?.name || "the learner"} — never from a second AI call.`}
      actions={
        <button
          type="button"
          onClick={() => refreshReport()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
        >
          Refresh
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ProgressSummary
          overallProgress={tasks.completionRate ?? 0}
          tasksCompleted={tasks.done ?? 0}
          totalTasks={tasks.total ?? 0}
          skillsImproved={(skills.completedEvidence || []).length}
          learningStreak={0}
          subtitle="Task completion rate"
          showChange={false}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="momentum-title">
          <h2 id="momentum-title" className="text-base font-semibold text-slate-950">Momentum</h2>
          <div className="mt-4 space-y-3">
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${momentum.className}`}>
              {momentum.label}
            </span>
            <dl className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
                <dd className="text-2xl font-bold tabular-nums text-emerald-700">{tasks.done ?? 0}</dd>
                <dt className="mt-1 text-[11px] font-medium text-emerald-800/70">Done</dt>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center">
                <dd className="text-2xl font-bold tabular-nums text-amber-700">{tasks.stuck ?? 0}</dd>
                <dt className="mt-1 text-[11px] font-medium text-amber-800/70">Stuck</dt>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <dd className="text-2xl font-bold tabular-nums text-slate-600">{tasks.todo ?? 0}</dd>
                <dt className="mt-1 text-[11px] font-medium text-slate-500">To do</dt>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Skills evidence and remaining gaps">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600" aria-hidden="true">
              <Icon name="check" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">Skills with evidence</h2>
          </div>
          {(skills.completedEvidence || []).length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              No gaps have completed evidence yet. Finish all tasks for a gap and it will be marked progressing here.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {(skills.completedEvidence || []).map((item) => (
                <li key={item.skillName} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-sm font-semibold text-emerald-900">{item.skillName}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800/80">{item.evidence}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600" aria-hidden="true">
              <Icon name="target" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">Remaining gaps</h2>
          </div>
          {(skills.inProgress || []).length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">All identified gaps have been addressed.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {(skills.inProgress || []).map((gap) => (
                <li key={gap.skillName} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{gap.skillName}</span>
                    <span className="block text-xs text-slate-500">Priority #{gap.priority}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                    L{gap.currentLevel} → L{gap.targetLevel}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {(skills.struggleAreas || []).length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-rose-800">
                <Icon name="warn" className="h-4 w-4" /> Struggle areas
              </p>
              <p className="mt-1 text-sm text-rose-700/90">
                {(skills.struggleAreas || []).join(", ")} — two or more stuck events. Guided practice recommended.
              </p>
            </div>
          )}
        </div>
      </section>

      {report.nextAction && (
        <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6" aria-labelledby="report-next-title">
          <h2 id="report-next-title" className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Recommended next action</h2>
          <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{report.nextAction.title}</p>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">{report.nextAction.description}</p>
          <p className="mt-2 text-sm text-slate-500">
            {report.nextAction.effortMinutes} min · {report.nextAction.reason}
          </p>
          <button
            type="button"
            onClick={() => navigate("/learning-plan")}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Go to task
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </section>
      )}

      {report.latestAdaptation && (
        <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">Latest plan change</h2>
          <p className="mt-1.5 text-sm font-semibold text-slate-800">{report.latestAdaptation.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{report.latestAdaptation.reason}</p>
        </section>
      )}
    </PageContainer>
  );
}
