// Deterministic guidance engine. Given any learner context it produces the same
// structured outputs the live AI path would, so the product works end-to-end
// with no API key, no network and no degraded UX. These functions are also the
// backbone of the deterministic adaptation rules, which run regardless of mode.

function severityFromDelta(currentLevel, targetLevel) {
  const delta = targetLevel - currentLevel;
  if (delta >= 3) return "critical";
  if (delta === 2) return "high";
  return "medium";
}

// ---------------------------------------------------------------------------
// Gap analysis (fallback)
// ---------------------------------------------------------------------------
const ROLE_BLUEPRINTS = {
  "data analyst": [
    {
      skillName: "SQL Joins",
      currentLevel: 1,
      targetLevel: 4,
      reason:
        "Joining tables is the core daily skill of a Data Analyst; uncertainty here blocks every reporting task.",
      evidence:
        "Write five JOIN queries (INNER, LEFT, with aggregation) and explain each result set in plain language.",
    },
    {
      skillName: "Data Cleaning",
      currentLevel: 1,
      targetLevel: 3,
      reason:
        "Analysts spend most of their time preparing messy data before any analysis can happen.",
      evidence:
        "Clean a messy 500-row dataset, fixing missing values and duplicates while documenting each transformation.",
    },
    {
      skillName: "Pandas",
      currentLevel: 2,
      targetLevel: 4,
      reason:
        "Pandas is the standard toolkit that turns your Python comfort into practical analysis work.",
      evidence:
        "Load a CSV, produce a grouped summary with pandas, and export a cleaned output file.",
    },
    {
      skillName: "Data Visualization",
      currentLevel: 2,
      targetLevel: 3,
      reason:
        "Analysts are judged on how clearly charts carry a message, not just on computing the numbers.",
      evidence:
        "Pick the right chart type for three different questions and build each from the same dataset.",
    },
    {
      skillName: "Insight Communication",
      currentLevel: 1,
      targetLevel: 3,
      reason:
        "Presenting findings to non-technical stakeholders is the final differentiating skill for analyst roles.",
      evidence:
        "Write a one-page summary of an analysis with three insights and one recommendation.",
    },
  ],
  generic: [
    {
      skillName: "Applied Practice",
      currentLevel: 1,
      targetLevel: 3,
      reason: "Hands-on practice is the fastest way to convert existing knowledge into job-ready skill.",
      evidence: "Complete a small end-to-end project using the target role's core workflow.",
    },
    {
      skillName: "Core Tools",
      currentLevel: 2,
      targetLevel: 4,
      reason: "The standard tools of the role appear in most interviews and day-to-day tasks.",
      evidence: "Use the role's primary toolchain to complete a realistic task from start to finish.",
    },
    {
      skillName: "Communication",
      currentLevel: 1,
      targetLevel: 3,
      reason: "Explaining your work clearly multiplies the value of every technical skill.",
      evidence: "Summarize a finished task in plain language for a non-technical reader.",
    },
  ],
};

export function fallbackAnalyzeGaps(context) {
  const roleKey = String(context.targetRole || "").toLowerCase();
  const blueprint =
    Object.entries(ROLE_BLUEPRINTS).find(([key]) => roleKey.includes(key))?.[1] ||
    ROLE_BLUEPRINTS.generic;

  const knownSkills = context.skills.map((skill) => ({
    name: String(skill?.name || "").toLowerCase(),
    level: Number(skill?.level) || 1,
  }));

  const gaps = blueprint.map((entry, index) => {
    const match = knownSkills.find(
      (skill) =>
        skill.name.includes(entry.skillName.toLowerCase()) ||
        entry.skillName.toLowerCase().includes(skill.name),
    );
    const currentLevel = match
      ? Math.max(1, Math.min(5, match.level))
      : entry.currentLevel;
    return {
      skillName: entry.skillName,
      currentLevel,
      targetLevel: entry.targetLevel,
      priority: index + 1,
      reason: entry.reason,
      evidence: entry.evidence,
    };
  });

  return {
    gaps: gaps.slice(0, 5).map((gap) => ({
      ...gap,
      severity: severityFromDelta(gap.currentLevel, gap.targetLevel),
    })),
  };
}

