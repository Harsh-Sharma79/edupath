import React, { useEffect, useRef, useState } from "react";
import { useEduPath } from "../context/LearnerContext";
import { fetchChatHistory } from "../services/api";
import PageContainer from "../components/layout/PageContainer";
import ChatPanel from "../components/chat/ChatPanel";

const SUGGESTIONS = [
  "Why is SQL prioritized before Pandas?",
  "What should I work on next?",
  "Why did my plan change?",
  "How much progress have I made?",
];

export default function Chat() {
  const { ask, profile, planTasks, agentMode, showToast } = useEduPath();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchChatHistory();
        if (!cancelled) {
          setMessages(
            (res?.messages || []).map((row) => ({
              id: row.id,
              role: row.role,
              content: row.content,
              timestamp: row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : "",
            })),
          );
        }
      } catch {
        // history is optional
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || loading) return;

    const optimisticId = `local-${Date.now()}`;
    setMessages((current) => [...current, { id: optimisticId, role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await ask(trimmed);
      const assistant = (res?.messages || []).find((message) => message.role === "assistant");
      if (assistant) {
        setMessages((current) => [
          ...current,
          {
            id: assistant.id,
            role: "assistant",
            content: assistant.content,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (error) {
      showToast(error.message || "The coach could not answer right now.", "error");
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
    } finally {
      setLoading(false);
    }
  };

  const activeTask = planTasks.find((task) => task.status === "todo");
  const context = {
    targetRole: profile?.targetRole || "",
    currentProgress: planTasks.length
      ? Math.round((planTasks.filter((task) => task.status === "done").length / planTasks.length) * 100)
      : 0,
    currentFocus: activeTask?.title || "Generate a plan to get a focus task",
    nextAction: activeTask ? `${activeTask.title} (day ${activeTask.day})` : "—",
    suggestions: SUGGESTIONS,
  };

  return (
    <PageContainer
      title="Ask EduPath"
      description="Plan-aware coaching. Answers are grounded in your stored profile, gaps and plan — never invented."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)]">
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          loading={loading}
          title="EduPath AI Coach"
          subtitle={
            agentMode === "LIVE_AI"
              ? "Live model with plan context"
              : "Prepared guidance from your plan state"
          }
          placeholder="Ask why the plan prioritizes something, or what to do next…"
          suggestions={SUGGESTIONS}
          onSuggestionClick={(suggestion) => handleSend(typeof suggestion === "string" ? suggestion : suggestion?.text)}
        />

        <aside className="order-first rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:order-none sm:p-6" aria-labelledby="chat-context-title">
          <h2 id="chat-context-title" className="text-base font-semibold text-slate-950">Grounding context</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The coach can only use these facts — the same rule the backend enforces.
          </p>
          <dl className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-medium text-slate-400">Target role</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{profile?.targetRole || "Not set"}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-medium text-slate-400">Current progress</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {planTasks.filter((task) => task.status === "done").length} of {planTasks.length} tasks done
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-medium text-slate-400">Current focus</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{activeTask?.title || "—"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </PageContainer>
  );
}
