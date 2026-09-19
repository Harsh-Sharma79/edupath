import { Router } from "express";
import { db, parseJson } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { generatePlan, revisePlan, serializeTask } from "../services/agent.js";
import { getActivePlan, getPlanTasks } from "../services/context.js";

const router = Router();

function serializePlan(plan) {
  return {
    id: plan.id,
    weekNumber: plan.week_number,
    objectives: parseJson(plan.objectives_json, []),
    source: plan.source,
    generatedAt: plan.generated_at,
    revisedAt: plan.revised_at,
  };
}

function planWithTasks(plan) {
  if (!plan) return null;
  return {
    ...serializePlan(plan),
    tasks: getPlanTasks(plan.id).map((task) => serializeTask(task)),
  };
}

// POST /api/plans/generate
router.post("/generate", requireAuth, async (req, res) => {
  const result = await generatePlan(req.user.id);
  if (result.error) return res.status(400).json({ message: result.message });
  res.status(201).json(result);
});

// POST /api/plans/revise
router.post("/revise", requireAuth, async (req, res) => {
  const result = await revisePlan(req.user.id);
  if (result.error) return res.status(400).json({ message: result.message });
  res.json(result);
});

// GET /api/plans/current — active plan with tasks
router.get("/current", requireAuth, (req, res) => {
  const plan = getActivePlan(req.user.id);
  res.json({ plan: planWithTasks(plan) });
});

// GET /api/plans — plan history
router.get("/", requireAuth, (req, res) => {
  const plans = db
    .prepare("SELECT * FROM weekly_plans WHERE user_id = ? ORDER BY id DESC")
    .all(req.user.id);
  res.json({ plans: plans.map((plan) => planWithTasks(plan)) });
});

export default router;
