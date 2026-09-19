function AiAvatar({ compact = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 ${
        compact ? "h-7 w-7" : "h-9 w-9"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
        <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
      </svg>
    </span>
  );
}

function UserAvatar({ avatar, compact = false }) {
  if (typeof avatar === "string" && avatar.trim()) {
    return (
      <img
        src={avatar}
        alt=""
        className={`shrink-0 rounded-full object-cover ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600 ${
        compact ? "h-7 w-7" : "h-9 w-9"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
      </svg>
    </span>
  );
}

function SendingIndicator() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle" aria-hidden="true">
      <span className="h-1 w-1 animate-pulse rounded-full bg-current motion-reduce:animate-none" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current delay-150 motion-reduce:animate-none" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current delay-300 motion-reduce:animate-none" />
    </span>
  );
}

function ErrorIndicator() {
  return (
    <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-3.5 w-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="m12 4 8 15H4L12 4Z" />
        <path d="M12 9v4M12 16.5v.1" />
      </svg>
      Message failed to send
    </span>
  );
}

export default function ChatMessage({
  message,
  role = "assistant",
  content = "",
  timestamp,
  status = "sent",
  avatar,
  showTimestamp = true,
  compact = false,
  className = "",
}) {
  const messageRole = message?.role ?? role;
  const messageContent = message?.content ?? content;
  const messageTimestamp = message?.timestamp ?? timestamp;
  const messageStatus = message?.status ?? status;
  const messageAvatar = message?.avatar ?? avatar;
  const normalizedRole = String(messageRole || "assistant").trim().toLowerCase();
  const safeRole = ["user", "assistant", "system"].includes(normalizedRole)
    ? normalizedRole
    : "assistant";
  const normalizedStatus = String(messageStatus || "sent").trim().toLowerCase();
  const safeStatus = ["sending", "sent", "error"].includes(normalizedStatus)
    ? normalizedStatus
    : "sent";
  const text = messageContent === null || messageContent === undefined
    ? ""
    : String(messageContent);

  if (safeRole === "system") {
    return (
      <article
        className={`flex w-full justify-center px-2 ${compact ? "py-1" : "py-2"} ${className}`}
        aria-label="System message"
      >
        <div className="max-w-[90%] text-center text-xs leading-5 text-slate-500">
          <p className="whitespace-pre-wrap break-words">{text}</p>
          {showTimestamp && messageTimestamp && (
            <time className="mt-1 block text-[11px] text-slate-400">{messageTimestamp}</time>
          )}
        </div>
      </article>
    );
  }

  const isUser = safeRole === "user";
  const roleLabel = isUser ? "Your message" : "EduPath AI message";
  const bubbleClasses = isUser
    ? "rounded-2xl rounded-br-md bg-indigo-600 text-white shadow-sm"
    : "rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm";

  return (
    <article
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"} ${compact ? "gap-2" : ""} ${className}`}
      aria-label={roleLabel}
    >
      {!isUser && <AiAvatar compact={compact} />}

      <div className={`flex min-w-0 max-w-[88%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`${bubbleClasses} ${compact ? "px-3 py-2 text-xs leading-5" : "px-4 py-3 text-sm leading-6"} ${
            safeStatus === "error" ? "border-rose-200" : ""
          }`}
        >
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{text}</p>
          {safeStatus === "sending" && <SendingIndicator />}
          {safeStatus === "error" && <ErrorIndicator />}
        </div>

        {showTimestamp && messageTimestamp && (
          <time
            className={`mt-1 text-[11px] text-slate-400 ${isUser ? "mr-1" : "ml-1"}`}
          >
            {messageTimestamp}
          </time>
        )}
      </div>

      {isUser && <UserAvatar avatar={messageAvatar} compact={compact} />}
    </article>
  );
}
