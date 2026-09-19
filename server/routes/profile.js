import { Router } from "express";
import { db, now } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { getActiveProfile } from "../services/context.js";

const router = Router();

const SKILL_LEVELS = new Set([1, 2, 3, 4, 5]);
const CONFIDENCES = new Set(["comfortable", "uncertain", "learning"]);

function validateProfilePayload(body) {
  const errors = [];
  const name = String(body?.name || "").trim();
  const targetRole = String(body?.targetRole || "").trim();
  const weeklyHours = Number(body?.weeklyHours);
  const rawSkills = Array.isArray(body?.skills) ? body.skills : [];

  if (!name) errors.push("Learner name is required.");
  if (!targetRole) errors.push("Target role is required.");
  if (!Number.isFinite(weeklyHours) || weeklyHours < 1 || weeklyHours > 40) {
    errors.push("Weekly hours must be between 1 and 40.");
  }
  if (rawSkills.length < 3) errors.push("List at least 3 skills.");

  const skills = rawSkills.map((skill) => {
    const skillName = String(skill?.name || "").trim();
    const level = Number(skill?.level);
    const confidence = String(skill?.confidence || "learning").toLowerCase();
    return {
      name: skillName,
      level: SKILL_LEVELS.has(level) ? level : 1,
      evidence: String(skill?.evidence || "").trim(),
      confidence: CONFIDENCES.has(confidence) ? confidence : "learning",
    };
  });

  const named = skills.filter((skill) => skill.name);
  if (named.length !== skills.length) errors.push("Every skill needs a name.");
  if (new Set(named.map((skill) => skill.name.toLowerCase())).size !== named.length) {
    errors.push("Skill names must be unique.");
  }

  return {
    errors,
    value: { name, targetRole, weeklyHours: Math.round(weeklyHours || 0), skills: named },
  };
}

router.get("/", requireAuth, (req, res) => {
  const profile = getActiveProfile(req.user.id);
  if (!profile) return res.json({ profile: null });

  res.json({
    profile: {
      id: profile.id,
      name: profile.name,
      targetRole: profile.target_role,
      weeklyHours: profile.weekly_hours,
      skills: JSON.parse(profile.skills_json || "[]"),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
});

router.post("/", requireAuth, (req, res) => {
  const { errors, value } = validateProfilePayload(req.body);
  if (errors.length) return res.status(422).json({ message: errors.join(" "), errors });

  const existing = getActiveProfile(req.user.id);
  let profileId;
  if (existing) {
    db.prepare(
      `UPDATE skill_profiles
       SET name = ?, target_role = ?, weekly_hours = ?, skills_json = ?, updated_at = ?
       WHERE id = ?`,
    ).run(value.name, value.targetRole, value.weeklyHours, JSON.stringify(value.skills), now(), existing.id);
    profileId = existing.id;
  } else {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO skill_profiles (user_id, name, target_role, weekly_hours, skills_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(req.user.id, value.name, value.targetRole, value.weeklyHours, JSON.stringify(value.skills), now(), now());
    profileId = Number(lastInsertRowid);
  }

  const profile = db.prepare("SELECT * FROM skill_profiles WHERE id = ?").get(profileId);
  res.status(existing ? 200 : 201).json({
    message: "Profile saved.",
    profile: {
      id: profile.id,
      name: profile.name,
      targetRole: profile.target_role,
      weeklyHours: profile.weekly_hours,
      skills: JSON.parse(profile.skills_json || "[]"),
      updatedAt: profile.updated_at,
    },
  });
});

export default router;
