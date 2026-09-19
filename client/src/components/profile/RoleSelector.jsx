import { useEffect, useId, useMemo, useRef, useState } from "react";

const defaultRoles = [
  {
    id: "frontend-developer",
    label: "Frontend Developer",
    description: "Build responsive and interactive web interfaces.",
    category: "Software Development",
  },
  {
    id: "backend-developer",
    label: "Backend Developer",
    description: "Build APIs, servers, databases, and backend systems.",
    category: "Software Development",
  },
  {
    id: "full-stack-developer",
    label: "Full Stack Developer",
    description: "Build both frontend and backend applications.",
    category: "Software Development",
  },
  {
    id: "data-scientist",
    label: "Data Scientist",
    description: "Analyze data and build statistical and machine learning models.",
    category: "Data & AI",
  },
  {
    id: "machine-learning-engineer",
    label: "Machine Learning Engineer",
    description: "Build and deploy machine learning systems.",
    category: "Data & AI",
  },
  {
    id: "ai-engineer",
    label: "AI Engineer",
    description: "Build applications powered by artificial intelligence.",
    category: "Data & AI",
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    description: "Turn data into useful insights for decision-making.",
    category: "Data & AI",
  },
  {
    id: "ui-ux-designer",
    label: "UI/UX Designer",
    description: "Design useful, accessible, and engaging digital experiences.",
    category: "Design",
  },
  {
    id: "cybersecurity-analyst",
    label: "Cybersecurity Analyst",
    description: "Monitor, investigate, and protect systems from security threats.",
    category: "Cybersecurity",
  },
  {
    id: "cloud-engineer",
    label: "Cloud Engineer",
    description: "Design, deploy, and manage cloud infrastructure.",
    category: "Cloud & DevOps",
  },
  {
    id: "devops-engineer",
    label: "DevOps Engineer",
    description: "Automate software delivery and manage reliable infrastructure.",
    category: "Cloud & DevOps",
  },
  {
    id: "product-manager",
    label: "Product Manager",
    description: "Plan and guide products from idea to delivery.",
    category: "Product",
  },
];

const noop = () => {};

function normalize(value) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
}

function groupByCategory(roles) {
  return roles.reduce((groups, role) => {
    const category = role.category || "Other Roles";
    if (!groups[category]) groups[category] = [];
    groups[category].push(role);
    return groups;
  }, {});
}

export default function RoleSelector({
  value = "",
  onChange = noop,
  roles = defaultRoles,
  label = "What role are you aiming for?",
  placeholder = "Search for a role...",
  allowCustom = true,
  showDescriptions = true,
  disabled = false,
  error = "",
  compact = false,
  className = "",
}) {
  const selectorId = useId();
  const selectorRef = useRef(null);
  const inputId = `${selectorId}-input`;
  const listboxId = `${selectorId}-listbox`;
  const errorId = `${selectorId}-error`;

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const safeRoles = Array.isArray(roles)
    ? roles.filter((role) => role && role.id && role.label)
    : [];
  const normalizedQuery = normalize(query);
  const filteredRoles = useMemo(() => {
    if (!normalizedQuery) return safeRoles;

    return safeRoles.filter((role) =>
      [role.label, role.category, role.description].some((field) =>
        normalize(field).includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery, safeRoles]);
  const groupedRoles = useMemo(() => groupByCategory(filteredRoles), [filteredRoles]);
  const popularRoles = safeRoles.slice(0, 3);
  const exactRoleMatch = safeRoles.some(
    (role) => normalize(role.label) === normalizedQuery,
  );
  const canUseCustom = Boolean(
    allowCustom && normalizedQuery && !exactRoleMatch && filteredRoles.length === 0,
  );
  const optionCount = filteredRoles.length + (canUseCustom ? 1 : 0);
  const hasResults = optionCount > 0;
  const describedBy = error ? errorId : undefined;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectRole = (roleValue) => {
    if (disabled) return;

    onChange(roleValue);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown" && hasResults) {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((currentIndex) =>
        currentIndex >= optionCount - 1 ? 0 : currentIndex + 1,
      );
      return;
    }

    if (event.key === "ArrowUp" && hasResults) {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((currentIndex) =>
        currentIndex <= 0 ? optionCount - 1 : currentIndex - 1,
      );
      return;
    }

    if (event.key === "Enter" && isOpen && highlightedIndex >= 0) {
      event.preventDefault();

      if (highlightedIndex < filteredRoles.length) {
        selectRole(filteredRoles[highlightedIndex].id);
      } else if (canUseCustom) {
        selectRole(query.trim());
      }
    }
  };

  const renderRoleOption = (role, index) => {
    const isSelected = value === role.id;
    const isHighlighted = highlightedIndex === index;
    const optionId = `${selectorId}-option-${role.id}`;

    return (
      <button
        key={role.id}
        id={optionId}
        type="button"
        role="option"
        aria-selected={isSelected}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => selectRole(role.id)}
        className={`w-full rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isHighlighted
            ? "border-indigo-300 bg-indigo-50"
            : isSelected
              ? "border-indigo-200 bg-indigo-50/60"
              : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
        }`}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {role.label}
            </span>
            <span className="mt-1 block text-xs font-medium text-indigo-600">
              {role.category || "Other Roles"}
            </span>
            {showDescriptions && !compact && role.description && (
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {role.description}
              </span>
            )}
          </span>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
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
      </button>
    );
  };

  return (
    <div
      ref={selectorRef}
      className={`w-full min-w-0 ${disabled ? "cursor-not-allowed opacity-70" : ""} ${className}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`flex items-center rounded-xl border bg-white shadow-sm transition duration-200 focus-within:ring-2 ${
            error
              ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
              : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100"
          } ${compact ? "min-h-10 px-3" : "min-h-12 px-4"}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="mr-2 h-5 w-5 shrink-0 text-slate-400"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.25 4.25" />
          </svg>
          <input
            id={inputId}
            type="search"
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleInputKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-activedescendant={
              highlightedIndex >= 0
                ? highlightedIndex < filteredRoles.length
                  ? `${selectorId}-option-${filteredRoles[highlightedIndex].id}`
                  : `${selectorId}-custom-option`
                : undefined
            }
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
          <span
            className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {isOpen && !disabled && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Career role options"
            className="absolute left-0 right-0 z-20 mt-2 max-h-[min(28rem,calc(100vh-12rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            {hasResults ? (
              Object.entries(groupedRoles).map(([category, categoryRoles]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {categoryRoles.map((role) =>
                      renderRoleOption(role, filteredRoles.indexOf(role)),
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-2 py-3">
                <p className="text-sm text-slate-600">No roles found.</p>
                {!allowCustom && (
                  <p className="mt-1 text-xs text-slate-400">
                    Try a different search.
                  </p>
                )}
              </div>
            )}

            {canUseCustom && (
              <button
                id={`${selectorId}-custom-option`}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectRole(query.trim())}
                className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  highlightedIndex === filteredRoles.length
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span aria-hidden="true" className="mr-2 text-base">
                  +
                </span>
                Use &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      {!normalizedQuery && popularRoles.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-800">Popular Roles</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popularRoles.map((role) => {
              const isSelected = value === role.id;

              return (
                <button
                  key={`popular-${role.id}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectRole(role.id)}
                  aria-pressed={isSelected}
                  className={`rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {role.label}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {role.category || "Other Roles"}
                      </span>
                    </span>
                    {isSelected && (
                      <span className="shrink-0 text-sm font-bold text-indigo-600" aria-label="Selected">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value && (
        <p className="mt-3 text-sm text-slate-600">
          Selected role: <span className="font-semibold text-slate-900">{value}</span>
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
