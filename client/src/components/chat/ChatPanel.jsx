import React from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

function AiIcon({ className = "h-5 w-5" }) {
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

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3" role="status" aria-label="EduPath AI is thinking">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600"
        aria-hidden="true"
      >
        <AiIcon className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">EduPath AI is thinking</span>
        <span className="ml-1 inline-flex items-center gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 delay-150 motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 delay-300 motion-reduce:animate-none" />
        </span>
      </div>
    </div>
  );
}

function WelcomeState({ suggestions, onSuggestionClick }) {
  const clickableSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const canClickSuggestions = typeof onSuggestionClick === "function";

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center sm:px-8">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600"
        aria-hidden="true"
      >
        <AiIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-base font-semibold text-slate-900">How can I help?</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Hi! I&apos;m your EduPath AI assistant. Ask me about your learning plan,
        skill gaps, or next steps.
      </p>

      {clickableSuggestions.length > 0 && (
        <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
          {clickableSuggestions.map((suggestion, index) => {
            const text = typeof suggestion === "string" ? suggestion : suggestion?.label || suggestion?.text;
            if (!text) return null;

            return (
              <button
                key={`${text}-${index}`}
                type="button"
                disabled={!canClickSuggestions}
                onClick={() => canClickSuggestions && onSuggestionClick(suggestion)}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100"
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({
  messages = [],
  onSend,
  loading = false,
  title = "EduPath AI",
  subtitle = "Your personalized learning assistant",
  placeholder = "Ask EduPath AI anything...",
  disabled = false,
  suggestions = [],
  onSuggestionClick,
  onClear,
  className = "",
}) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const canClear = typeof onClear === "function";
  const canSend = typeof onSend === "function";

  return (
    <section
      className={`flex h-[min(720px,calc(100vh-2rem))] min-h-[520px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm ${className}`}
      aria-label="EduPath AI chat"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600"
            aria-hidden="true"
          >
            <AiIcon className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-950 sm:text-base">{title}</h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          </div>
        </div>

        {canClear && safeMessages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Clear
          </button>
        )}
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {safeMessages.length === 0 && !loading ? (
          <WelcomeState
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {safeMessages.map((message, index) => (
              <ChatMessage
                key={message?.id ?? index}
                message={message}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput
            onSend={canSend ? onSend : undefined}
            placeholder={placeholder}
            disabled={disabled || loading}
            aria-label="Message EduPath AI"
          />
        </div>
      </footer>
    </section>
  );
}
