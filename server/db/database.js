import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { SCHEMA_SQL } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(path.dirname(config.databasePath))) {
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
}

export const db = new Database(config.databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Apply the schema at module load so every service can safely compile
// prepared statements at import time.
db.exec(SCHEMA_SQL);

export function initializeSchema() {
  db.exec(SCHEMA_SQL);
}

export function resetDatabase() {
  db.pragma("foreign_keys = OFF");
  const tables = [
    "adaptations",
    "chat_messages",
    "task_events",
    "plan_tasks",
    "weekly_plans",
    "skill_gaps",
    "skill_profiles",
    "users",
  ];
  for (const table of tables) {
    db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
}

export const now = () => new Date().toISOString();

export function parseJson(text, fallback) {
  try {
    const parsed = JSON.parse(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
