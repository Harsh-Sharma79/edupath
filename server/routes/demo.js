import { Router } from "express";
import { db } from "../db/database.js";
import { seedDatabase, DEMO_EMAIL, DEMO_PASSWORD } from "../db/seed.js";
import { issueToken } from "../middleware/auth.js";

const router = Router();

// GET /api/demo/seed — loads (or resets) the complete Aditi demo state and
// returns a fresh token so the client can continue immediately.
router.get("/seed", (req, res) => {
  const result = db.transaction(() => {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);
    if (existing) {
      // Remove Aditi's data; CASCADE clears profile, plans, tasks, events,
      // chat and adaptations. Other accounts stay untouched.
      db.prepare("DELETE FROM users WHERE id = ?").run(existing.id);
    }
    return seedDatabase();
  })();

  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(result.userId);
  res.json({
    message: "Aditi demo loaded.",
    token: issueToken(user.id, user.email),
    user,
    credentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
});

export default router;
