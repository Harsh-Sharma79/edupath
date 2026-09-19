// Seeds the demo database: the Aditi account, her Data Analyst profile, and
// a first-run gap analysis + Week 1 plan so the demo can start immediately.
// Run directly (node db/seed.js --reset) for a clean slate, or rely on the
// /api/demo/seed endpoint during the demo.
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { db, initializeSchema, resetDatabase, now } from "./database.js";

export const DEMO_EMAIL = "aditi@edupath.demo";
export const DEMO_PASSWORD = "edupath-demo";

export const aditiProfile = {
  name: "Aditi",
  targetRole: "Data Analyst",
  weeklyHours: 5,
  skills: [
    {
      name: "Python Basics",
      level: 3,
      evidence: "Comfortable with Python syntax and small scripts from coursework",
      confidence: "comfortable",
    },
    {
      name: "SQL Basics",
      level: 2,
      evidence: "Can write simple SELECT queries but uncertain about joins",
      confidence: "uncertain",
    },
    {
      name: "Machine Learning Intro",
      level: 2,
      evidence: "Completed an introductory machine learning course",
      confidence: "uncertain",
    },
    {
      name: "Data Cleaning",
      level: 1,
      evidence: "Has heard of the workflow but has not practiced it",
      confidence: "uncertain",
    },
    {
      name: "Insight Communication",
      level: 1,
      evidence: "No experience presenting findings to a non-technical audience",
      confidence: "uncertain",
    },
  ],
};

const aditiGapSet = [
  {
    skillName: "SQL Joins",
    currentLevel: 1,
    targetLevel: 4,
    priority: 1,
    severity: "critical",
    reason:
      "Aditi is uncertain about SQL joins, and joins are the daily workhorse of Data Analyst interviews and dashboards.",
    evidence:
      "Write five JOIN queries (INNER, LEFT, aggregations) on a two-table dataset and explain each result set in plain language.",
  },
  {
    skillName: "Data Cleaning",
    currentLevel: 1,
    targetLevel: 3,
    priority: 2,
    severity: "critical",
    reason:
      "Real analyst work starts with messy data. Aditi has no cleaning practice yet, so every later analysis depends on this gap.",
    evidence:
      "Clean a deliberately messy 500-row dataset: fix missing values, deduplicate rows, and document every transformation.",
  },
  {
    skillName: "Pandas",
    currentLevel: 2,
    targetLevel: 4,
    priority: 3,
    severity: "high",
    reason:
      "Pandas builds directly on Aditi's Python comfort and unlocks the cleaning and reporting workflows of a Data Analyst.",
    evidence:
      "Load a CSV, produce a grouped summary with pandas, and export a cleaned output file from memory.",
  },
  {
    skillName: "Data Visualization",
    currentLevel: 2,
    targetLevel: 3,
    priority: 4,
    severity: "medium",
    reason:
      "Analysts are judged on how clearly charts carry a message; Aditi's ML coursework touched plotting but not chart selection.",
    evidence:
      "Pick the right chart type for three different questions and build each one from the same dataset.",
  },
  {
    skillName: "Insight Communication",
    currentLevel: 1,
    targetLevel: 3,
    priority: 5,
    severity: "medium",
    reason:
      "Aditi is uncertain about communicating insights; presenting findings is the final, differentiating skill for analyst roles.",
    evidence:
      "Write a one-page summary of an analysis with three insights and one recommendation for a non-technical reader.",
  },
];

const aditiObjectives = [
  "Build working fluency with SQL joins by writing and explaining real queries.",
  "Establish a repeatable data-cleaning workflow in pandas on a small real dataset.",
];

