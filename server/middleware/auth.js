import crypto from "node:crypto";
import { config } from "../config.js";
import { db } from "../db/database.js";

// Minimal HMAC-signed token. Same payload shape a JWT would carry; no extra
// dependency and no decode-on-the-client surface area.
const SECRET = process.env.AUTH_SECRET || "edupath-demo-secret-change-me";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  const body = base64url(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(token) {
  if (typeof token !== "string") return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function issueToken(userId, email) {
  return sign({
    sub: userId,
    email,
    exp: Math.floor(Date.now() / 1000) + config.auth.tokenTtlSeconds,
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? verify(token) : null;
  if (!payload) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(payload.sub);
  if (!user) return res.status(401).json({ message: "Session expired. Sign in again." });
  req.user = user;
  next();
}

