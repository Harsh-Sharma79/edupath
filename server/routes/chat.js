import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { answerChat } from "../services/agent.js";
import { getRecentChat } from "../services/context.js";
import { config } from "../config.js";
import { parseJson } from "../db/database.js";

const router = Router();

// POST /api/chat { message }
router.post("/", requireAuth, async (req, res) => {
  const result = await answerChat(req.user.id, req.body?.message);
  if (result.error) return res.status(400).json({ message: result.message });
  res.json(result);
});

// GET /api/chat — full history for the signed-in learner
router.get("/", requireAuth, (req, res) => {
  const rows = getRecentChat(req.user.id, config.chat.maxHistoryMessages * 4);
  res.json({
    messages: rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      contextUsed: parseJson(row.context_used_json, []),
      source: row.source,
      createdAt: row.created_at,
    })),
  });
});

export default router;
