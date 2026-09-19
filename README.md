# edupath

**EduPath** is an agentic AI learning platform that helps users reach a target career role by analyzing their current skills, identifying gaps, and generating a personalized learning plan. It tracks task progress, detects when users struggle, and automatically adapts the next steps while providing explanations through an AI assistant.

## The closed loop

PROFILE → ASSESS → PRIORITIZE → PLAN → ACT → OBSERVE → ADAPT → EXPLAIN

EduPath is not a chatbot that recommends courses: it observes what the learner actually did (done / stuck), applies deterministic adaptation rules, revises the weekly plan, and explains the change.

## Quick start (two terminals)

**1. Backend** (Express + SQLite, port 5000):

```bash
cd server
npm install
npm start
```

On first boot a fresh database is created and the **Aditi demo** is seeded automatically.

**2. Frontend** (React + Vite, port 5173):

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 and either:

- Click **Load Aditi Demo** — one click loads the complete seeded state, or
- Sign in manually with `aditi@edupath.demo` / `edupath-demo`.

## The three-minute demo script

1. Load the demo → Dashboard shows Aditi's profile and target role.
2. **Skill Gaps** → 5 prioritized gaps derived from her profile + Data Analyst role.
3. **Weekly Plan** → 5 concrete tasks (no "learn SQL"; instead "write three queries using INNER JOIN and explain the result").
4. Mark the SQL-queries task **✓ Done** and the data-cleaning task **⚠ Stuck**.
5. Click **Adapt Plan** → the plan visibly changes: an easier prerequisite "Review Data Cleaning…" task is inserted, with WHAT CHANGED / WHY / AFFECTED SKILL / NEW NEXT STEP.
6. **AI Coach** → ask "Why is SQL prioritized before Pandas?" — the answer cites her stored profile and plan.
7. **Progress** → report computed from real task events (completion %, momentum, evidence, struggle flags).

Click **Load Aditi Demo** again to reset to a pristine state — the demo can run twice in a row without manual cleanup.

## AI modes

| Mode | Trigger | Behavior |
|---|---|---|
| `LIVE_AI` | `LIVE_AI=true` **and** `ANTHROPIC_API_KEY` set | Claude generates gaps, plans, revisions and chat answers; every response is validated against Zod schemas before it is stored or rendered |
| `FALLBACK` | default / missing key / timeout / invalid JSON | Deterministic engine produces the same structured outputs from stored state |

The UI shows the active mode in the sidebar ("AI Mode: Live AI / Fallback"). Failure never breaks the product: any live-AI error (timeout, HTTP error, malformed JSON, schema violation) silently degrades to prepared guidance.

Enable live AI:

```bash
# server/.env or environment
LIVE_AI=true
ANTHROPIC_API_KEY=sk-ant-...
```

## Architecture

```
server/
  index.js            entrypoint: schema, first-boot seeding, listen
  app.js              express app, CORS, JSON, health, error handling
  config.js           LIVE_AI / FALLBACK, ports, timeouts
  middleware/auth.js  HMAC-signed bearer tokens, requireAuth
  routes/             auth, demo, profile, gaps, plan, tasks, chat, report
  services/
    agent.js          orchestrator: analyzeSkillGaps, generatePlan, revisePlan, answerChat, computeProgress
    liveAI.js         Claude adapter with timeout + JSON extraction + schema validation
    fallbacks.js      deterministic gap/plan/revision/chat engine
    adaptation.js     deterministic rules: unlock, prerequisite, struggle flags, gap progression
    context.js        canonical learner context builder
    contracts.js      Zod output contracts for every AI response
  db/                 schema.js, database.js, seed.js (Aditi + Week 1 plan)

client/
  src/context/LearnerContext.jsx  app state: session, profile, gaps, plan, report, AI mode, toasts
  src/services/api.js             typed API client with bearer token handling
  src/pages/                      Login, Welcome, ProfilePage, Dashboard, SkillGaps,
                                  LearningPlan, Adaptation, Chat, Progress
  src/components/                 layout (sidebar/topbar), gaps, plans, chat, profile, progress
```

## Data model (SQLite)

`users` · `skill_profiles` · `skill_gaps` · `weekly_plans` · `plan_tasks` · `task_events` · `chat_messages` · `adaptations`

Every task status change is persisted as a `task_events` row — progress is derived from the database, never faked in React state. The report endpoint (`GET /api/report`) computes momentum, completion rate, evidence and struggle flags directly from stored events with no AI call.

## API surface

```
GET  /api/health              POST /api/auth/login        POST /api/auth/signup
GET  /api/demo/seed           GET  /api/profile           POST /api/profile
POST /api/gaps/analyze        GET  /api/gaps              POST /api/plans/generate
POST /api/plans/revise        GET  /api/plans/current     POST /api/tasks/:taskId/status
GET  /api/report              POST /api/chat              GET  /api/chat
```

All `/api/*` routes except `health`, `demo/seed` and `auth` require a bearer token.
