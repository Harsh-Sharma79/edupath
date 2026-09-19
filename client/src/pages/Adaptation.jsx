import { useEduPath } from "../context/LearnerContext";
import PageContainer from "../components/layout/PageContainer";

function SparkleIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
    </svg>
  );
}

function AdaptationDetail({ adaptation }) {
  return (
    <article className="w-full rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <SparkleIcon className="h-3.5 w-3.5" />
          Latest adaptation
        </span>
        {adaptation.source && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {adaptation.source === "live_ai" ? "Claude revised" : "Deterministic rules"}
          </span>
        )}
        {adaptation.createdAt && (
          <time className="text-xs text-slate-400">{new Date(adaptation.createdAt).toLocaleString()}</time>
        )}
      </div>

      <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{adaptation.title}</h2>

      <dl className="mt-5 space-y-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-violet-600">Why it changed</dt>
          <dd className="mt-1.5 text-sm leading-6 text-slate-700">{adaptation.reason}</dd>
        </div>

        {adaptation.affectedGap && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-violet-600">Affected skill</dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-800">{adaptation.affectedGap}</dd>
          </div>
        )}

        {(adaptation.changes || []).length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">What changed</dt>
            <dd className="mt-2">
              <ul className="space-y-2">
                {adaptation.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-sm leading-6 text-slate-700">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8.25 6.1 11.35 13 4.75" />
                      </svg>
                    </span>
                    <span>
                      <strong className="font-semibold capitalize">{String(change.type || "").replace(/_/g, " ")}:</strong>{" "}
                      {change.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {adaptation.nextAction && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-indigo-600">New next step</dt>
            <dd className="mt-1.5 text-sm leading-6 text-slate-700">{adaptation.nextAction}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export default function Adaptation() {
  const { report, planTasks, profile } = useEduPath();

  const adaptation = report?.latestAdaptation || null;
  const hasSignals = planTasks.some((task) => task.status !== "todo");

  return (
    <PageContainer
      title="Adaptation"
      description={`How EduPath's plan changed for ${profile?.name || "the learner"} — and exactly why.`}
    >
      {adaptation ? (
        <AdaptationDetail adaptation={adaptation} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600" aria-hidden="true">
            <SparkleIcon />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No adaptations yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {hasSignals
              ? "You have done/stuck signals on tasks. Open the Weekly Plan and choose Adapt Plan to generate the first revision."
              : "Mark a task done or stuck in the Weekly Plan — EduPath reacts to what you actually did, then explains the change here."}
          </p>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">The rules EduPath follows</h2>
        <p className="mt-1 text-sm text-slate-500">Deterministic adaptation runs in every mode — live AI or fallback.</p>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Task done", "Dependent tasks unlock and move up the plan."],
            ["Task stuck", "Difficulty is reduced and an easier prerequisite task is inserted before the retry."],
            ["Two stuck on one skill", "A struggle flag is raised and guided practice is recommended."],
            ["All tasks for a gap done", "The gap is marked progressing and the next priority takes over."],
          ].map(([rule, outcome]) => (
            <li key={rule} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <p className="text-sm font-semibold text-slate-800">{rule}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{outcome}</p>
            </li>
          ))}
        </ol>
      </section>
    </PageContainer>
  );
}
