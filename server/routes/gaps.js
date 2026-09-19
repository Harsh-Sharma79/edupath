import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { analyzeSkillGaps } from "../services/agent.js";
import { getActiveProfile, getGaps } from "../services/context.js";

const router = Router();

router.post("/analyze", requireAuth, async (req, res) => {
  const result = await analyzeSkillGaps(req.user.id);
  if (result.error) return res.status(400).json({ message: result.message });

  const profile = getActiveProfile(req.user.id);
  res.json({
    source: result.source,
    derivedFrom: {
      targetRole: profile?.target_role || "",
      learnerName: profile?.name || "",
      profileBased: true,
      description:
        "Gaps are derived from the learner profile (current skills, levels, confidence) compared against the target role requirements.",
    },
    gaps: result.gaps,
  });
});

router.get("/", requireAuth, (req, res) => {
  const profile = getActiveProfile(req.user.id);
  const gaps = profile ? getGaps(profile.id) : [];
  res.json({
    source: gaps[0]?.source || "fallback",
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
  });
});

export default router;
