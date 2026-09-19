import React from "react";
import { useId } from "react";

const defaultLevels = [
  {
    id: "beginner",
    label: "Beginner",
    description: "I have basic knowledge and need guidance.",
    icon: "🌱",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "I can work independently on common tasks.",
    icon: "⚡",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "I can solve complex problems independently.",
    icon: "🚀",
  },
];

const noop = () => {};

export default function SkillLevel({
  skill = "",
  value = "",
  onChange = noop,
  levels = defaultLevels,
  showDescription = true,
  disabled = false,
  error = "",
  compact = false,
  className = "",
}) {
  const groupId = useId();
  const groupName = `skill-level-${groupId}`;
  const errorId = `${groupId}-error`;
  const safeLevels = Array.isArray(levels) ? levels : [];
  const legend = skill
    ? `How would you rate your ${skill} skills?`
    : "How would you rate your skill level?";

  return (
    <fieldset
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
      className={`w-full min-w-0 ${disabled ? "cursor-not-allowed opacity-70" : ""} ${className}`}
    >
      <legend className="mb-4 text-base font-semibold text-slate-950 sm:text-lg">
        {legend}
      </legend>

      {safeLevels.length > 0 ? (
        <div
          className={`grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 ${
            compact ? "lg:grid-cols-3" : "lg:grid-cols-3"
          }`}
        >
          {safeLevels.map((level) => {
            const isSelected = value === level.id;
            const inputId = `${groupId}-${level.id}`;

            return (
              <label
                key={level.id}
                htmlFor={inputId}
                className={`relative flex min-w-0 cursor-pointer flex-col rounded-2xl border bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                  compact ? "min-h-0 p-3" : "min-h-[148px] p-4 sm:p-5"
                } ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/70 shadow-md shadow-indigo-100"
                    : "border-slate-200 shadow-sm hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md"
                } ${disabled ? "pointer-events-none" : ""}`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={level.id}
                  checked={isSelected}
                  onChange={() => onChange(level.id)}
                  className="peer sr-only"
                  aria-label={level.label}
                />

                <span className="flex items-start justify-between gap-3">
                  <span
                    className={`flex shrink-0 items-center justify-center rounded-xl border text-xl ${
                      compact ? "h-9 w-9" : "h-11 w-11"
                    } ${
                      isSelected
                        ? "border-indigo-200 bg-white"
                        : "border-slate-100 bg-slate-50"
                    }`}
                    aria-hidden="true"
                  >
                    {level.icon}
                  </span>

                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="h-3 w-3"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m2.5 6 2.2 2.2L9.5 3.5" />
                    </svg>
                  </span>
                </span>

                <span className={`mt-3 block ${compact ? "mt-2" : ""}`}>
                  <span
                    className={`block font-semibold ${
                      compact ? "text-sm" : "text-sm sm:text-base"
                    } ${isSelected ? "text-indigo-950" : "text-slate-900"}`}
                  >
                    {level.label}
                  </span>

                  {showDescription && !compact && level.description && (
                    <span className="mt-2 block text-xs leading-5 text-slate-500 sm:text-sm">
                      {level.description}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No skill levels are available.
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
