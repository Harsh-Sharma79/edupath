// SQLite schema. Executed idempotently on every boot so `npm start` always
// yields a usable database without a separate migration step.
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  target_role TEXT NOT NULL DEFAULT '',
  weekly_hours INTEGER NOT NULL DEFAULT 5 CHECK (weekly_hours BETWEEN 1 AND 40),
  skills_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES skill_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  target_level INTEGER NOT NULL DEFAULT 4,
  priority INTEGER NOT NULL DEFAULT 1,
  severity TEXT NOT NULL DEFAULT 'high',
  reason TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified','in_progress','progressing','mastered')),
  source TEXT NOT NULL DEFAULT 'fallback',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL DEFAULT 1,
  objectives_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'fallback',
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  revised_at TEXT
);

CREATE TABLE IF NOT EXISTS plan_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  gap_id INTEGER REFERENCES skill_gaps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  effort_minutes INTEGER NOT NULL DEFAULT 45,
  day INTEGER NOT NULL DEFAULT 1 CHECK (day BETWEEN 1 AND 7),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done','stuck')),
  resource TEXT NOT NULL DEFAULT '',
  completion_action TEXT NOT NULL DEFAULT '',
  stuck_action TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'standard' CHECK (difficulty IN ('easier','standard','harder')),
  depends_on TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS task_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES plan_tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('todo','done','stuck')),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  context_used_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'fallback',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS adaptations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES weekly_plans(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  affected_gap TEXT NOT NULL DEFAULT '',
  changes_json TEXT NOT NULL DEFAULT '[]',
  trigger_task_id INTEGER,
  source TEXT NOT NULL DEFAULT 'fallback',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON skill_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gaps_profile ON skill_gaps(profile_id);
CREATE INDEX IF NOT EXISTS idx_plans_user ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plan ON plan_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_events_plan ON task_events(plan_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptations_user ON adaptations(user_id);
`;