const aditiTaskTemplates = [
  {
    title: "Learn SQL joins with INNER and LEFT JOIN",
    description:
      "Work through a short tutorial on INNER and LEFT JOIN, then write each query by hand against the two sample tables.",
    gapIndex: 0,
    day: 1,
    effortMinutes: 60,
    resource:
      "Search: 'SQL JOIN explained with examples' and open one tutorial that shows Venn diagrams of joined rows.",
    completionAction:
      "You can predict how many rows INNER JOIN returns before running it.",
    stuckAction: "Re-watch the join segment and copy each example query verbatim.",
    difficulty: "standard",
    dependsOn: "",
  },
  {
    title: "Write three SQL queries using INNER JOIN and explain the result",
    description:
      "Write three queries that use INNER JOIN to answer questions like 'which customers placed orders?', then explain each result in one sentence.",
    gapIndex: 0,
    day: 2,
    effortMinutes: 45,
    resource: "SQLBolt lessons 1-3 or any interactive join practice environment.",
    completionAction: "All three queries return correct results and each explanation is written down.",
    stuckAction: "Reduce to one query; draw the two tables on paper and manually match rows.",
    difficulty: "standard",
    dependsOn: "Learn SQL joins with INNER and LEFT JOIN",
  },
  {
    title: "Explore missing values in a tiny dataset",
    description:
      "Load a 20-row CSV into pandas, count missing values per column, and practice fillna and dropna on a copy.",
    gapIndex: 2,
    day: 3,
    effortMinutes: 30,
    resource: "pandas documentation: 'Working with missing data' guide.",
    completionAction: "You can say which columns had missing values and what you did with each.",
    stuckAction: "Use a 5-row hand-made table instead of a real dataset.",
    difficulty: "easier",
    dependsOn: "",
  },
  {
    title: "Clean a messy dataset using Pandas",
    description:
      "Take a 500-row dataset with missing values and duplicates; clean it and document each transformation you applied.",
    gapIndex: 1,
    day: 4,
    effortMinutes: 75,
    resource: "Search: 'pandas data cleaning exercise messy dataset'.",
    completionAction: "A cleaned CSV exists and every transformation is listed in a comment block.",
    stuckAction: "Insert a prerequisite review of missing values and deduplication first.",
    difficulty: "standard",
    dependsOn: "Explore missing values in a tiny dataset",
  },
  {
    title: "Build one summary chart and explain it",
    description:
      "From your cleaned data, build one grouped bar chart and write a two-sentence takeaway a non-technical reader could follow.",
    gapIndex: 3,
    day: 5,
    effortMinutes: 45,
    resource: "matplotlib gallery or any charting cheat sheet.",
    completionAction: "The chart is exported and the takeaway sentences are written.",
    stuckAction: "Sketch the chart on paper before writing any plotting code.",
    difficulty: "standard",
    dependsOn: "Clean a messy dataset using Pandas",
  },
];

export function seedDatabase() {
  initializeSchema();

  const insertUser = db.prepare(
    "INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)",
  );
  const insertProfile = db.prepare(
    `INSERT INTO skill_profiles (user_id, name, target_role, weekly_hours, skills_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertGap = db.prepare(
    `INSERT INTO skill_gaps
       (profile_id, skill_name, current_level, target_level, priority, severity, reason, evidence, status, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'identified', 'fallback', ?)`,
  );
  const insertPlan = db.prepare(
    `INSERT INTO weekly_plans (user_id, week_number, objectives_json, source, generated_at)
     VALUES (?, 1, ?, 'fallback', ?)`,
  );
  const insertTask = db.prepare(
    `INSERT INTO plan_tasks
       (plan_id, gap_id, title, description, effort_minutes, day, status, resource, completion_action, stuck_action, difficulty, depends_on, revision, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, 0, ?)`,
  );

  const seed = db.transaction(() => {
    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    const { lastInsertRowid: userId } = insertUser.run(
      DEMO_EMAIL,
      passwordHash,
      aditiProfile.name,
      now(),
    );

    const { lastInsertRowid: profileId } = insertProfile.run(
      userId,
      aditiProfile.name,
      aditiProfile.targetRole,
      aditiProfile.weeklyHours,
      JSON.stringify(aditiProfile.skills),
      now(),
      now(),
    );

    const gapIds = [];
    for (const gap of aditiGapSet) {
      const result = insertGap.run(
        profileId,
        gap.skillName,
        gap.currentLevel,
        gap.targetLevel,
        gap.priority,
        gap.severity,
        gap.reason,
        gap.evidence,
        now(),
      );
      gapIds.push(Number(result.lastInsertRowid));
    }

    const { lastInsertRowid: planId } = insertPlan.run(
      userId,
      JSON.stringify(aditiObjectives),
      now(),
    );
    for (const task of aditiTaskTemplates) {
      insertTask.run(
        planId,
        gapIds[task.gapIndex] ?? null,
        task.title,
        task.description,
        task.effortMinutes,
        task.day,
        task.resource,
        task.completionAction,
        task.stuckAction,
        task.difficulty,
        task.dependsOn,
        now(),
      );
    }

    return { userId, planId };
  });

  return seed();
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  if (process.argv.includes("--reset")) {
    resetDatabase();
    console.log("Database reset.");
  }
  const result = seedDatabase();
  console.log(`Seeded demo user ${DEMO_EMAIL} (user ${result.userId}, plan ${result.planId}).`);
}
