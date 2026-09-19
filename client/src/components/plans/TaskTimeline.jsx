import TaskCard from "./TaskCard";

const timelineNodeStyles = {
  completed: "border-emerald-200 bg-emerald-500",
  "in-progress": "border-indigo-200 bg-indigo-500",
  pending: "border-slate-200 bg-slate-400",
  locked: "border-slate-200 bg-slate-300",
  skipped: "border-amber-200 bg-amber-400",
};

function getNodeStyle(status) {
  const normalizedStatus = String(status || "pending").trim().toLowerCase();
  return timelineNodeStyles[normalizedStatus] || timelineNodeStyles.pending;
}

function TimelineSkeleton() {
  return (
    <li className="relative flex gap-4 sm:gap-6">
      <div
        className="mt-6 hidden h-4 w-4 shrink-0 animate-pulse rounded-full border-4 border-slate-100 bg-slate-300 sm:block"
        aria-hidden="true"
      />
      <div className="w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-5 w-3/5 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-5/6 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
        <div className="mt-6 h-2 w-full rounded-full bg-slate-100" />
        <div className="mt-5 h-10 w-28 rounded-xl bg-slate-100" />
      </div>
    </li>
  );
}

function EmptyTimeline({ message }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8"
      role="status"
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">No learning tasks</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

export default function TaskTimeline({
  tasks = [],
  onOpenTask,
  onCompleteTask,
  loading = false,
  emptyMessage = "No tasks have been added to your learning plan yet.",
  className = "",
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (loading) {
    return (
      <section
        className={`w-full min-w-0 ${className}`}
        aria-busy="true"
        aria-label="Loading learning tasks"
      >
        <ol className="space-y-5 sm:space-y-6">
          <span className="sr-only">Loading learning tasks</span>
          {Array.from({ length: 4 }, (_, index) => (
            <TimelineSkeleton key={index} />
          ))}
        </ol>
      </section>
    );
  }

  if (safeTasks.length === 0) {
    return (
      <section className={`w-full min-w-0 ${className}`}>
        <EmptyTimeline message={emptyMessage} />
      </section>
    );
  }

  return (
    <section className={`w-full min-w-0 ${className}`} aria-label="Learning plan timeline">
      <ol className="space-y-5 sm:space-y-6">
        {safeTasks.map((task, index) => {
          const isLastTask = index === safeTasks.length - 1;

          return (
            <li
              key={task?.id || index}
              className="relative flex min-w-0 gap-4 sm:gap-6"
            >
              <div
                className="relative hidden w-4 shrink-0 sm:block"
                aria-hidden="true"
              >
                {!isLastTask && (
                  <span className="absolute left-1/2 top-10 h-[calc(100%+1.5rem)] w-px -translate-x-1/2 bg-slate-200" />
                )}
                <span
                  className={`relative z-10 mt-6 block h-4 w-4 rounded-full border-4 border-white shadow-sm ${getNodeStyle(task?.status)}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <TaskCard
                  id={task?.id}
                  title={task?.title}
                  description={task?.description}
                  status={task?.status}
                  type={task?.type}
                  duration={task?.duration}
                  difficulty={task?.difficulty}
                  skill={task?.skill}
                  dueDate={task?.dueDate}
                  progress={task?.progress}
                  resources={task?.resources}
                  onOpen={onOpenTask}
                  onComplete={onCompleteTask}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
