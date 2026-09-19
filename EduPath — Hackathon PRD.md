# EduPath — Hackathon PRD

**Personalized Learning Path Agent**  
**24-hour agentic AI hackathon build · Team of 2 · Responsive web application**

> **Hackathon thesis:** EduPath is not a chatbot that recommends courses. It is a goal-driven learning agent that observes a learner’s profile and progress, identifies the next best action, creates a plan, and revises that plan when the learner succeeds or gets stuck.

---

## 1. Executive Summary

EduPath helps a learner move from a current skill profile to a target role through an adaptive, evidence-based learning path. The learner provides their current skills and target role. EduPath then produces a structured gap analysis, generates a short weekly plan, tracks task outcomes, and adapts the next plan when progress changes.

The product is intentionally narrow for a 24-hour build. The live demo will use one primary persona, one target role, manual profile entry, deterministic fallback data, and a small number of agent tools. Resume upload, additional roles, and export are optional only after the complete core loop works.

The winning demo should make one point unmistakable: **the system changes its recommendations because it observed what the learner did.**

## 2. Problem

Learners often know the role they want but do not know which skill to learn next. Existing learning platforms commonly present generic course catalogs or static curricula. They rarely connect four pieces of information in one loop:

1. What the learner already knows.
2. What the target role requires.
3. Which gap should be addressed next.
4. How the plan should change after real progress or difficulty.

EduPath closes this loop:

> **Profile → assess → prioritize → plan → act → observe → adapt**

## 3. Product Goal and Differentiator

### Goal

Within three minutes, a judge should be able to see a learner receive a personalized plan, change their progress, and receive a visibly different next step with an explanation.

### Differentiator

EduPath demonstrates **closed-loop adaptation**, not merely content generation. Each generated recommendation must be grounded in the learner’s profile, target role, completed tasks, and stuck signals.

### What makes the product agentic

The system has a bounded agent loop with explicit state and actions:

- **Observe:** read the learner profile and task outcomes.
- **Reason:** compare current skills with target-role requirements and prioritize gaps.
- **Act:** create or revise objectives and tasks.
- **Explain:** answer why a skill or task was prioritized.
- **Re-observe:** use completion or stuck status as new evidence.

The agent is not autonomous in a risky or open-ended sense. It operates inside a small, inspectable workflow with structured outputs, tool boundaries, and deterministic fallbacks.

## 4. Primary User and Demo Scenario

### Primary persona

**Aditi**, a final-year engineering student, wants to become a Data Analyst.

- Current skills: Python basics, basic SQL, introductory machine learning coursework.
- Target role: Data Analyst.
- Confidence: comfortable with Python syntax; uncertain about joins, data cleaning, and communicating insights.
- Available time: five hours per week.

### Demo narrative

Aditi does not need another generic list of courses. She needs to know what to do next, why it matters, and how the plan changes when she gets stuck.

The demo must show:

1. Her current profile and target role.
2. A prioritized gap analysis.
3. A Week 1 plan containing measurable tasks.
4. A task marked complete and another marked stuck.
5. A revised plan that responds to those outcomes.
6. A grounded explanation in chat.
7. A concise progress report.

Use the same persona for rehearsal and screenshots. Do not depend on a judge entering data live.

## 5. Success Criteria

### Product success

The build is successful when a new or seeded learner can complete this flow without developer intervention:

1. Enter a profile and target role.
2. Generate a gap analysis.
3. Generate a weekly plan.
4. Mark tasks as **done** or **stuck**.
5. Generate a changed next plan.
6. Ask a question about the plan and receive a grounded answer.
7. View a progress summary.

### Hackathon success

The judges should be able to identify all of the following within one uninterrupted demo:

- A clear user problem.
- A real agentic loop rather than a static prompt-response screen.
- Personalization based on structured learner state.
- Adaptation after feedback.
- A reliable fallback path.
- A polished, understandable user experience.

### Reliability target

The core demo must work in **offline or fallback mode** with no external AI call. Live model calls improve the result but must not be a prerequisite for demonstrating the product.

## 6. Scope and Cut Line

### Must ship

- Seeded demo login or minimal email/password authentication.
- Manual learner profile form.
- Target role selection or a fixed Data Analyst target.
- Structured gap analysis.
- Week 1 plan with objectives, resources, and practice tasks.
- Task status actions: **to do**, **done**, and **stuck**.
- Plan adaptation after status changes.
- Plan-aware chat question and answer.
- Progress report.
- Fallback mode for every AI-dependent action.
- One rehearsed end-to-end demo path.

