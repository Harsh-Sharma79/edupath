import { useNavigate } from "react-router-dom";
import { useEduPath } from "../context/LearnerContext";
import PageContainer from "../components/layout/PageContainer";
import ProfileCard from "../components/profile/ProfileCard";
import ProgressSummary from "../components/progress/ProgressSummary";
import NextAction from "../components/progress/NextAction";

const quickNavigation = [
  { path: "/skill-gaps", title: "Skill Gaps", description: "Priorities derived from your profile and target role." },
  { path: "/learning-plan", title: "Weekly Plan", description: "Concrete tasks sized to your available hours." },
  { path: "/adaptation", title: "Adaptations", description: "See how the plan changed and why." },
  { path: "/chat", title: "AI Coach", description: "Plan-aware answers grounded in your state." },
  { path: "/progress", title: "Progress Report", description: "Computed from your actual task events." },
];

function Icon({ name, className = "h-4 w-4" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };
  if (name === "arrow") {
    return <svg {...props}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
  }
  return <svg {...props}><path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" /></svg>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, gaps, planTasks, report, analyze, generate, loading, user } = useEduPath();

  const doneCount = planTasks.filter((task) => task.status === "done").length;
  const stuckCount = planTasks.filter((task) => task.status === "stuck").length;
  const nextTask =
    planTasks.find((task) => task.status === "todo") ||
    planTasks.find((task) => task.status === "stuck") ||
    null;

  const hasPlan = Boolean(profile && gaps.length);

  const nextAction = nextTask
    ? {
        title: nextTask.title,
        description: nextTask.description,
        actionLabel: "Open Weekly Plan",
        type: "Next planned task",
        priority: stuckCount > doneCount ? "high" : "medium",
        skill: null,
        duration: `${nextTask.effortMinutes} min · Day ${nextTask.day}`,
        reason:
          nextTask.status === "stuck"
            ? "You marked this stuck. Retry it after the inserted prerequisite practice."
            : "It is the next open task in your active weekly plan.",
        onAction: () => navigate("/learning-plan"),
      }
    : null;

  return (
    <PageContainer
      title={`Welcome back, ${profile?.name || user?.name || "learner"}`}
      description={`Your command center on the way to ${profile?.targetRole || "your target role"}.`}
      actions={
        <button
          type="button"
          onClick={() => navigate("/learning-plan")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Open Weekly Plan
          <Icon name="arrow" />
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ProfileCard
          name={profile?.name || user?.name || "Learner"}
          email={user?.email || ""}
          course={profile?.targetRole || ""}
          year={profile?.weeklyHours ? `${profile.weeklyHours} h/week available` : ""}
          level={profile?.targetRole || "Learner"}
          progress={report?.tasks?.completionRate ?? 0}
        />

        <ProgressSummary
          overallProgress={report?.tasks?.completionRate ?? 0}
          skillsImproved={gaps.filter((gap) => gap.status === "progressing").length}
          tasksCompleted={doneCount}
          totalTasks={planTasks.length}
          learningStreak={0}
          subtitle="Computed live from your task events"
          showChange={false}
        />
      </div>

      {!hasPlan && (
        <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <h2 className="text-base font-semibold text-slate-950">Start the loop</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
            You have a profile. Run a gap analysis to identify priorities, then generate a weekly plan from them.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={analyze}
              disabled={loading}
              className="inline-flex min-h-10 items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
            >
              {loading ? "Working…" : "Analyze Gaps"}
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="inline-flex min-h-10 items-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 disabled:opacity-60"
            >
              Generate Plan
            </button>
          </div>
        </section>
      )}

      {nextAction && (
        <div className="mt-6">
          <NextAction {...nextAction} />
        </div>
      )}

      <section className="mt-8" aria-labelledby="gap-overview-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="gap-overview-title" className="text-xl font-semibold tracking-tight text-slate-950">Priority gaps</h2>
            <p className="mt-1 text-sm text-slate-500">Top gaps from the latest analysis.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/skill-gaps")}
            className="text-sm font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
          >
            View all gaps
          </button>
        </div>
        {gaps.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
            No gap analysis yet — run one to populate your priorities.
          </p>
        ) : (
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {gaps.slice(0, 3).map((gap) => (
              <li key={gap.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{gap.skillName}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-400">#{gap.priority}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{gap.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8" aria-labelledby="quick-nav-title">
        <h2 id="quick-nav-title" className="text-xl font-semibold tracking-tight text-slate-950">Quick navigation</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickNavigation.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
              </span>
              <Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
            </button>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
