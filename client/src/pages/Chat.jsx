import ChatPanel from "../components/chat/ChatPanel";
import AgentStatus from "../components/agent/AgentStatus";

const defaultSuggestions = [
  "What should I learn today?",
  "Explain my biggest skill gap",
  "Why was my learning plan changed?",
  "How can I improve my React skills?",
  "What should I work on next?",
];

function ContextIcon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (type === "role") {
    return (
      <svg {...props}>
        <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
      </svg>
    );
  }

  if (type === "focus") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (type === "action") {
    return (
      <svg {...props}>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.75 2" />
    </svg>
  );
}

function ContextItem({ type, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
        <ContextIcon type={type} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-400">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value || "Not provided"}</dd>
      </div>
    </div>
  );
}

export default function Chat({
  messages = [],
  loading = false,
  agentStatus = "online",
  userContext,
  onSend,
  onClear,
  onSuggestionClick,
}) {
  const safeContext = userContext && typeof userContext === "object" ? userContext : {};
  const suggestions = Array.isArray(safeContext.suggestions) && safeContext.suggestions.length > 0
    ? safeContext.suggestions
    : defaultSuggestions;
  const targetRole = safeContext.targetRole || safeContext.role;
  const currentProgress = safeContext.currentProgress ?? safeContext.progress;
  const progressValue = currentProgress === undefined || currentProgress === null
    ? undefined
    : `${currentProgress}%`;
  const currentFocus = safeContext.currentFocus || safeContext.focus;
  const nextAction = safeContext.nextAction;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Your AI learning assistant</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Ask EduPath AI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Get help understanding your skill gaps, learning plan, tasks, and next steps.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Assistant</span>
            <AgentStatus status={agentStatus} showDot showIcon size="sm" />
          </div>
        </header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)]">
          <ChatPanel
            messages={messages}
            onSend={onSend}
            loading={loading}
            title="EduPath AI"
            subtitle="Your personalized learning assistant"
            placeholder="Ask EduPath AI anything..."
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
            onClear={onClear}
          />

          <aside className="order-first rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:order-none sm:p-6" aria-labelledby="helpful-context-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="helpful-context-title" className="text-base font-semibold text-slate-950">Helpful Context</h2>
              <AgentStatus status={agentStatus} variant="minimal" showDot showLabel={false} size="sm" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use this context to frame your next question and keep the conversation focused.</p>

            <dl className="mt-5 space-y-3">
              <ContextItem type="role" label="Target role" value={targetRole} />
              <ContextItem type="progress" label="Current progress" value={progressValue} />
              <ContextItem type="focus" label="Current focus" value={currentFocus} />
              <ContextItem type="action" label="Next recommended action" value={nextAction} />
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