// ---------------------------------------------------------------------------
// Weekly plan (fallback) — concrete tasks sized to the weekly hour budget
// ---------------------------------------------------------------------------
export function fallbackGeneratePlan(context, gaps) {
  const weeklyMinutes = Math.max(120, (context.weeklyHours || 5) * 60);
  const targetCount = Math.min(5, Math.max(3, Math.round(weeklyMinutes / 75)));
  const prioritized = gaps.slice(0, 3);

  const templates = [
    {
      day: 1,
      effortMinutes: 60,
      title: (gap) => `Learn the fundamentals of ${gap.skillName}`,
      description: (gap) =>
        `Work through one focused tutorial on ${gap.skillName}, then reproduce every example yourself against a small dataset.`,
      resource: (gap) => `Search: '${gap.skillName} beginner tutorial with worked examples'.`,
      completionAction: () => "You can explain the core concept in two sentences without notes.",
      stuckAction: () => "Re-watch the tutorial and copy each example verbatim before continuing.",
      dependsOn: () => "",
    },
    {
      day: 2,
      effortMinutes: 45,
      title: (gap) => `Practice ${gap.skillName} with a guided exercise`,
      description: (gap) =>
        `Complete one guided exercise using ${gap.skillName}, then repeat it once from memory to check understanding.`,
      resource: () => "Use any interactive practice environment listed in the tutorial.",
      completionAction: () => "The exercise works when repeated from memory without looking at the solution.",
      stuckAction: () => "Repeat the tutorial examples once more, then attempt a smaller variant of the exercise.",
      dependsOn: (gap) => `Learn the fundamentals of ${gap.skillName}`,
    },
    {
      day: 4,
      effortMinutes: 75,
      title: (gap) => `Apply ${gap.skillName} to a realistic mini-task`,
      description: (gap) =>
        `Complete one small realistic task using ${gap.skillName} end to end, and write down every step you took.`,
      resource: () => "Pick a dataset or scenario from the practice environment.",
      completionAction: () => "The finished task and a short step-by-step log both exist.",
      stuckAction: () => "Split the task in half and complete only the first half this week.",
      dependsOn: (gap) => `Practice ${gap.skillName} with a guided exercise`,
    },
  ];

  const tasks = [];
  for (const gap of prioritized) {
    const perGap = Math.max(1, Math.round(targetCount / prioritized.length));
    templates.slice(0, perGap).forEach((template) => {
      const baseTitle = template.title(gap);
      const dependsOn = template.dependsOn ? template.dependsOn(gap) : "";
      tasks.push({
        title: baseTitle,
        description: template.description(gap),
        effortMinutes: template.effortMinutes,
        day: template.day,
        gapIndex: Math.max(0, gaps.indexOf(gap)),
        resource: template.resource(gap),
        completionAction: template.completionAction(),
        stuckAction: template.stuckAction(),
        difficulty: "standard",
        dependsOn,
      });
    });
  }

  const selected = tasks
    .sort((a, b) => a.day - b.day)
    .slice(0, targetCount);

  const objectives = prioritized.slice(0, 2).map((gap) =>
    `Move ${gap.skillName} from level ${gap.currentLevel} toward level ${gap.targetLevel} with deliberate practice this week.`,
  );

  return { objectives, tasks: selected };
}

// ---------------------------------------------------------------------------
// Plan revision (fallback) — deterministic done/stuck rules
// ---------------------------------------------------------------------------
export function fallbackRevisePlan(context, observations) {
  const changes = [];
  let reasonParts = [];
  let affectedGap = "";
  let nextAction = "";
  let revisedTask = null;

  for (const observation of observations) {
    if (observation.type === "done") {
      const task = observation.task;
      changes.push({
        type: "task_unlocked",
        taskTitle: task.title,
        detail: `Marked complete: "${task.title}". The dependent task is now unlocked and moved up the plan.`,
      });
      reasonParts.push(
        `"${task.title}" was completed, so the next step for ${observation.gapName || "the affected skill"} moves forward.`,
      );
    }

    if (observation.type === "stuck") {
      const task = observation.task;
      affectedGap = observation.gapName || affectedGap;
      const prerequisiteTitle = `Review ${affectedGap || "the topic"}: fill missing pieces before the full task`;
      changes.push({
        type: "task_added",
        taskTitle: prerequisiteTitle,
        detail: `Reduced difficulty after a stuck signal on "${task.title}". Inserted an easier prerequisite: "${prerequisiteTitle}".`,
      });
      reasonParts.push(
        `"${task.title}" was marked stuck, so difficulty was reduced and a prerequisite practice step was inserted before retrying it.`,
      );
      revisedTask = {
        title: prerequisiteTitle,
        description: `Work through the specific concept behind "${task.title}" on a much smaller example first. For example, review missing values and practice filling them in a small dataset before attempting the full task again.`,
        effortMinutes: 30,
        day: Math.max(1, (task.day || 1) - 0),
        gapIndex: 0,
        resource: "Revisit the tutorial section the stuck task came from.",
        completionAction: "You can complete the small example without help.",
        stuckAction: "Ask the AI coach for a worked example, then repeat it.",
        difficulty: "easier",
        dependsOn: "",
      };
      nextAction = `Start the easier prerequisite "${prerequisiteTitle}" before retrying "${task.title}".`;
    }
  }

  if (!changes.length) {
    changes.push({
      type: "explanation_added",
      taskTitle: "",
      detail: "No completion or stuck signals were found, so the current plan still stands.",
    });
    reasonParts.push("No new task outcomes were recorded since the last revision.");
    nextAction = "Continue with the next open task in the current plan.";
  }

  return {
    changes,
    reason: reasonParts.join(" "),
    affectedGap,
    nextAction,
    revisedTask,
  };
}

