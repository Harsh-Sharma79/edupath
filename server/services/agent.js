// The agent orchestrator. Live AI and deterministic fallback sit behind one
// interface so the frontend never knows which mode produced its data. The
// backend owns persistence, authorization and the deterministic rules; the
// model only ever contributes validated JSON.
import { db, now, parseJson } from "../db/database.js";
import {
  buildLearnerContext,
  getActiveProfile,
  getGaps,
  getActivePlan,
  getPlanTasks,
  getRecentChat,
} from "./context.js";
import { config } from "../config.js";
import {
  fallbackAnalyzeGaps,
  fallbackGeneratePlan,
  fallbackRevisePlan,
  fallbackChatAnswer,
} from "./fallbacks.js";
import {
  isLiveAiEnabled,
  liveAnalyzeGaps,
  liveGeneratePlan,
  liveRevisePlan,
  liveChatAnswer,
} from "./liveAI.js";

const insertGap = db.prepare(
  `INSERT INTO skill_gaps
     (profile_id, skill_name, current_level, target_level, priority, severity, reason, evidence, status, source, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'identified', ?, ?)`,
);
const insertPlan = db.prepare(
  `INSERT INTO weekly_plans (user_id, week_number, objectives_json, source, generated_at)
   VALUES (?, ?, ?, ?, ?)`,
);
const insertTask = db.prepare(
  `INSERT INTO plan_tasks
     (plan_id, gap_id, title, description, effort_minutes, day, status, resource, completion_action, stuck_action, difficulty, depends_on, revision, created_at)
   VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?, ?)`,
);
const insertAdaptation = db.prepare(
  `INSERT INTO adaptations (user_id, plan_id, title, reason, affected_gap, changes_json, trigger_task_id, source, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertChatMessage = db.prepare(
  `INSERT INTO chat_messages (user_id, role, content, context_used_json, source, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
);

export function agentMode() {
  return isLiveAiEnabled() ? "LIVE_AI" : "FALLBACK";
}

function recordAdaptation(userId, planId, title, reason, affectedGap, changes, triggerTaskId, source) {
  const result = insertAdaptation.run(
    userId,
    planId,
    title,
    reason,
    affectedGap,
    JSON.stringify(changes),
    triggerTaskId ?? null,
    source,
    now(),
  );
  return db.prepare("SELECT * FROM adaptations WHERE id = ?").get(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// analyzeSkillGaps(profile, target_role)
// ---------------------------------------------------------------------------
export async function analyzeSkillGaps(userId) {
  const profile = getActiveProfile(userId);
  if (!profile) return { error: "NO_PROFILE", message: "Save a learner profile before analyzing gaps." };

  const context = buildLearnerContext(userId);
  let gapsResult;
  let source = "fallback";

  if (isLiveAiEnabled()) {
    try {
      const live = await liveAnalyzeGaps(context);
      if (live.ok) {
        gapsResult = live.data;
        source = "live_ai";
      }
    } catch {
      // fall through to fallback
    }
  }
  if (!gapsResult) {
    gapsResult = fallbackAnalyzeGaps(context);
  }

  // Upsert semantics: re-analysis must preserve gap ids so existing plans and
  // tasks keep their associations. Rows are matched case-insensitively by name.
  const existingGaps = getGaps(profile.id);
  const existingByName = new Map(
    existingGaps.map((gap) => [gap.skill_name.trim().toLowerCase(), gap]),
  );
  const incomingNames = new Set(gapsResult.gaps.map((gap) => gap.skillName.trim().toLowerCase()));

  const updateGap = db.prepare(
    `UPDATE skill_gaps
     SET current_level = ?, target_level = ?, priority = ?, severity = ?, reason = ?, evidence = ?, source = ?
     WHERE id = ?`,
  );
  const deleteGap = db.prepare("DELETE FROM skill_gaps WHERE id = ?");

  // Remove gaps that disappeared from the analysis and have no task references.
  for (const gap of existingGaps) {
    if (incomingNames.has(gap.skill_name.trim().toLowerCase())) continue;
    const references = db
      .prepare("SELECT COUNT(*) AS n FROM plan_tasks WHERE gap_id = ?")
      .get(gap.id)?.n || 0;
    if (references === 0) deleteGap.run(gap.id);
  }

  for (const gap of gapsResult.gaps) {
    const severity =
      gap.targetLevel - gap.currentLevel >= 3
        ? "critical"
        : gap.targetLevel - gap.currentLevel === 2
          ? "high"
          : "medium";
    const match = existingByName.get(gap.skillName.trim().toLowerCase());
    if (match) {
      updateGap.run(
        gap.currentLevel,
        gap.targetLevel,
        gap.priority,
        severity,
        gap.reason,
        gap.evidence,
        source,
        match.id,
      );
    } else {
      insertGap.run(
        profile.id,
        gap.skillName,
        gap.currentLevel,
        gap.targetLevel,
        gap.priority,
        severity,
        gap.reason,
        gap.evidence,
        source,
        now(),
      );
    }
  }

  const saved = getGaps(profile.id).map((gap) => ({
    id: gap.id,
    skillName: gap.skill_name,
    currentLevel: gap.current_level,
    targetLevel: gap.target_level,
    priority: gap.priority,
    severity: gap.severity,
    reason: gap.reason,
    evidence: gap.evidence,
    status: gap.status,
    source: gap.source,
  }));

  return { source, gaps: saved };
}

// ---------------------------------------------------------------------------
// create_weekly_plan(gaps, constraints)
// ---------------------------------------------------------------------------
export async function generatePlan(userId) {
  const profile = getActiveProfile(userId);
  if (!profile) return { error: "NO_PROFILE", message: "Save a learner profile first." };

  const gaps = getGaps(profile.id);
  if (!gaps.length) {
    return { error: "NO_GAPS", message: "Run a gap analysis before generating a plan." };
  }

  const context = buildLearnerContext(userId);
  const normalizedGaps = gaps.map((gap) => ({
    id: gap.id,
    skillName: gap.skill_name,
    currentLevel: gap.current_level,
    targetLevel: gap.target_level,
    priority: gap.priority,
  }));

  let planResult;
  let source = "fallback";
  if (isLiveAiEnabled()) {
    try {
      const live = await liveGeneratePlan(context, normalizedGaps);
      if (live.ok) {
        planResult = live.data;
        source = "live_ai";
      }
    } catch {
      // fall through to fallback
    }
  }
  if (!planResult) {
    planResult = fallbackGeneratePlan(
      context,
      normalizedGaps,
    );
  }

  const { lastInsertRowid: planId } = insertPlan.run(
    userId,
    (db.prepare("SELECT COALESCE(MAX(week_number), 0) + 1 AS n FROM weekly_plans WHERE user_id = ?").get(userId)?.n) || 1,
    JSON.stringify(planResult.objectives),
    source,
    now(),
  );

  for (const task of planResult.tasks) {
    insertTask.run(
      planId,
      normalizedGaps[task.gapIndex]?.id ?? null,
      task.title,
      task.description,
      task.effortMinutes,
      task.day,
      task.resource || "",
      task.completionAction || "",
      task.stuckAction || "",
      task.difficulty || "standard",
      task.dependsOn || "",
      0,
      now(),
    );
  }

  const tasks = getPlanTasks(planId).map((task) => serializeTask(task));
  return {
    source,
    plan: {
      id: planId,
      weekNumber: db.prepare("SELECT week_number FROM weekly_plans WHERE id = ?").get(planId)?.week_number ?? 1,
      objectives: planResult.objectives,
      generatedAt: now(),
    },
    tasks,
  };
}

export function serializeTask(task) {
  return {
    id: task.id,
    planId: task.plan_id,
    gapId: task.gap_id,
    title: task.title,
    description: task.description,
    effortMinutes: task.effort_minutes,
    day: task.day,
    status: task.status,
    resource: task.resource,
    completionAction: task.completion_action,
    stuckAction: task.stuck_action,
    difficulty: task.difficulty,
    dependsOn: task.depends_on,
    revision: task.revision,
  };
}

// ---------------------------------------------------------------------------
// revise_plan(plan, progress_events, gaps)
// ---------------------------------------------------------------------------
export async function revisePlan(userId) {
  const plan = getActivePlan(userId);
  if (!plan) return { error: "NO_PLAN", message: "Generate a plan before revising it." };

  const context = buildLearnerContext(userId);
  const tasks = context.tasks;
  if (!tasks.length) return { error: "NO_PLAN", message: "The active plan has no tasks to revise." };

  // Observations: task statuses already persisted through /api/tasks/:id/status
  const observations = [];
  for (const task of tasks) {
    if (task.status === "done") {
      observations.push({ type: "done", task, gapName: context.gaps.find((g) => g.id === task.gapId)?.skillName || "" });
    }
    if (task.status === "stuck") {
      observations.push({ type: "stuck", task, gapName: context.gaps.find((g) => g.id === task.gapId)?.skillName || "" });
    }
  }

  const deterministic = fallbackRevisePlan(context, observations);
  const revisionNumber = (db.prepare("SELECT COALESCE(MAX(revision), 0) AS n FROM plan_tasks WHERE plan_id = ?").get(plan.id)?.n || 0) + 1;

  let source = "fallback";
  let revision = deterministic;
  if (isLiveAiEnabled()) {
    try {
      const live = await liveRevisePlan(context, observations, deterministic);
      if (live.ok) {
        revision = live.data;
        source = "live_ai";
      }
    } catch {
      // keep deterministic revision
    }
  }

  // Persist the revised (or inserted prerequisite) task. Guard against
  // duplicate inserts when a revision is requested twice for the same signal.
  let persistedTask = null;
  if (revision.revisedTask) {
    const duplicate = db
      .prepare("SELECT id FROM plan_tasks WHERE plan_id = ? AND title = ?")
      .get(plan.id, revision.revisedTask.title);
    if (duplicate) {
      persistedTask = serializeTask(db.prepare("SELECT * FROM plan_tasks WHERE id = ?").get(duplicate.id));
    }
  }
  if (revision.revisedTask && !persistedTask) {
    const gapId = context.gaps.find((gap) => gap.skillName === revision.affectedGap)?.id
      ?? tasks.find((task) => task.status === "stuck")?.gapId
      ?? null;
    const result = insertTask.run(
      plan.id,
      gapId,
      revision.revisedTask.title,
      revision.revisedTask.description,
      revision.revisedTask.effortMinutes || 30,
      revision.revisedTask.day || 1,
      revision.revisedTask.resource || "",
      revision.revisedTask.completionAction || "",
      revision.revisedTask.stuckAction || "",
      revision.revisedTask.difficulty || "easier",
      revision.revisedTask.dependsOn || "",
      revisionNumber,
      now(),
    );
    persistedTask = serializeTask(db.prepare("SELECT * FROM plan_tasks WHERE id = ?").get(result.lastInsertRowid));
    // The stuck task is retried after the prerequisite.
    db.prepare(
      "UPDATE plan_tasks SET day = day + 1, revision = ? WHERE id = ? AND status = 'stuck'",
    ).run(revisionNumber, (tasks.find((task) => task.status === "stuck") || {}).id || 0);
  }

  db.prepare("UPDATE weekly_plans SET revised_at = ? WHERE id = ?").run(now(), plan.id);

  const adaptation = recordAdaptation(
    userId,
    plan.id,
    revision.changes[0]?.taskTitle
      ? `Plan revised: ${revision.changes[0].taskTitle}`
      : "Plan revision generated",
    revision.reason,
    revision.affectedGap,
    revision.changes,
    tasks.find((task) => task.status === "stuck")?.id ?? null,
    source,
  );

  return {
    source,
    adaptation: {
      id: adaptation.id,
      title: adaptation.title,
      reason: adaptation.reason,
      affectedGap: adaptation.affected_gap,
      changes: parseJson(adaptation.changes_json, []),
      source: adaptation.source,
      createdAt: adaptation.created_at,
      nextAction: revision.nextAction,
    },
    revisedTask: persistedTask,
    tasks: getPlanTasks(plan.id).map((task) => serializeTask(task)),
  };
}

// ---------------------------------------------------------------------------
// answer_chat(question) — plan-aware, grounded in stored state
// ---------------------------------------------------------------------------
export async function answerChat(userId, question) {
  const trimmed = String(question || "").trim().slice(0, config.chat.maxMessageLength);
  if (!trimmed) return { error: "EMPTY_MESSAGE", message: "Type a question for the coach." };

  const context = buildLearnerContext(userId);
  const recent = getRecentChat(userId, config.chat.maxHistoryMessages).map((row) => ({
    role: row.role,
    content: row.content,
  }));

  let answer;
  let contextUsed = [];
  let source = "fallback";

  if (isLiveAiEnabled()) {
    try {
      const live = await liveChatAnswer(context, trimmed, recent);
      if (live.ok) {
        answer = live.data.answer;
        contextUsed = live.data.contextUsed;
        source = "live_ai";
      }
    } catch {
      // fall through to deterministic answer
    }
  }
  if (!answer) {
    const fallback = fallbackChatAnswer(context, trimmed);
    answer = fallback.answer;
    contextUsed = fallback.contextUsed;
  }

  insertChatMessage.run(userId, "user", trimmed, "[]", source, now());
  const { lastInsertRowid: assistantMessageId } = insertChatMessage.run(
    userId,
    "assistant",
    answer,
    JSON.stringify(contextUsed),
    source,
    now(),
  );

  return {
    source,
    messages: [
      { id: Number(assistantMessageId) - 1, role: "user", content: trimmed, createdAt: now() },
      {
        id: Number(assistantMessageId),
        role: "assistant",
        content: answer,
        contextUsed,
        createdAt: now(),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// summarize_progress(context) — computed from stored state, never from AI
// ---------------------------------------------------------------------------
export function computeProgress(userId) {
  const profile = getActiveProfile(userId);
  const gaps = profile ? getGaps(profile.id) : [];
  const plan = getActivePlan(userId);
  const tasks = plan ? getPlanTasks(plan.id) : [];

  const done = tasks.filter((task) => task.status === "done");
  const stuck = tasks.filter((task) => task.status === "stuck");
  const todo = tasks.filter((task) => task.status === "todo");
  const total = tasks.length;
  const completionRate = total ? Math.round((done.length / total) * 100) : 0;

  const completedEvidence = gaps
    .filter((gap) => gap.status === "progressing" || gap.status === "mastered")
    .map((gap) => ({
      skillName: gap.skill_name,
      status: gap.status,
      evidence: gap.evidence,
    }));

  const inProgress = gaps
    .filter((gap) => gap.status === "in_progress" || gap.status === "identified")
    .map((gap) => ({
      skillName: gap.skill_name,
      currentLevel: gap.current_level,
      targetLevel: gap.target_level,
      priority: gap.priority,
    }));

  const struggleAreas = gaps
    .filter((gap) => gap.status === "struggle")
    .map((gap) => gap.skill_name);

  const nextTask =
    todo.sort((a, b) => a.day - b.day)[0] ||
    stuck.sort((a, b) => a.day - b.day)[0] ||
    null;

  const momentum =
    stuck.length === 0 && done.length > 0
      ? "strong"
      : stuck.length > done.length
        ? "needs_attention"
        : done.length > 0
          ? "steady"
          : "just_starting";

  const latestAdaptation = db
    .prepare("SELECT * FROM adaptations WHERE user_id = ? ORDER BY id DESC LIMIT 1")
    .get(userId);

  return {
    profile: profile
      ? { name: profile.name, targetRole: profile.target_role, weeklyHours: profile.weekly_hours }
      : null,
    tasks: { total, done: done.length, stuck: stuck.length, todo: todo.length, completionRate },
    skills: {
      completedEvidence,
      inProgress,
      struggleAreas,
      gapsTotal: gaps.length,
    },
    momentum,
    nextAction: nextTask
      ? {
          taskId: nextTask.id,
          title: nextTask.title,
          description: nextTask.description,
          effortMinutes: nextTask.effort_minutes,
          day: nextTask.day,
          reason:
            nextTask.status === "stuck"
              ? "Retry after the inserted prerequisite practice."
              : "It is the next open task in your active plan.",
        }
      : null,
    latestAdaptation: latestAdaptation
      ? {
          id: latestAdaptation.id,
          title: latestAdaptation.title,
          reason: latestAdaptation.reason,
          changes: parseJson(latestAdaptation.changes_json, []),
          createdAt: latestAdaptation.created_at,
        }
      : null,
  };
}

