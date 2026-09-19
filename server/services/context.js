// Builds the canonical learner context object the PRD describes. Every agent
// function reads from this single snapshot, which keeps the loop honest: the
// same state drives gap analysis, planning, revision, chat and the report.
import { db, now, parseJson } from "../db/database.js";

export function getActiveProfile(userId) {
  return (
    db
      .prepare("SELECT * FROM skill_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1")
      .get(userId) || null
  );
}

export function getGaps(profileId) {
  if (!profileId) return [];
  return db
    .prepare("SELECT * FROM skill_gaps WHERE profile_id = ? ORDER BY priority ASC")
    .all(profileId);
}

export function getActivePlan(userId) {
  return (
    db
      .prepare("SELECT * FROM weekly_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1")
      .get(userId) || null
  );
}

export function getPlanTasks(planId) {
  if (!planId) return [];
  return db
    .prepare("SELECT * FROM plan_tasks WHERE plan_id = ? ORDER BY day ASC, id ASC")
    .all(planId);
}

export function getLatestAdaptation(userId) {
  return (
    db
      .prepare("SELECT * FROM adaptations WHERE user_id = ? ORDER BY id DESC LIMIT 1")
      .get(userId) || null
  );
}

export function getStuckCountsByGap(planId) {
  const rows = db
    .prepare(
      `SELECT t.gap_id AS gapId, COUNT(*) AS stuckCount
       FROM task_events e
       JOIN plan_tasks t ON t.id = e.task_id
       WHERE e.plan_id = ? AND e.status = 'stuck' AND t.gap_id IS NOT NULL
       GROUP BY t.gap_id`,
    )
    .all(planId);
  const map = new Map();
  for (const row of rows) map.set(Number(row.gapId), Number(row.stuckCount));
  return map;
}

export function getRecentChat(userId, limit) {
  const rows = db
    .prepare("SELECT * FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(userId, limit);
  return rows.reverse();
}

export function buildLearnerContext(userId) {
  const profile = getActiveProfile(userId);
  const gaps = profile ? getGaps(profile.id) : [];
  const plan = getActivePlan(userId);
  const tasks = plan ? getPlanTasks(plan.id) : [];

  return {
    fetchedAt: now(),
    user: db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(userId),
    profile,
    skills: profile ? parseJson(profile.skills_json, []) : [],
    targetRole: profile?.target_role || "",
    weeklyHours: profile?.weekly_hours ?? null,
    gaps: gaps.map((gap) => ({
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
    })),
    plan: plan
      ? {
          id: plan.id,
          weekNumber: plan.week_number,
          objectives: parseJson(plan.objectives_json, []),
          source: plan.source,
          generatedAt: plan.generated_at,
          revisedAt: plan.revised_at,
          revisionCount: db.prepare(
            "SELECT COUNT(DISTINCT revision) AS n FROM plan_tasks WHERE plan_id = ?",
          ).get(plan.id)?.n ?? 1,
        }
      : null,
    tasks: tasks.map((task) => ({
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
    })),
    adaptation: getLatestAdaptation(userId) || null,
  };
}