// ---------------------------------------------------------------------------
// Plan-aware chat (fallback) — template answers grounded in stored state
// ---------------------------------------------------------------------------
export function fallbackChatAnswer(context, question) {
  const normalized = String(question || "").toLowerCase();
  const name = context.profile?.name || "the learner";
  const role = context.targetRole || "your target role";
  const gaps = context.gaps || [];
  const topGap = gaps[0];
  const activeTask = (context.tasks || []).find((task) => task.status === "todo");
  const stuckTasks = (context.tasks || []).filter((task) => task.status === "stuck");
  const doneTasks = (context.tasks || []).filter((task) => task.status === "done");

  if (normalized.includes("priorit") || normalized.includes("why") || normalized.includes("order")) {
    const gapNames = gaps.slice(0, 3).map((gap) => gap.skillName).join(", ");
    return {
      answer:
        `${name}'s target role is ${role}, so the plan prioritizes ${gapNames}. ` +
        (topGap
          ? `${topGap.skillName} comes first — recorded reason: ${topGap.reason}`
          : "") +
        ` Based on the current profile, ${gaps.length} gaps were identified from the skills already listed and the requirements of ${role}.`,
      contextUsed: ["targetRole", "currentSkills", "gapPriorities"],
    };
  }

  if (normalized.includes("stuck") || normalized.includes("difficult") || normalized.includes("hard")) {
    if (stuckTasks.length) {
      return {
        answer:
          `You marked "${stuckTasks[0].title}" as stuck. EduPath responded by reducing difficulty and inserting an easier prerequisite step before that task. ` +
          `The revised plan now front-loads a smaller practice example so the full task becomes reachable.`,
        contextUsed: ["activeTask", "stuckEvents", "planRevision"],
      };
    }
    return {
      answer:
        `No tasks are currently marked stuck. If one feels hard, mark it stuck and the plan will adapt by inserting an easier prerequisite step.`,
      contextUsed: ["taskStatuses"],
    };
  }

  if (normalized.includes("next") || normalized.includes("today") || normalized.includes("now")) {
    return {
      answer: activeTask
        ? `Your next action is "${activeTask.title}" (day ${activeTask.day}, about ${activeTask.effortMinutes} minutes). ${activeTask.completionAction || ""}`.trim()
        : `All visible tasks are completed or waiting on a plan revision. Generate a new plan to keep moving.`,
      contextUsed: ["activeTask", "plan"],
    };
  }

  if (normalized.includes("progress") || normalized.includes("report") || normalized.includes("momentum")) {
    return {
      answer:
        `So far you have completed ${doneTasks.length} of ${(context.tasks || []).length} tasks this week` +
        (stuckTasks.length ? `, with ${stuckTasks.length} marked stuck and adapted around.` : ".") +
        ` Progress is computed directly from your task events, not generated.`,
      contextUsed: ["taskEvents", "progress"],
    };
  }

  return {
    answer:
      `Here is where you stand for ${role}: ` +
      (topGap ? `the top priority gap is ${topGap.skillName} (level ${topGap.currentLevel} → ${topGap.targetLevel}). ` : "") +
      (activeTask ? `Your next task is "${activeTask.title}" on day ${activeTask.day}.` : `Generate a weekly plan to get concrete tasks.`) +
      ` This answer uses only your stored profile, gaps and plan.`,
    contextUsed: ["targetRole", "gaps", "activePlan"],
  };
}
