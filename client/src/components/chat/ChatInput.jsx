import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = "Ask EduPath AI anything...",
  disabled = false,
  loading = false,
  maxLength = 2000,
  autoFocus = false,
  showCharacterCount = false,
  allowMultiline = true,
  className = "",
}) {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState("");
  const isControlled = value !== undefined && typeof onChange === "function";
  const inputValue = isControlled ? String(value ?? "") : localValue;
  const isBlocked = disabled || loading;
  const hasMessage = inputValue.trim().length > 0;
  const safeMaxLength = Number.isFinite(Number(maxLength)) && Number(maxLength) > 0
    ? Number(maxLength)
    : undefined;

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!allowMultiline || !inputRef.current) return;

    const element = inputRef.current;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
  }, [allowMultiline, inputValue]);

  const updateValue = (nextValue) => {
    const next = safeMaxLength ? nextValue.slice(0, safeMaxLength) : nextValue;

    if (isControlled) {
      onChange(next);
    } else {
      setLocalValue(next);
    }
  };

  const submitMessage = () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isBlocked || typeof onSend !== "function") return;

    onSend(trimmedMessage);
    if (!isControlled) {
      setLocalValue("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    submitMessage();
  };

  const inputClasses = `min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 ${
    allowMultiline ? "max-h-36 min-h-10" : "h-10"
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${className}`}
      noValidate
    >
      <label htmlFor="edupath-chat-input" className="sr-only">
        Message EduPath AI
      </label>

      <div
        className={`rounded-2xl border bg-white p-2 shadow-sm transition-colors duration-200 ${
          isBlocked
            ? "border-slate-200"
            : "border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100"
        }`}
      >
        <div className="flex items-end gap-2">
          {allowMultiline ? (
            <textarea
              ref={inputRef}
              id="edupath-chat-input"
              value={inputValue}
              onChange={(event) => updateValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isBlocked}
              maxLength={safeMaxLength}
              rows={1}
              className={inputClasses}
            />
          ) : (
            <input
              ref={inputRef}
              id="edupath-chat-input"
              type="text"
              value={inputValue}
              onChange={(event) => updateValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isBlocked}
              maxLength={safeMaxLength}
              className={inputClasses}
            />
          )}

          <button
            type="submit"
            disabled={isBlocked || !hasMessage}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 animate-spin motion-reduce:animate-none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8" className="opacity-25" />
                <path d="M20 12a8 8 0 0 0-8-8" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <path d="m4 4 16 8-16 8 3.25-8L4 4Z" />
                <path d="M7.25 12H20" />
              </svg>
            )}
          </button>
        </div>

        {showCharacterCount && safeMaxLength && (
          <div className="mt-1 flex justify-end px-1 text-xs tabular-nums text-slate-400">
            {inputValue.length} / {safeMaxLength}
          </div>
        )}
      </div>
    </form>
  );
}
