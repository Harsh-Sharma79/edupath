import React from "react";
import AdaptationCard from "../components/plans/AdaptationCard";
import AgentActivity from "../components/agent/AgentActivity";
import AgentStatus from "../components/agent/AgentStatus";

const adaptationSteps = [
  {
    number: "01",
    title: "EduPath tracks your progress",
    description: "Your completed tasks and supplied progress updates provide context for your learning journey.",
  },
  {
    number: "02",
    title: "It identifies changes in your needs",
    description: "New priorities can be surfaced when updated learning information is available.",
  },
  {
    number: "03",
    title: "Your plan is updated accordingly",
    description: "The learning plan can reflect those supplied updates with clearer next steps.",
  },
];

function SparkleIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
    </svg>
  );
}

function EmptyAdaptationState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm sm:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600" aria-hidden="true">
        <SparkleIcon />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">No adaptations to show yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">When a plan update is supplied, you will see a concise explanation of what changed here.</p>
    </div>
  );
}

function LoadingAdaptationState() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-hidden="true">
      <div className="h-5 w-28 rounded bg-slate-200" />
      <div className="mt-4 h-6 w-3/5 rounded bg-slate-200" />
      <div className="mt-6 h-3 w-4/5 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-3/5 rounded bg-slate-100" />
      <div className="mt-7 h-10 w-36 rounded-xl bg-slate-100" />
    </div>
  );
}

export default function Adaptation({
  adaptations = [],
  latestAdaptation,
  agentStatus = "online",
  loading = false,
  onViewPlan,
  onDismiss,
}) {
  const safeAdaptations = Array.isArray(adaptations) ? adaptations : [];
  const currentAdaptation = latestAdaptation || safeAdaptations[0];
  const hasCurrentAdaptation = currentAdaptation && typeof currentAdaptation === "object";
  const canViewPlan = typeof onViewPlan === "function";
  const canDismiss = typeof onDismiss === "function";
  const historyActivities = safeAdaptations.map((adaptation, index) => ({
    id: adaptation?.id || `adaptation-${index}`,
    type: "adaptation",
    title: adaptation?.title || adaptation?.type || "Plan adaptation",
    description: adaptation?.description || adaptation?.reason || "A learning plan update was supplied.",
    timestamp: adaptation?.timestamp,
    status: adaptation?.status || "completed",
    metadata: {
      impact: adaptation?.impact,
      changes: Array.isArray(adaptation?.changes) ? adaptation.changes.length : undefined,
    },
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">Transparent learning updates</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">AI Plan Adaptations</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">EduPath continuously adjusts your learning plan as your skills and progress change.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Agent status</span>
            <AgentStatus status={agentStatus} showDot showIcon size="sm" />
          </div>
        </header>

        <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="agent-status-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600" aria-hidden="true">
                <SparkleIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 id="agent-status-heading" className="text-base font-semibold text-slate-950">Current Agent Status</h2>
                <p className="mt-1 text-sm text-slate-500">A high-level view of the assistant&apos;s current state.</p>
              </div>
            </div>
            <AgentStatus status={agentStatus} showDot showIcon size="md" />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="latest-adaptation-heading">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Most recent update</p>
            <h2 id="latest-adaptation-heading" className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Latest Adaptation</h2>
          </div>
          {loading ? (
            <LoadingAdaptationState />
          ) : hasCurrentAdaptation ? (
            <AdaptationCard
              {...currentAdaptation}
              onViewPlan={canViewPlan ? () => onViewPlan(currentAdaptation) : undefined}
              onDismiss={canDismiss ? () => onDismiss(currentAdaptation) : undefined}
            />
          ) : (
            <EmptyAdaptationState />
          )}
        </section>

        <section className="mt-8" aria-labelledby="adaptation-history-heading">
          <div className="mb-5">
            <h2 id="adaptation-history-heading" className="text-xl font-semibold tracking-tight text-slate-950">Adaptation History</h2>
            <p className="mt-1 text-sm text-slate-500">Concise, user-facing updates supplied for your learning plan.</p>
          </div>
          <AgentActivity
            activities={historyActivities}
            title="Plan Updates"
            maxItems={null}
            loading={loading}
            emptyMessage="No previous plan adaptations have been supplied."
          />
        </section>

        <section className="mt-8" aria-labelledby="how-adaptation-works-heading">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">A clear, high-level view</p>
              <h2 id="how-adaptation-works-heading" className="mt-2 text-xl font-semibold tracking-tight text-slate-950">How Adaptation Works</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">EduPath keeps the learning journey understandable by focusing on visible progress and practical next steps.</p>
            </div>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {adaptationSteps.map((step) => (
                <li key={step.number} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                      <SparkleIcon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-300">{step.number}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
