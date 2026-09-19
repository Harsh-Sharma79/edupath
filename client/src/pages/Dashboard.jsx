import ProfileCard from "../components/common/ProfileCard";
import AgentActivity from "../components/agent/AgentActivity";
import AgentStatus from "../components/agent/AgentStatus";
import NextAction from "../components/progress/NextAction";
import ProgressSummary from "../components/progress/ProgressSummary";
import SkillProgress from "../components/progress/SkillProgress";

const fallbackSkills = [
  {
    skill: "JavaScript",
    category: "Frontend",
    currentScore: 58,
    targetScore: 85,
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    progress: 68,
    previousScore: 51,
  },
  {
    skill: "React",
    category: "Frontend",
    currentScore: 65,
    targetScore: 88,
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    progress: 72,
    previousScore: 61,
  },
  {
    skill: "Python",
    category: "Programming",
    currentScore: 44,
    targetScore: 78,
    currentLevel: "Beginner",
    targetLevel: "Intermediate",
    progress: 56,
    previousScore: 40,
  },
  {
    skill: "SQL",
    category: "Data",
    currentScore: 72,
    targetScore: 90,
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    progress: 80,
    previousScore: 67,
  },
  {
    skill: "Git",
    category: "Tools",
    currentScore: 78,
    targetScore: 90,
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    progress: 86,
    previousScore: 74,
  },
];

const fallbackActivities = [
  {
    id: "activity-1",
    type: "analysis",
    title: "Skill progress analyzed",
    description: "Your recent practice is improving JavaScript fundamentals.",
    timestamp: "Today",
    status: "completed",
  },
  {
    id: "activity-2",
    type: "plan",
    title: "Learning plan updated",
    description: "Your next focus area is asynchronous JavaScript patterns.",
    timestamp: "Yesterday",
    status: "completed",
  },
  {
    id: "activity-3",
    type: "recommendation",
    title: "New task recommended",
    description: "A focused practice task was added to your plan.",
    timestamp: "2 days ago",
    status: "completed",
  },
];

const quickNavigation = [
  { key: "skill-gaps", title: "Skill Gaps", description: "See the areas to focus on next.", icon: "target" },
  { key: "learning-plan", title: "Learning Plan", description: "Continue your personalized roadmap.", icon: "plan" },
  { key: "adaptations", title: "Adaptations", description: "Review recent plan changes.", icon: "sparkle" },
  { key: "chat", title: "Chat", description: "Ask EduPath AI for guidance.", icon: "chat" },
  { key: "progress", title: "Progress", description: "Explore your learning momentum.", icon: "progress" },
];

function Icon({ name, className = "h-5 w-5" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": "true",
  };

  if (name === "target") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="3" />
        <path d="m17.5 6.5 2-2M19.5 4.5h-2.25M19.5 4.5v2.25" />
      </svg>
    );
  }

  if (name === "plan") {
    return (
      <svg {...props}>
        <path d="m4 6.5 5-2 6 2 5-2v13l-5 2-6-2-5 2v-13Z" />
        <path d="M9 4.5v13M15 6.5v13" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg {...props}>
        <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
        <path d="M7 10h10M7 13h6" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.75 2" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
    </svg>
  );
}

export default function Dashboard({
  user,
  progress,
  skills = [],
  nextAction,
  agentActivities = [],
  agentStatus = "online",
  onNextAction,
  onNavigate,
}) {
  const safeUser = user || {};
  const progressData = progress && typeof progress === "object" ? progress : {};
  const overallProgress = progressData.overallProgress ?? (typeof progress === "number" ? progress : 68);
  const safeSkills = Array.isArray(skills) && skills.length > 0 ? skills : fallbackSkills;
  const safeActivities = Array.isArray(agentActivities) && agentActivities.length > 0
    ? agentActivities
    : fallbackActivities;
  const displayName = safeUser.name || "Harsh";
  const targetRole = safeUser.targetRole || safeUser.role || "Frontend Developer";
  const profileLevel = safeUser.level || safeUser.currentLevel || "Intermediate";
  const profileCourse = safeUser.course || targetRole;
  const profileProgress = safeUser.progress ?? overallProgress;
  const action = nextAction || {
    title: "Complete JavaScript Async Patterns",
    description: "Practice promises, async/await, and error handling with focused exercises.",
    actionLabel: "Start Task",
    type: "Recommended Action",
    priority: "high",
    skill: "JavaScript",
    duration: "45 min",
    reason: "This is one of the most useful next skills for your target role.",
  };

  const handleNavigate = (destination) => {
    if (typeof onNavigate === "function") {
      onNavigate(destination);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Your learning workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Good morning, {displayName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep your momentum going. Here&apos;s a focused view of your progress and what to work on next.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleNavigate("learning-plan")}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:self-auto"
          >
            Open Learning Plan
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <ProfileCard
            name={displayName}
            email={safeUser.email || ""}
            avatar={safeUser.avatar || ""}
            course={profileCourse}
            year={safeUser.year || ""}
            level={profileLevel}
            progress={profileProgress}
          />
          <ProgressSummary
            overallProgress={overallProgress}
            skillsImproved={progressData.skillsImproved ?? 7}
            tasksCompleted={progressData.tasksCompleted ?? 18}
            totalTasks={progressData.totalTasks ?? 26}
            learningStreak={progressData.learningStreak ?? 6}
            previousProgress={progressData.previousProgress}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <NextAction
            {...action}
            onAction={typeof onNextAction === "function" ? onNextAction : undefined}
          />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="agent-status-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="agent-status-title" className="text-base font-semibold text-slate-950">EduPath AI</h2>
              <AgentStatus status={agentStatus} showIcon showDot size="sm" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Your assistant is here to help you understand your progress and choose your next focus area.</p>
            <button
              type="button"
              onClick={() => handleNavigate("chat")}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors duration-200 hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Ask EduPath AI
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </section>
        </div>

        <section className="mt-8" aria-labelledby="skill-progress-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="skill-progress-title" className="text-xl font-semibold tracking-tight text-slate-950">Skill Progress</h2>
              <p className="mt-1 text-sm text-slate-500">See how your core skills are moving toward your target role.</p>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate("progress")}
              className="self-start text-sm font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              View all progress
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {safeSkills.map((skillItem, index) => (
              <SkillProgress
                key={skillItem?.id || skillItem?.skill || index}
                skill={skillItem?.skill || skillItem?.name || "Skill"}
                category={skillItem?.category}
                currentScore={skillItem?.currentScore}
                targetScore={skillItem?.targetScore}
                currentLevel={skillItem?.currentLevel}
                targetLevel={skillItem?.targetLevel}
                progress={skillItem?.progress}
                previousScore={skillItem?.previousScore}
                showScores
                showLevels
                showCategory
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" aria-label="Agent updates and quick navigation">
          <AgentActivity activities={safeActivities} title="Recent Agent Activity" maxItems={3} />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="quick-navigation-title">
            <h2 id="quick-navigation-title" className="text-base font-semibold text-slate-950">Quick Navigation</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickNavigation.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
                  </span>
                  <Icon name="arrow" className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
