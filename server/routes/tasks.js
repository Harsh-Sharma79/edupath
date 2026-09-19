import { Router } from "express";
import { db, now } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { buildLearnerContext, getActivePlan } from "../services/context.js";
import { applyDeterministicAdaptation } from "../services/adaptation.js";
import { serializeTask } from "../services/agent.js";

const router = Router();

const VALID_STATUSES = new Set(["todo", "done", "stuck"]);

// POST /api/tasks/:taskId/status { status, note }
router.post("/:taskId/status", requireAuth, (req, res) => {
  const status = String(req.body?.status || "").toLowerCase();
  const note = String(req.body?.note || "").slice(0, 500);

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ message: "Status must be one of: todo, done, stuck." });
  }

  const plan = getActivePlan(req.user.id);
  if (!plan) return res.status(400).json({ message: "No active plan. Generate a plan first." });

  const task = db
    .prepare("SELECT * FROM plan_tasks WHERE id = ? AND plan_id = ?")
    .get(req.params.taskId, plan.id);
  if (!task) return res.status(404).json({ message: "Task not found in the active plan." });

  // 1. Persist the task status.
  db.prepare("UPDATE plan_tasks SET status = ? WHERE id = ?").run(status, task.id);

  // 2. Persist the event (SQLite is the source of truth for progress).
  db.prepare(
    "INSERT INTO task_events (plan_id, task_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(plan.id, task.id, status, note, now());

  // 3. Apply deterministic adaptation rules immediately.
  const context = buildLearnerContext(req.user.id);
  const adaptation = applyDeterministicAdaptation(context, { ...serializeTask(task), status }, status);

  res.json({
    message:
      status === "done"
        ? "Task completed. Dependent tasks unlocked."
        : status === "stuck"
          ? "Stuck signal recorded. EduPath will revise the plan."
          : "Task reset to to-do.",
    task: serializeTask(db.prepare("SELECT * FROM plan_tasks WHERE id = ?").get(task.id)),
    unlockedTasks: adaptation.unlocked.map((row) => serializeTask(row)),
    insertedTask: adaptation.inserted ? serializeTask(adaptation.inserted) : null,
    struggleFlags: adaptation.struggleFlags.map((gap) => ({ id: gap.id, skillName: gap.skill_name })),
    progressedGaps: adaptation.progressedGaps,
  });
});

export default router;
