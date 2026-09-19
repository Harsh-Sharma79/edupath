import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, now } from "../db/database.js";
import { issueToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  res.json({
    token: issueToken(user.id, user.email),
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.post("/signup", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const name = String(req.body?.name || "").trim();

  if (!email.includes("@") || password.length < 6) {
    return res.status(400).json({
      message: "A valid email and a password of at least 6 characters are required.",
    });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const { lastInsertRowid } = db
    .prepare("INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)")
    .run(email, bcrypt.hashSync(password, 10), name, now());

  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(lastInsertRowid);
  res.status(201).json({ token: issueToken(user.id, user.email), user });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
