import GapList from "../components/gaps/GapList";
import RoleSelector from "../components/profile/RoleSelector";

function SummaryIcon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (type === "critical") {
    return (
      <svg {...props}>
        <path d="m12 4 8 15H4L12 4Z" />
        <path d="M12 9v4M12 16.5v.1" />
      </svg>
    );
  }

  if (type === "high") {
    return (
      <svg {...props}>
        <path d="M12 4v16M4 12h16" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }

  if (type === "aligned") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="m8 12 2.5 2.5L16.5 8" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
    </svg>
  );
}

function SummaryCard({ label, value, type, tone }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`} aria-hidden="true">
          <SummaryIcon type={type} />
        </span>
        <span className="text-2xl font-semibold tabular-nums text-slate-950">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}

function LoadingSummary() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex justify-between">
            <div className="h-9 w-9 rounded-xl bg-slate-100" />
            <div className="h-7 w-8 rounded bg-slate-100" />
          </div>
          <div className="mt-4 h-3 w-24 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function SkillGaps({
  selectedRole,
  gaps = [],
  roles = [],
  loading = false,
  onRoleChange,
  onRefresh,
  onGapAction,
}) {
  const safeGaps = Array.isArray(gaps) ? gaps : [];
  const selectedRoleValue = typeof selectedRole === "object"
    ? selectedRole?.label || selectedRole?.id || ""
    : selectedRole || "";
  const selectedRoleLabel = typeof selectedRole === "object"
    ? selectedRole?.label || selectedRole?.id || "your target role"
    : selectedRole || "your target role";
  const canRefresh = typeof onRefresh === "function";
  const criticalCount = safeGaps.filter((gap) => String(gap?.gap || "").trim().toLowerCase() === "critical").length;
  const highCount = safeGaps.filter((gap) => String(gap?.gap || "").trim().toLowerCase() === "high").length;
  const alignedCount = safeGaps.filter((gap) => gap?.meetsTarget === true).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Skill analysis</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Your Skill Gaps</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              See which skills you need to strengthen to reach your target role.
            </p>
          </div>
          {canRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:self-auto"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M20 11a8 8 0 0 0-13.7-4.8L4 8.5M4 5v3.5h3.5M4 13a8 8 0 0 0 13.7 4.8L20 15.5M20 19v-3.5h-3.5" />
              </svg>
              {loading ? "Analyzing..." : "Re-analyze Skills"}
            </button>
          )}
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="target-role-title">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Your direction</p>
              <h2 id="target-role-title" className="mt-2 text-lg font-semibold text-slate-950">Target role</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Your skill-gap view is organized around <span className="font-semibold text-slate-700">{selectedRoleLabel}</span>. Change the role anytime to see a different set of priorities.
              </p>
            </div>
            <RoleSelector
              value={selectedRoleValue}
              onChange={onRoleChange}
              roles={roles}
              label="Choose your target role"
              placeholder="Search for a target role..."
              allowCustom
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="gap-summary-title">
          <div className="mb-4">
            <h2 id="gap-summary-title" className="text-xl font-semibold tracking-tight text-slate-950">Skill Gap Summary</h2>
            <p className="mt-1 text-sm text-slate-500">A quick view of the supplied skill-gap analysis.</p>
          </div>
          {loading ? (
            <LoadingSummary />
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <SummaryCard label="Total Skill Gaps" value={safeGaps.length} type="total" tone="bg-indigo-50 text-indigo-600" />
              <SummaryCard label="Critical Gaps" value={criticalCount} type="critical" tone="bg-rose-50 text-rose-600" />
              <SummaryCard label="High-Priority Gaps" value={highCount} type="high" tone="bg-orange-50 text-orange-600" />
              <SummaryCard label="Already Meeting Target" value={alignedCount} type="aligned" tone="bg-emerald-50 text-emerald-600" />
            </div>
          )}
        </section>

        {!loading && safeGaps.length === 0 && (
          <section className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-8 text-center sm:px-8" aria-labelledby="no-gaps-title" role="status">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-600" aria-hidden="true">
              <SummaryIcon type="aligned" />
            </div>
            <h2 id="no-gaps-title" className="mt-4 text-lg font-semibold text-emerald-950">No skill gaps identified yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-800/80">Your current analysis does not contain any gaps to display. Re-analyze your skills when you are ready for an updated view.</p>
            {canRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors duration-200 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Re-analyze Skills
              </button>
            )}
          </section>
        )}

        {(loading || safeGaps.length > 0) && (
          <section className="mt-8" aria-label="Skill gap list">
            <GapList
              gaps={safeGaps}
              loading={loading}
              title="Skills to Strengthen"
              description="Review each gap, then choose a focused action to keep moving toward your role."
              showFilters
              showSorting
              columns={3}
              onGapAction={onGapAction}
              emptyTitle="No skill gaps to display"
              emptyDescription="There are no skill-gap results to show for this analysis yet."
              showScores
              showRecommendation
            />
          </section>
        )}
      </div>
    </main>
  );
}
