import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEduPath } from "../context/LearnerContext";
import RoleSelector from "../components/profile/RoleSelector";
import SkillInput from "../components/profile/SkillInput";
import PageContainer from "../components/layout/PageContainer";

const SKILL_SUGGESTIONS = [
  "Python Basics",
  "SQL Basics",
  "Pandas",
  "Data Cleaning",
  "Data Visualization",
  "Machine Learning Intro",
  "Insight Communication",
  "Statistics",
  "Excel",
  "Git",
];

const CONFIDENCE_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "uncertain", label: "Uncertain" },
  { value: "learning", label: "Still learning" },
];

function levelLabel(level) {
  return ["New", "Beginner", "Developing", "Comfortable", "Strong"][Number(level) - 1] || "Beginner";
}

export default function ProfilePage({ setupMode = false }) {
  const navigate = useNavigate();
  const { profile, saveProfile, analyze, loadDemo, loading, user } = useEduPath();

  const [name, setName] = useState(profile?.name || user?.name || "");
  const [targetRole, setTargetRole] = useState(profile?.targetRole || "");
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours ?? 5);
  const [skills, setSkills] = useState(() =>
    (profile?.skills || []).map((skill) => ({
      name: skill.name,
      level: skill.level || 3,
      confidence: skill.confidence || "learning",
      evidence: skill.evidence || "",
    })),
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile && skills.length === 0) {
      setSkills(
        (profile.skills || []).map((skill) => ({
          name: skill.name,
          level: skill.level || 3,
          confidence: skill.confidence || "learning",
          evidence: skill.evidence || "",
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const addSkill = (skillName) => {
    const trimmed = String(skillName || "").trim();
    if (!trimmed) return;
    setSkills((current) =>
      current.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())
        ? current
        : [...current, { name: trimmed, level: 3, confidence: "learning", evidence: "" }],
    );
  };

  const removeSkill = (skillName) => {
    setSkills((current) => current.filter((skill) => skill.name !== skillName));
  };

  const updateSkill = (skillName, updates) => {
    setSkills((current) =>
      current.map((skill) => (skill.name === skillName ? { ...skill, ...updates } : skill)),
    );
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Learner name is required.";
    if (!targetRole.trim()) next.targetRole = "Choose a target role.";
    const hours = Number(weeklyHours);
    if (!Number.isFinite(hours) || hours < 1 || hours > 40) {
      next.weeklyHours = "Weekly hours must be between 1 and 40.";
    }
    if (skills.length < 3) next.skills = "Add at least 3 skills.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    name: name.trim(),
    targetRole,
    weeklyHours: Number(weeklyHours),
    skills: skills.map((skill) => ({
      name: skill.name,
      level: Number(skill.level),
      confidence: skill.confidence,
      evidence: skill.evidence,
    })),
  });

  const handleSaveOnly = async () => {
    if (!validate()) return;
    const ok = await saveProfile(buildPayload());
    if (ok && setupMode) navigate("/dashboard");
  };

  const handleSaveThenAnalyze = async () => {
    if (!validate()) return;
    const ok = await saveProfile(buildPayload());
    if (!ok) return;
    const analyzed = await analyze();
    if (analyzed) navigate("/skill-gaps");
  };

  const handleDemo = async () => {
    const ok = await loadDemo();
    if (ok) navigate("/dashboard");
  };

  return (
    <PageContainer
      title={setupMode ? "Set up your learner profile" : "Your profile"}
      description="Tell EduPath what you already know and where you are heading. Everything downstream — gaps, plan, adaptation — derives from this."
      actions={
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors duration-200 hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Load Demo Profile
        </button>
      }
      className={setupMode ? "pt-10" : ""}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">Learner details</h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Learner name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aditi Sharma"
                className={`min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                }`}
              />
              {errors.name && <p className="mt-1.5 text-sm text-rose-600">{errors.name}</p>}
            </label>

            <RoleSelector
              value={targetRole}
              onChange={setTargetRole}
              label="Target role"
              error={errors.targetRole}
              showDescriptions={false}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Weekly available hours: <strong className="tabular-nums text-indigo-600">{weeklyHours}</strong>
              </span>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="mt-1 block text-xs text-slate-400">
                Between 1 and 40 hours per week. Plan effort is sized from this.
              </span>
              {errors.weeklyHours && <p className="mt-1.5 text-sm text-rose-600">{errors.weeklyHours}</p>}
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">Current skills</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add at least three. Set your honest level for each — the gap analysis compares these against your target role.
          </p>

          <div className="mt-4">
            <SkillInput
              value={skills.map((skill) => skill.name)}
              onChange={(nextNames) => {
                const incoming = Array.isArray(nextNames) ? nextNames : [];
                setSkills((current) => {
                  const currentNames = new Set(current.map((skill) => skill.name.toLowerCase()));
                  const additions = incoming
                    .filter((skillName) => !currentNames.has(String(skillName).toLowerCase()))
                    .map((skillName) => ({
                      name: String(skillName),
                      level: 3,
                      confidence: "learning",
                      evidence: "",
                    }));
                  const kept = current.filter((skill) =>
                    incoming.some((name) => String(name).toLowerCase() === skill.name.toLowerCase()),
                  );
                  return [...kept, ...additions];
                });
              }}
              suggestions={SKILL_SUGGESTIONS}
              label="Skills"
              placeholder="Search or add a skill…"
              error={errors.skills}
            />
          </div>

          {skills.length > 0 && (
            <ul className="mt-5 space-y-3">
              {skills.map((skill) => (
                <li key={skill.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-slate-800">{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.name)}
                      className="text-xs font-semibold text-slate-400 transition-colors hover:text-rose-600"
                      aria-label={`Remove ${skill.name}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-500">Level: {levelLabel(skill.level)}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={skill.level}
                        onChange={(event) => updateSkill(skill.name, { level: Number(event.target.value) })}
                        className="w-full accent-indigo-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-500">Confidence</span>
                      <select
                        value={skill.confidence}
                        onChange={(event) => updateSkill(skill.name, { confidence: event.target.value })}
                        className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
                      >
                        {CONFIDENCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Evidence (optional)</span>
                    <input
                      type="text"
                      value={skill.evidence}
                      onChange={(event) => updateSkill(skill.name, { evidence: event.target.value })}
                      placeholder="e.g. completed a course, built a small project"
                      className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSaveThenAnalyze}
          disabled={loading}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Working…" : "Save Profile & Analyze Gaps"}
        </button>
        <button
          type="button"
          onClick={handleSaveOnly}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Only
        </button>
      </div>

      {setupMode && (
        <p className="mt-4 text-sm text-slate-500">
          Tip: you can also skip all typing with{" "}
          <button type="button" onClick={handleDemo} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Load Demo Profile
          </button>
          .
        </p>
      )}
    </PageContainer>
  );
}
