import { useNavigate } from "react-router-dom";
import { useEduPath } from "../context/LearnerContext";
import PageContainer from "../components/layout/PageContainer";

const severityStyles = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

const statusStyles = {
  identified: "border-slate-200 bg-slate-50 text-slate-600",
  in_progress: "border-indigo-200 bg-indigo-50 text-indigo-700",
  progressing: "border-emerald-200 bg-emerald-50 text-emerald-700",
  struggle: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusLabels = {
  identified: "Identified",
  in_progress: "In progress",
  progressing: "Progressing",
  struggle: "Struggle flag",
};

function levelDots(level, from = 0, to = null) {
  return Array.from({ length: 5 }, (_, index) => {
    let tone = "bg-slate-200";
    if (index < level) tone = "bg-indigo-500";
    if (to !== null && index >= from && index < to) tone = "bg-violet-500";
    return <span key={index} className={`h-2 w-2 rounded-full ${tone}`} aria-hidden="true" />;
  });
}

function GapCard({ gap, onPlanForGap }) {
  const severity = severityStyles[gap.severity] || severityStyles.low;
  const status = statusStyles[gap.status] || statusStyles.identified;

  return (
    <article className="flex w-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">{gap.skillName}</h3>
          <p className="mt-1 text-xs font-medium text-slate-400">Priority #{gap.priority}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${severity}`}>
            {gap.severity}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status}`}>
            {statusLabels[gap.status] || "Identified"}
          </span>
        </div>
      </header>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
        <div className="flex items-center gap-1" title={`Current level ${gap.currentLevel}/5`}>
          {levelDots(gap.currentLevel)}
        </div>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-slate-300" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
        <div className="flex items-center gap-1" title={`Target level ${gap.targetLevel}/5`}>
          {levelDots(gap.targetLevel, gap.currentLevel, gap.targetLevel)}
        </div>
        <span className="ml-auto text-xs font-semibold tabular-nums text-slate-500">
          L{gap.currentLevel} → L{gap.targetLevel}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Why this gap</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">{gap.reason}</p>
      </div>

      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Evidence of mastery</p>
        <p className="mt-1.5 text-sm leading-6 text-indigo-950/80">{gap.evidence}</p>
      </div>

      {onPlanForGap && (
        <button
          type="button"
          onClick={onPlanForGap}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          View weekly plan
        </button>
      )}
    </article>
  );
}

export default function SkillGaps() {
  const navigate = useNavigate();
  const { gaps, profile, analyze, loading } = useEduPath();

  return (
    <PageContainer
      title="Skill Gaps"
      description={`Priorities derived from ${profile?.name || "the learner"}'s profile and the ${profile?.targetRole || "target role"} requirements.`}
      actions={
        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Analyzing…" : "Re-analyze Skills"}
        </button>
      }
    >
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
        <p className="text-sm leading-6 text-indigo-950/80">
          <strong className="font-semibold">How these priorities were derived:</strong>{" "}
          EduPath compared {profile?.name || "the learner"}'s current skills and confidence with the requirements of a{" "}
          <strong className="font-semibold">{profile?.targetRole || "target role"}</strong> role. Gaps are ordered by
          how much they block the role's core workflow.
        </p>
      </div>

      {gaps.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">No gap analysis yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Run an analysis to compare your current skills against your target role.
          </p>
          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {loading ? "Analyzing…" : "Analyze My Skills"}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gaps.map((gap) => (
            <GapCard key={gap.id} gap={gap} onPlanForGap={() => navigate("/learning-plan")} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
