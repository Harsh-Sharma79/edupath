import React from "react";
import { useLearner as useLearnerContext } from "../context/LearnerContext";

function normalizeSkillName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function useLearner() {
  const context = useLearnerContext();
  const learner = context?.learner || {};
  const skills = Array.isArray(context?.skills)
    ? context.skills
    : Array.isArray(learner.skills)
      ? learner.skills
      : [];
  const goals = Array.isArray(context?.goals)
    ? context.goals
    : Array.isArray(learner.goals)
      ? learner.goals
      : [];
  const interests = Array.isArray(context?.interests)
    ? context.interests
    : Array.isArray(learner.interests)
      ? learner.interests
      : [];

  const learnerName = learner.name || "";
  const currentRole = context?.targetRole || learner.targetRole || "";
  const skillCount = skills.length;
  const goalCount = goals.length;
  const interestCount = interests.length;
  const hasLearner = Boolean(learner && Object.keys(learner).length > 0);
  const hasSkills = skillCount > 0;
  const hasGoals = goalCount > 0;

  const getSkill = (skillName) => {
    const normalizedName = normalizeSkillName(skillName);
    if (!normalizedName) return null;

    return (
      skills.find((skill) => {
        const name = typeof skill === "string" ? skill : skill?.name;
        return normalizeSkillName(name) === normalizedName;
      }) || null
    );
  };

  const hasSkill = (skillName) => Boolean(getSkill(skillName));

  return {
    learner,
    targetRole: currentRole,
    skills,
    goals,
    interests,

    setLearner: context?.setLearner,
    setTargetRole: context?.setTargetRole,
    setSkills: context?.setSkills,
    setGoals: context?.setGoals,
    setInterests: context?.setInterests,

    updateLearner: context?.updateLearner,
    updateSkill: context?.updateSkill,
    addSkill: context?.addSkill,
    removeSkill: context?.removeSkill,
    addGoal: context?.addGoal,
    removeGoal: context?.removeGoal,
    resetLearner: context?.resetLearner,

    learnerName,
    currentRole,
    skillCount,
    goalCount,
    interestCount,
    hasLearner,
    hasSkills,
    hasGoals,
    getSkill,
    hasSkill,
  };
}
