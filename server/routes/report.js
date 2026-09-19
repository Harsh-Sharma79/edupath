import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { computeProgress } from "../services/agent.js";

const router = Router();

// GET /api/report — computed from task events, gaps and profile state.
// No AI call: the PRD explicitly forbids a second model call here.
router.get("/", requireAuth, (req, res) => {
  res.json(computeProgress(req.user.id));
});

export default router;
