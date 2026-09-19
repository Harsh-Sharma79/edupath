const steps = [
  {
    number: "01",
    title: "Assess Your Skills",
    description: "Start with a clear view of the skills you already have and the areas you want to strengthen.",
    icon: "assessment",
  },
  {
    number: "02",
    title: "Discover Skill Gaps",
    description: "Understand which skills matter most for the role and goals you are working toward.",
    icon: "target",
  },
  {
    number: "03",
    title: "Follow Your Learning Plan",
    description: "Work through focused tasks and recommendations designed around your pace and priorities.",
    icon: "plan",
  },
  {
    number: "04",
    title: "Adapt & Improve",
    description: "Keep moving forward as your plan evolves with your progress and changing goals.",
    icon: "sparkle",
  },
];

const features = [
  {
    title: "Personalized Skill Analysis",
    description: "See a practical snapshot of your strengths, current level, and the skills worth developing next.",
    icon: "analysis",
    color: "indigo",
  },
  {
    title: "AI Skill Gap Detection",
    description: "Turn your target role into a clear set of focus areas instead of guessing what to learn.",
    icon: "target",
    color: "violet",
  },
  {
    title: "Adaptive Learning Plans",
    description: "Get an organized roadmap with manageable tasks that can adjust as your learning journey changes.",
    icon: "plan",
    color: "blue",
  },
  {
    title: "Progress Tracking",
    description: "Track completed tasks, improving skills, and momentum so every step feels visible.",
    icon: "progress",
    color: "emerald",
  },
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

  if (name === "assessment") {
    return (
      <svg {...props}>
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </svg>
    );
  }

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

  if (name === "sparkle") {
    return (
      <svg {...props}>
        <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
        <path d="m19 3 .45 1.55L21 5l-1.55.45L19 7l-.45-1.55L17 5l1.55-.45L19 3Z" />
      </svg>
    );
  }

  if (name === "analysis") {
    return (
      <svg {...props}>
        <path d="M4.5 19.5V14M10 19.5V9M15.5 19.5V4.5M21 19.5H3" />
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

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.2-2.3 5.8-2.3-5.8L4 11.3 9.7 9 12 3.5Z" />
    </svg>
  );
}

const colorClasses = {
  indigo: "border-indigo-100 bg-indigo-50 text-indigo-600",
  violet: "border-violet-100 bg-violet-50 text-violet-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
};

export default function Welcome({
  onGetStarted,
  onExploreDashboard,
  userName = "there",
}) {
  const getStarted = typeof onGetStarted === "function" ? onGetStarted : undefined;
  const exploreDashboard = typeof onExploreDashboard === "function"
    ? onExploreDashboard
    : undefined;

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"
              aria-hidden="true"
            >
              <Icon name="sparkle" className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-950">EduPath</span>
          </div>
          <span className="hidden text-sm text-slate-500 sm:block">Welcome, {userName}</span>
        </header>

        <section className="relative mx-auto max-w-5xl py-16 text-center sm:py-24 lg:py-28" aria-labelledby="welcome-title">
          <div className="pointer-events-none absolute left-1/2 top-10 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl" aria-hidden="true" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <Icon name="sparkle" className="h-3.5 w-3.5" />
              AI-Powered Learning
            </span>
            <h1 id="welcome-title" className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              Build the Skills for Your Future
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              EduPath analyzes your skills, identifies the gaps that matter for your goals, and creates a personalized learning plan that adapts as you make progress.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={getStarted}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Create My Learning Path
                <Icon name="arrow" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={exploreDashboard}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Explore Dashboard
              </button>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20" aria-labelledby="how-it-works-title">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">A clearer way forward</p>
            <h2 id="how-it-works-title" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">How EduPath Works</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Move from uncertainty to a focused learning journey in a few simple steps.</p>
          </div>
          <ol className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-slate-300">{step.number}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-14 sm:py-20" aria-labelledby="features-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Built around your goals</p>
              <h2 id="features-title" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Everything you need to keep learning</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">A practical workspace for understanding where you are and deciding what to do next.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClasses[feature.color]}`} aria-hidden="true">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14 sm:py-20" aria-labelledby="adaptation-title">
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  <Icon name="sparkle" className="h-3.5 w-3.5" />
                  Learning that adapts
                </span>
                <h2 id="adaptation-title" className="mt-5 max-w-xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Your plan changes as you grow.</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">EduPath helps you stay focused without locking you into a rigid checklist. As your progress changes, your learning journey can surface new priorities, reinforce important skills, and keep the next step clear.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6" aria-label="Example of an adapting learning plan">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">Your learning journey</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">On track</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/5 rounded-full bg-indigo-500" /></div>
                <div className="mt-5 space-y-3">
                  {["Skill focus identified", "Practice task recommended", "Next step ready"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${index < 2 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`} aria-hidden="true">
                        <Icon name={index < 2 ? "check" : "arrow"} className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 text-center sm:py-24" aria-labelledby="final-cta-title">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-10 shadow-sm sm:px-8 sm:py-12">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
              <Icon name="sparkle" className="h-5 w-5" />
            </span>
            <h2 id="final-cta-title" className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Ready to make your next move?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">Start with where you are today. EduPath will help turn your goals into a learning path you can follow.</p>
            <button
              type="button"
              onClick={getStarted}
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Start My Personalized Journey
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