### Should ship

- Resume upload and text extraction.
- Skill extraction from resume text.
- A second target-role preset.
- Struggle-area flag after two stuck events.
- Lightweight visual comparison of current versus target skills.

### Could ship

- PDF export.
- Streak or momentum indicator.
- More detailed resource metadata.
- Editable AI-generated skills and tasks.

### Will not ship in this hackathon build

- Live web search or scraping.
- A full course or resource marketplace.
- Mentor and administrator accounts.
- Social features, notifications, or email workflows.
- Mobile-native applications.
- ML-trained gap scoring.
- Fine-grained permissions, password reset, OAuth, or email verification.
- Automated enrollment, payments, certificates, or job applications.

### Hard cut rule

If the team is behind at Hour 12, remove features in this order:

1. PDF export and visualizations.
2. Resume upload and parsing.
3. Multiple roles.
4. Full authentication in favor of a seeded demo account.

Do **not** remove task status, plan adaptation, fallback mode, or the demo script. Those are the product.

## 7. Core User Journey

### Screen 1: Welcome and profile

The learner enters current skills, confidence levels, available weekly time, and target role. The form should take less than one minute to complete.

### Screen 2: Gap analysis

The system displays three to five prioritized gaps. Each gap includes:

- Skill name.
- Current level.
- Target level.
- Priority.
- Short reason for the priority.
- Suggested evidence of mastery.

The screen must make it clear that the priorities were derived from the learner’s profile and target role.

### Screen 3: Weekly plan

The system displays a seven-day plan with:

- One or two weekly outcomes.
- Three to five concrete tasks.
- Estimated effort per task.
- A resource or learning prompt.
- A completion check.
- A **stuck** action.

Tasks must be small enough to complete or evaluate during a short learning session. Avoid vague tasks such as “learn SQL.” Prefer “write three queries using INNER JOIN and explain the result.”

### Screen 4: Adaptation state

After the learner marks one task done and one task stuck, the application displays:

- What changed.
- Why it changed.
- The revised next task or objective.
- The skill gap affected by the change.

This is the most important screen for judging. The adaptation should be visible without requiring a page refresh or a long chat exchange.

### Screen 5: Plan-aware chat

The learner asks a question such as, “Why is SQL prioritized before Pandas?” The answer must cite the learner’s target role, current profile, and active plan. If the model is unavailable, the fallback returns a concise explanation using the same stored state.

### Screen 6: Progress report

The report summarizes:

- Skills with completed evidence.
- Skills currently in progress.
- Remaining gaps.
- Current momentum.
- The recommended next action.

The report is computed from application state where possible. It must not depend on a second AI call.

## 8. Agent Design

### Agent state

The agent reads one canonical learner context object:

```json
{
  "profile": {
    "skills": [{"name": "SQL", "level": 2, "evidence": "basic queries"}],
    "targetRole": "Data Analyst",
    "weeklyHours": 5
  },
  "gaps": [],
  "activePlan": {},
  "progress": [],
  "conversation": []
}
```

### Bounded tools

The agent may use only these application tools:

- `get_learner_context()`
- `analyze_skill_gaps(profile, target_role)`
- `create_weekly_plan(gaps, constraints)`
- `revise_plan(plan, progress_events, gaps)`
- `summarize_progress(context)`

The backend, not the model, owns persistence and authorization. The model returns structured JSON that is validated before being stored or rendered.

### Adaptation rules

The first version may combine model output with deterministic rules:

- If a task is **done**, unlock the next dependent task.
- If a task is **stuck**, reduce task difficulty, add an explanation, or insert a prerequisite task.
- If the same skill has two stuck events, raise a struggle flag and recommend guided practice.
- If all tasks for a gap are done, mark the gap as progressing and select the next highest-priority gap.

These rules make the agent behavior reliable and easy to explain during judging.

## 9. AI Output Contracts and Fallbacks

Every model call must return schema-valid JSON. Do not render unvalidated free-form model text as core product state.

| Trigger | Required output | Fallback |
|---|---|---|
| Gap analysis | Three to five gaps with levels, priority, reason, and evidence | Pre-written Data Analyst gap set, with learner skill names inserted |
| Plan generation | Outcomes, tasks, effort, resource prompts, and gap IDs | Static Data Analyst Week 1 template with priority gaps substituted |
| Plan revision | Changed tasks, reason for change, and affected gap | Deterministic done/stuck rules |
| Chat | Answer plus cited context fields | Template answer generated from profile and plan data |
| Progress report | Not required | Compute directly from stored task states |

