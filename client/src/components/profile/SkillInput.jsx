import { useId, useState } from "react";

const noop = () => {};

function normalizeSkill(skill) {
  return typeof skill === "string" ? skill.trim() : "";
}

function skillKey(skill) {
  return normalizeSkill(skill).toLocaleLowerCase();
}

export default function SkillInput({
  value = [],
  onChange = noop,
  suggestions = [],
  label = "Skills",
  placeholder = "Search or add a skill...",
  maxSkills,
  helperText,
  allowCustom = true,
  disabled = false,
  error,
  className = "",
}) {
  const inputId = useId();
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const listboxId = `${inputId}-suggestions`;

  const [inputValue, setInputValue] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedSkills = Array.isArray(value) ? value : [];
  const normalizedSuggestions = Array.from(
    new Map(
      (Array.isArray(suggestions) ? suggestions : [])
        .map(normalizeSkill)
        .filter(Boolean)
        .map((skill) => [skillKey(skill), skill]),
    ).values(),
  );
  const selectedKeys = new Set(selectedSkills.map(skillKey));
  const query = normalizeSkill(inputValue);
  const queryKey = skillKey(query);
  const maxIsSet = Number.isFinite(maxSkills);
  const maxReached = maxIsSet && selectedSkills.length >= maxSkills;

  const filteredSuggestions = normalizedSuggestions.filter((skill) => {
    const matchesQuery = !queryKey || skillKey(skill).includes(queryKey);
    return matchesQuery && !selectedKeys.has(skillKey(skill));
  });

  const hasExactSuggestion = filteredSuggestions.some(
    (skill) => skillKey(skill) === queryKey,
  );
  const canAddCustom = Boolean(
    allowCustom && query && !selectedKeys.has(queryKey) && !hasExactSuggestion,
  );
  const hasSuggestionOptions = filteredSuggestions.length > 0 || canAddCustom;
  const isInvalid = Boolean(error);
  const describedBy = [helperText && helperTextId, error && errorId]
    .filter(Boolean)
    .join(" ");

  const addSkill = (skill) => {
    const normalizedSkill = normalizeSkill(skill);
    const normalizedKey = skillKey(normalizedSkill);
    const isSuggestedSkill = normalizedSuggestions.some(
      (suggestion) => skillKey(suggestion) === normalizedKey,
    );

    if (
      !normalizedSkill ||
      disabled ||
      maxReached ||
      selectedKeys.has(normalizedKey) ||
      (!allowCustom && !isSuggestedSkill)
    ) {
      return false;
    }

    onChange([...selectedSkills, normalizedSkill]);
    setInputValue("");
    setHighlightedIndex(-1);
    setIsSuggestionsOpen(false);
    return true;
  };

  const removeSkill = (skillToRemove) => {
    if (disabled) return;

    const removeKey = skillKey(skillToRemove);
    const skillIndex = selectedSkills.findIndex(
      (skill) => skillKey(skill) === removeKey,
    );

    if (skillIndex === -1) return;

    onChange(selectedSkills.filter((_, index) => index !== skillIndex));
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setHighlightedIndex(-1);
    setIsSuggestionsOpen(true);
  };

  const handleInputKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown" && hasSuggestionOptions) {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setHighlightedIndex((currentIndex) => {
        const optionCount = filteredSuggestions.length + (canAddCustom ? 1 : 0);
        return currentIndex >= optionCount - 1 ? 0 : currentIndex + 1;
      });
      return;
    }

    if (event.key === "ArrowUp" && hasSuggestionOptions) {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setHighlightedIndex((currentIndex) => {
        const optionCount = filteredSuggestions.length + (canAddCustom ? 1 : 0);
        return currentIndex <= 0 ? optionCount - 1 : currentIndex - 1;
      });
      return;
    }

    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (event.key === "Backspace" && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (isSuggestionsOpen && highlightedIndex >= 0) {
        if (highlightedIndex < filteredSuggestions.length) {
          addSkill(filteredSuggestions[highlightedIndex]);
        } else if (canAddCustom) {
          addSkill(query);
        }
        return;
      }

      addSkill(inputValue);
    }
  };

  const handleSuggestionClick = (skill) => {
    addSkill(skill);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          {label}
        </label>
      )}

      {helperText && (
        <p id={helperTextId} className="mb-3 text-sm leading-5 text-slate-500">
          {helperText}
        </p>
      )}

      <div className="relative">
        <div
          className={`flex min-h-11 items-center rounded-xl border bg-white px-3 shadow-sm transition duration-200 focus-within:ring-2 ${
            isInvalid
              ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100"
              : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100"
          } ${disabled ? "cursor-not-allowed bg-slate-50 opacity-70" : ""}`}
        >
          <input
            id={inputId}
            type="text"
            value={inputValue}
            disabled={disabled || maxReached}
            placeholder={maxReached ? "Maximum skills reached" : placeholder}
            onChange={handleInputChange}
            onFocus={() => setIsSuggestionsOpen(true)}
            onKeyDown={handleInputKeyDown}
            aria-invalid={isInvalid}
            aria-describedby={describedBy || undefined}
            aria-controls={hasSuggestionOptions ? listboxId : undefined}
            aria-expanded={isSuggestionsOpen && hasSuggestionOptions}
            aria-autocomplete="list"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            disabled={disabled || maxReached || !query}
            onClick={() => addSkill(inputValue)}
            className="ml-2 inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-lg font-medium leading-none text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label={query ? `Add ${query}` : "Add skill"}
          >
            +
          </button>
        </div>

        {isSuggestionsOpen && !disabled && !maxReached && hasSuggestionOptions && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Skill suggestions"
            className="absolute left-0 right-0 z-10 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            {filteredSuggestions.map((skill, index) => {
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  key={`${skill}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(skill)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isHighlighted
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {skill}
                </button>
              );
            })}

            {canAddCustom && (
              <button
                type="button"
                role="option"
                aria-selected={highlightedIndex === filteredSuggestions.length}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addSkill(query)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  highlightedIndex === filteredSuggestions.length
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span aria-hidden="true" className="mr-2 text-base">
                  +
                </span>
                Add &quot;{query}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      {isInvalid && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Selected Skills</h2>
          <span
            className={`text-xs font-medium ${
              maxReached ? "text-amber-700" : "text-slate-500"
            }`}
          >
            {selectedSkills.length}
            {maxIsSet ? ` / ${maxSkills}` : ""} skills
          </span>
        </div>

        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 py-1 pl-3 pr-1 text-sm text-indigo-800"
              >
                <span className="max-w-[16rem] truncate">{skill}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeSkill(skill)}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-5 text-slate-500">
            No skills added yet. Add skills you already know to help EduPath
            understand your current level.
          </p>
        )}
      </div>

      {normalizedSuggestions.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">
            Suggested Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((skill) => (
                <button
                  key={`suggestion-${skill}`}
                  type="button"
                  disabled={disabled || maxReached}
                  onClick={() => handleSuggestionClick(skill)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {skill}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No matching suggestions.</p>
            )}
          </div>
        </div>
      )}

      {maxReached && (
        <p className="mt-3 text-xs font-medium text-amber-700">
          You have reached the maximum number of skills.
        </p>
      )}
    </div>
  );
}
