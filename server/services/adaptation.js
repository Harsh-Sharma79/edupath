// Deterministic adaptation rules — the PRD's core agent loop, always applied
// regardless of AI mode. These rules make the demo reliable and explainable.
import { db, now } from "../db/database.js";
import { getStuckCountsByGap } from "./context.js";

function gapById(context, gapId) {
  return context.gaps.find((gap) => gap.id === gapId) || null;
}

// IF task.status == DONE → unlock the dependent task.
function unlockDependentTasks(context, task) {
  const unlocked = [];
  if (!task?.dependsOn) return unlocked;
  const needle = task.dependsOn.trim().toLowerCase();
  if (!needle) return unlocked;

  for (const candidate of context.tasks) {
    const isDependent = candidate.dependsOn &&
      candidate.dependsOn.trim().toLowerCase() === needle;
    const stillTodo = candidate.status === "todo";
    if (isDependent && stillTodo && candidate.id !== task.id) {
      db.prepare("UPDATE plan_tasks SET status = 'todo' WHERE id = ?").run(candidate.id);
      db.prepare(
        "UPDATE plan_tasks SET day = ? WHERE id = ? AND day > ?",
      ).run(Math.max(1, task.day), candidate.id, task.day);
      unlocked.push(candidate);
    }
  }
  return unlocked;
}

// IF task.status == STUCK → insert an easier prerequisite task before the retry.
function insertPrerequisite(context, task, gap) {
  const gapName = gap?.skillName || "the topic";
  const title = `Review ${gapName}: fill missing pieces before the full task`;
  const description =
    `An easier prerequisite inserted because "${task.title}" was marked stuck. ` +
    `Work through the specific concept on a much smaller example first — for example, review missing values and practice filling them on a 20-row table before attempting the full task again.`;
  const result = db
    .prepare(
      `INSERT INTO plan_tasks
         (plan_id, gap_id, title, description, effort_minutes, day, status, resource, completion_action, stuck_action, difficulty, depends_on, revision, created_at)
       VALUES (?, ?, ?, ?, 30, ?, 'todo', ?, ?, ?, 'easier', ?, ?, ?)`,
    )
    .run(
      task.planId,
      gap?.id ?? null,
      title,
      description,
      task.day,
      "Revisit the tutorial section this task came from.",
      "You can complete the small example without help.",
      "Ask the AI coach for a worked example, then repeat it.",
      title,
      (task.revision || 0) + 1,
      now(),
    );
  return db.prepare("SELECT * FROM plan_tasks WHERE id = ?").get(result.lastInsertRowid);
}

// IF the same skill has >= 2 stuck events → struggle flag + guided practice.
function evaluateStruggleFlags(context, planId) {
  const stuckCounts = getStuckCountsByGap(planId);
  const flagged = [];
  for (const [gapId, stuckCount] of stuckCounts.entries()) {
    const gap = gapById(context, gapId);
    if (!gap) continue;
    if (stuckCount >= 2 && gap.status !== "struggle") {
      db.prepare(
        "UPDATE skill_gaps SET status = 'struggle' WHERE id = ?",
      ).run(gapId);
      flagged.push(gap);
    }
  }
  return flagged;
}

// IF all tasks for a gap are DONE → mark gap progressing.
function evaluateGapProgress(context, planId) {
  const rows = db
    .prepare(
      `SELECT gap_id,
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
       FROM plan_tasks
       WHERE plan_id = ? AND gap_id IS NOT NULL
       GROUP BY gap_id`,
    )
    .all(planId);

  const progressed = [];
  for (const row of rows) {
    if (Number(row.total) > 0 && Number(row.total) === Number(row.done)) {
      db.prepare("UPDATE skill_gaps SET status = 'progressing' WHERE id = ?").run(row.gap_id);
      progressed.push(row.gap_id);
    }
  }
  return progressed;
}

export function applyDeterministicAdaptation(context, changedTask, nextStatus) {
  const planId = context.plan?.id;
  if (!planId) return { unlocked: [], inserted: null, struggleFlags: [], progressedGaps: [] };

  const unlocked = nextStatus === "done" ? unlockDependentTasks(context, changedTask) : [];
  const inserted = nextStatus === "stuck"
    ? insertPrerequisite(context, changedTask, gapById(context, changedTask.gapId))
    : null;
  const struggleFlags = evaluateStruggleFlags(context, planId);
  const progressedGaps = evaluateGapProgress(context, planId);

  return { unlocked, inserted, struggleFlags, progressedGaps };
}