### Fallback behavior

The UI must show a small, non-alarming status such as “Using prepared guidance” when fallback mode is active. The application must not expose API keys, stack traces, or a blank loading state.

The team should add a developer-only toggle for `LIVE_AI` and `FALLBACK` so the demo can switch modes without code changes.

## 10. Functional Requirements and Acceptance Criteria

### Profile

- The learner can save a profile with at least three skills, a target role, and weekly availability.
- The form validates required fields and supports editing.
- A seeded Aditi profile can be loaded in one click for the demo.

### Gap analysis

- A gap analysis is generated or loaded from fallback data within five seconds.
- Every displayed gap has a priority and explanation.
- The output is tied to the selected target role.

### Weekly plan

- The plan contains at least three actionable tasks.
- Each task has an estimated effort and a gap association.
- Each task can be marked done or stuck.

### Adaptation

- A progress event is persisted.
- Regeneration produces a plan that differs from the original in at least one visible field.
- The UI explains the reason for the change.

### Chat

- The answer includes at least one fact from the learner context.
- The chat does not invent completed tasks or skills.
- Fallback chat remains useful when the model is unavailable.

### Demo reliability

- Refreshing the page does not destroy the seeded demo state.
- The demo can be completed twice without manual database cleanup.
- The team has a screen recording or screenshots of the fallback path.

## 11. Minimal Data Model

| Entity | Required fields |
|---|---|
| `User` | `id`, `email`, `password_hash`, `created_at` |
| `SkillProfile` | `id`, `user_id`, `skills_json`, `target_role`, `weekly_hours`, `created_at` |
| `SkillGap` | `id`, `profile_id`, `skill_name`, `current_level`, `target_level`, `priority`, `reason` |
| `WeeklyPlan` | `id`, `user_id`, `week_number`, `objectives_json`, `tasks_json`, `generated_at`, `source` |
| `TaskEvent` | `id`, `plan_id`, `task_id`, `status`, `note`, `created_at` |
| `ChatMessage` | `id`, `user_id`, `role`, `content`, `created_at` |

Do not create a separate report table. Derive the report from gaps, plans, and task events. Store the `source` field as `live_ai` or `fallback` to make demos and debugging transparent.

## 12. Recommended Architecture

| Layer | Choice | Constraint |
|---|---|---|
| Frontend | React with Vite | Build six clear states before adding visual polish |
| Backend | Node.js with Express | Keep routes thin and business rules testable |
| Database | SQLite with `better-sqlite3` | Zero-config local persistence |
| Authentication | Seeded session or JWT with bcrypt | Use the simplest reliable approach |
| AI | Anthropic Claude API behind an adapter | The UI must not call the model directly |
| Parsing | Optional PDF/DOCX text extraction | Only after manual flow is complete |
| Deployment | Localhost first | Deploy only after two successful rehearsals |

### Suggested backend modules

```text
server/
  routes/auth.js
  routes/profile.js
  routes/plan.js
  routes/chat.js
  services/agent.js
  services/fallbacks.js
  services/context.js
  db/schema.js
  db/seed.js
```

The agent adapter should expose the same functions for live and fallback implementations. This prevents the frontend from knowing which mode is active.

## 13. API Surface

```text
POST /api/auth/login
POST /api/auth/signup                 # optional if seeded login is used
GET  /api/demo/seed                   # load Aditi demo state
GET  /api/profile
POST /api/profile
POST /api/gaps/analyze
POST /api/plans/generate
POST /api/tasks/:taskId/status
POST /api/plans/revise
GET  /api/report
POST /api/chat
GET  /api/health
```

The vertical slice should work with the following sequence before any optional feature is attempted:

```text
GET demo seed
→ POST profile
→ POST gaps/analyze
→ POST plans/generate
→ POST tasks/:taskId/status
→ POST plans/revise
→ POST chat
→ GET report
```

## 14. 24-Hour Execution Plan

