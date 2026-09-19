import { useMemo, useState } from "react";
import GapCard from "./GapCard";

const severityFilters = ["all", "critical", "high", "medium", "low"];
const severityPriority = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
const sortOptions = [
  { value: "highest-gap", label: "Highest Gap" },
  { value: "lowest-gap", label: "Lowest Gap" },
  { value: "skill-name", label: "Skill Name" },
  { value: "current-score", label: "Current Score" },
  { value: "target-score", label: "Target Score" },
];
const gridClasses = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
};

function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function SkeletonCard() {
  return (
    <div
      className="min-h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-hidden="true"
    >
      <div className="h-5 w-2/5 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/4 rounded bg-slate-100" />
      <div className="mt-8 h-16 rounded-xl bg-slate-100" />
      <div className="mt-6 h-3 w-4/5 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-3/5 rounded bg-slate-100" />
      <div className="mt-8 h-9 w-32 rounded-lg bg-slate-100" />
    </div>
  );
}

function EmptyState({ filtered, title, description, onClearFilters }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8"
      role="status"
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600"
        aria-hidden="true"
      >
        ✦
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {filtered ? "No matching skill gaps" : title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Try changing your filters or sorting options."
          : description}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default function GapList({
  gaps = [],
  loading = false,
  title = "",
  description = "",
  showFilters = true,
  showSorting = true,
  columns = 3,
  onGapAction,
  emptyTitle = "No skill gaps to display",
  emptyDescription =
    "We don't have any skill-gap results to show yet. Complete your assessment to generate your analysis.",
  compact = false,
  showScores = true,
  showRecommendation = true,
  className = "",
}) {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("highest-gap");

  const safeGaps = Array.isArray(gaps) ? gaps : [];
  const safeColumns = [1, 2, 3, 4].includes(Number(columns))
    ? Number(columns)
    : 3;
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          safeGaps
            .map((gap) => (typeof gap?.category === "string" ? gap.category.trim() : ""))
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second)),
    [safeGaps],
  );

  const visibleGaps = useMemo(() => {
    const filtered = safeGaps.filter((gap) => {
      const severityMatches =
        selectedSeverity === "all" || normalize(gap?.gap) === selectedSeverity;
      const categoryMatches =
        selectedCategory === "all" || gap?.category === selectedCategory;
      return severityMatches && categoryMatches;
    });

    return filtered.slice().sort((first, second) => {
      const firstSeverity = severityPriority[normalize(first?.gap)] || 0;
      const secondSeverity = severityPriority[normalize(second?.gap)] || 0;
      const firstCurrentScore = getScore(first?.currentScore);
      const secondCurrentScore = getScore(second?.currentScore);
      const firstTargetScore = getScore(first?.targetScore);
      const secondTargetScore = getScore(second?.targetScore);

      switch (sortBy) {
        case "lowest-gap":
          return firstSeverity - secondSeverity;
        case "skill-name":
          return String(first?.skill || "").localeCompare(String(second?.skill || ""));
        case "current-score":
          return (secondCurrentScore ?? -1) - (firstCurrentScore ?? -1);
        case "target-score":
          return (secondTargetScore ?? -1) - (firstTargetScore ?? -1);
        case "highest-gap":
        default:
          return secondSeverity - firstSeverity;
      }
    });
  }, [safeGaps, selectedCategory, selectedSeverity, sortBy]);

  const hasActiveFilters =
    selectedSeverity !== "all" || selectedCategory !== "all";
  const skeletonCount = Math.min(6, Math.max(3, safeColumns * 2));
  const clearFilters = () => {
    setSelectedSeverity("all");
    setSelectedCategory("all");
  };

  return (
    <section className={`w-full min-w-0 ${compact ? "space-y-4" : "space-y-6"} ${className}`}>
      {(title || description || safeGaps.length >= 0) && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {description}
              </p>
            )}
          </div>
          <span className="shrink-0 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
            {safeGaps.length} {safeGaps.length === 1 ? "gap" : "gaps"}
          </span>
        </header>
      )}

      {(showFilters || showSorting) && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          {showFilters && (
            <div className="min-w-0 overflow-x-auto pb-1" aria-label="Filter skill gaps">
              <div className="flex min-w-max items-center gap-2">
                {severityFilters.map((filter) => {
                  const isActive = selectedSeverity === filter;
                  const label = filter === "all" ? "All" : filter[0].toUpperCase() + filter.slice(1);

                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedSeverity(filter)}
                      className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                        isActive
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {showFilters && categories.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <span className="shrink-0 font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="min-h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {showSorting && (
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <span className="shrink-0 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:flex-none"
                  aria-label="Sort skill gaps"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      )}

      {hasActiveFilters && !loading && safeGaps.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-700">{visibleGaps.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{safeGaps.length}</span> skill gaps
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${gridClasses[safeColumns]}`}
          aria-busy="true"
          aria-label="Loading skill gaps"
        >
          <span className="sr-only">Loading skill gaps</span>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : safeGaps.length === 0 ? (
        <EmptyState
          filtered={false}
          title={emptyTitle}
          description={emptyDescription}
          onClearFilters={clearFilters}
        />
      ) : visibleGaps.length === 0 ? (
        <EmptyState
          filtered
          title={emptyTitle}
          description={emptyDescription}
          onClearFilters={clearFilters}
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            compact ? "lg:gap-4" : "lg:gap-6"
          } ${gridClasses[safeColumns]}`}
        >
          {visibleGaps.map((gap, index) => (
            <GapCard
              key={`${gap?.skill || "gap"}-${gap?.category || "uncategorized"}-${index}`}
              skill={gap?.skill}
              currentLevel={gap?.currentLevel}
              requiredLevel={gap?.requiredLevel}
              gap={gap?.gap}
              currentScore={gap?.currentScore}
              targetScore={gap?.targetScore}
              category={gap?.category}
              description={gap?.description}
              recommendation={gap?.recommendation}
              compact={compact}
              showScores={showScores}
              showRecommendation={showRecommendation}
              onAction={
                typeof onGapAction === "function"
                  ? () => onGapAction(gap)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