| Time | Deliverable | Owner A: product and frontend | Owner B: backend and agent |
|---|---|---|---|
| Hour 0–1 | Scope lock | Confirm screens, demo story, and cut line | Confirm schema, API contracts, and fallback data |
| Hour 1–3 | Skeleton | Scaffold app, routes, layout, seeded login | Scaffold server, SQLite, seed script, health route |
| Hour 3–6 | Vertical slice | Profile form and static plan screen | Profile endpoint, fallback gaps, fallback plan |
| Hour 6 checkpoint | **Must pass** | Submit profile and render plan | Persist profile and return plan |
| Hour 6–9 | Core loop | Task status UI and progress state | Task events and deterministic revision rules |
| Hour 9–12 | Integration | Connect every core screen to API | Add live AI adapter and JSON validation |
| Hour 12 checkpoint | **Must pass** | Complete demo once from clean state | Demonstrate live and fallback modes |
| Hour 12–15 | Agent experience | Adaptation explanation and chat UI | Plan revision prompt, grounded chat, failure handling |
| Hour 15–17 | Report | Progress report and visible gap states | Report endpoint and derived metrics |
| Hour 17–19 | Optional work | Resume upload or second role only if stable | Resume parsing or second role only if stable |
| Hour 19–21 | Polish | Loading states, error states, responsive layout | Logging, seed reset, API timeout, validation |
| Hour 21–22 | Reliability | Run the complete flow twice | Test fallback with AI disabled |
| Hour 22–23 | Rehearsal | Present the three-minute demo | Monitor timing and prepare recovery steps |
| Hour 23–24 | Buffer | Fix only demo-blocking issues | Freeze code, verify environment, record backup demo |

### Checkpoint policy

At Hours 6 and 12, the team must run the complete flow. If it fails, stop adding features and fix the vertical slice. The final two hours are reserved for reliability and rehearsal, not new functionality.

## 15. Three-Minute Demo Script

1. **0:00–0:20 — Problem:** “Aditi knows Python but does not know which skills matter next for a Data Analyst role.”
2. **0:20–0:45 — Context:** Show her profile, target role, available time, and current skills.
3. **0:45–1:10 — Reasoning:** Generate and explain the prioritized gaps.
4. **1:10–1:35 — Action:** Show the weekly plan with concrete tasks and effort estimates.
5. **1:35–2:05 — Feedback:** Mark SQL joins as done and data cleaning as stuck.
6. **2:05–2:30 — Adaptation:** Revise the plan and point out the easier prerequisite task inserted because of the stuck signal.
7. **2:30–2:50 — Explanation:** Ask why SQL was prioritized before Pandas and show the grounded answer.
8. **2:50–3:00 — Close:** “EduPath does not give every learner the same curriculum. It observes progress and chooses the next useful action.”

Do not spend demo time on signup, API infrastructure, model names, or optional resume parsing unless a judge asks.

## 16. Judge-Facing Evidence

The presentation should explicitly map the product to common hackathon evaluation dimensions:

| Dimension | Evidence in EduPath |
|---|---|
| Problem clarity | Learners lack a reliable next step toward a target role |
| Technical depth | Structured agent loop, tool boundaries, persistence, and validation |
| Agentic behavior | The plan changes after done/stuck observations |
| User value | The learner gets an actionable task rather than a generic resource list |
| Reliability | The same flow works with live AI or deterministic fallback |
| Product quality | Clear states, concise explanations, and a rehearsed end-to-end path |

## 17. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI call is slow or unavailable | Timeout quickly and switch to the stored fallback response |
| Model returns malformed JSON | Validate against a schema and use fallback on failure |
| The adaptation looks cosmetic | Require a visible task or objective change and show the reason |
| Resume parsing consumes the schedule | Keep manual entry as the primary path and cut parsing first |
| Auth delays the build | Use a seeded demo account and minimal session handling |
| Wi-Fi fails during judging | Test fallback-only mode and keep a local seeded database |
| Demo state becomes inconsistent | Add a one-click reset/seed action and rehearse from a clean state |
| Scope expands | Enforce the Must/Should/Could cut line and checkpoint policy |

## 18. Definition of Done

The project is ready to submit when:

- The seeded Aditi flow completes in under three minutes.
- The same flow works with AI disabled.
- At least one done event and one stuck event visibly change the next plan.
- The chat answer is grounded in stored learner context.
- The report is derived from actual task events.
- The application handles loading, timeout, and error states.
- The team has rehearsed the demo at least twice.
- No unfinished feature is more prominent than the working core loop.

## 19. Future Direction

After the hackathon, EduPath could support richer evidence of mastery, validated external resources, multiple roles, mentor review, longitudinal learner models, and privacy-preserving resume processing. These ideas are intentionally outside the 24-hour build because they do not improve the first judging moment as much as a reliable adaptive loop.

## References

This document is an execution-focused rewrite of the supplied EduPath PRD. No external research was required for this product-planning revision.

[1]: https://docs.anthropic.com/en/docs "Anthropic API documentation"
