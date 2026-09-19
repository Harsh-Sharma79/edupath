import { createContext, useContext, useState } from "react";

function createInitialLearner() {
  return {
    id: "demo-learner",
    name: "Harsh",
    email: "student@example.com",
    avatar: "",
    education: "B.Tech",
    course: "CSE AI/ML",
    year: "2nd Year",
    targetRole: "Full Stack Developer",
    experienceLevel: "Intermediate",
    skills: [
      {
        name: "JavaScript",
        category: "Frontend",
        currentScore: 62,
        targetScore: 85,
        currentLevel: "Intermediate",
        targetLevel: "Advanced",
      },
      {
        name: "React",
        category: "Frontend",
        currentScore: 55,
        targetScore: 85,
        currentLevel: "Intermediate",
        targetLevel: "Advanced",
      },
      {
        name: "Python",
        category: "Programming",
        currentScore: 70,
        targetScore: 80,
        currentLevel: "Intermediate",
        targetLevel: "Advanced",
      },
    ],
    interests: ["Web Development", "AI/ML", "Software Development"],
    goals: [
      "Become a Full Stack Developer",
      "Build real-world projects",
      "Improve problem-solving skills",
    ],
  };
}

function normalizeName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getSkillName(skill) {
  if (typeof skill === "string") return skill.trim();
  return typeof skill?.name === "string" ? skill.name.trim() : "";
}

function getGoalKey(goal) {
  if (typeof goal === "string") return goal.trim().toLowerCase();
  if (!goal || typeof goal !== "object") return "";

  const identity = goal.id ?? goal.name ?? goal.title ?? goal.text ?? goal.value;
  return identity === undefined || identity === null
    ? ""
    : String(identity).trim().toLowerCase();
}

export const LearnerContext = createContext(null);

export function LearnerProvider({ children }) {
  const [learner, setLearnerState] = useState(() => createInitialLearner());

  const setLearner = (updates) => {
    setLearnerState((currentLearner) => {
      const nextUpdates = typeof updates === "function"
        ? updates(currentLearner)
        : updates;

      if (!nextUpdates || typeof nextUpdates !== "object") {
        return currentLearner;
      }

      return {
        ...currentLearner,
        ...nextUpdates,
        skills: Array.isArray(nextUpdates.skills)
          ? nextUpdates.skills
          : currentLearner.skills,
        goals: Array.isArray(nextUpdates.goals)
          ? nextUpdates.goals
          : currentLearner.goals,
        interests: Array.isArray(nextUpdates.interests)
          ? nextUpdates.interests
          : currentLearner.interests,
      };
    });
  };

  const targetRole = learner.targetRole || "";
  const skills = Array.isArray(learner.skills) ? learner.skills : [];
  const goals = Array.isArray(learner.goals) ? learner.goals : [];
  const interests = Array.isArray(learner.interests) ? learner.interests : [];

  const setTargetRole = (nextTargetRole) => {
    setLearnerState((currentLearner) => ({
      ...currentLearner,
      targetRole: typeof nextTargetRole === "function"
        ? nextTargetRole(currentLearner.targetRole || "")
        : nextTargetRole || "",
    }));
  };

  const setSkills = (nextSkills) => {
    setLearnerState((currentLearner) => {
      const resolvedSkills = typeof nextSkills === "function"
        ? nextSkills(Array.isArray(currentLearner.skills) ? currentLearner.skills : [])
        : nextSkills;

      return {
        ...currentLearner,
        skills: Array.isArray(resolvedSkills) ? resolvedSkills : [],
      };
    });
  };

  const setGoals = (nextGoals) => {
    setLearnerState((currentLearner) => {
      const resolvedGoals = typeof nextGoals === "function"
        ? nextGoals(Array.isArray(currentLearner.goals) ? currentLearner.goals : [])
        : nextGoals;

      return {
        ...currentLearner,
        goals: Array.isArray(resolvedGoals) ? resolvedGoals : [],
      };
    });
  };

  const setInterests = (nextInterests) => {
    setLearnerState((currentLearner) => {
      const resolvedInterests = typeof nextInterests === "function"
        ? nextInterests(Array.isArray(currentLearner.interests) ? currentLearner.interests : [])
        : nextInterests;

      return {
        ...currentLearner,
        interests: Array.isArray(resolvedInterests) ? resolvedInterests : [],
      };
    });
  };

  const updateLearner = (updates) => {
    if (!updates || typeof updates !== "object") return;
    setLearner(updates);
  };

  const updateSkill = (skillName, updates) => {
    const normalizedName = normalizeName(skillName);
    if (!normalizedName || !updates || typeof updates !== "object") return;

    setLearnerState((currentLearner) => {
      const currentSkills = Array.isArray(currentLearner.skills)
        ? currentLearner.skills
        : [];
      const skillExists = currentSkills.some(
        (skill) => normalizeName(getSkillName(skill)) === normalizedName,
      );

      if (!skillExists) return currentLearner;

      return {
        ...currentLearner,
        skills: currentSkills.map((skill) =>
          normalizeName(getSkillName(skill)) === normalizedName
            ? { ...skill, ...updates }
            : skill,
        ),
      };
    });
  };

  const addSkill = (skill) => {
    const skillName = getSkillName(skill);
    if (!skillName) return;

    const skillToAdd = typeof skill === "string" ? { name: skillName } : { ...skill, name: skillName };
    const normalizedName = normalizeName(skillName);

    setLearnerState((currentLearner) => {
      const currentSkills = Array.isArray(currentLearner.skills)
        ? currentLearner.skills
        : [];
      const isDuplicate = currentSkills.some(
        (existingSkill) => normalizeName(getSkillName(existingSkill)) === normalizedName,
      );

      return isDuplicate
        ? currentLearner
        : { ...currentLearner, skills: [...currentSkills, skillToAdd] };
    });
  };

  const removeSkill = (skillName) => {
    const normalizedName = normalizeName(skillName);
    if (!normalizedName) return;

    setLearnerState((currentLearner) => ({
      ...currentLearner,
      skills: (Array.isArray(currentLearner.skills) ? currentLearner.skills : []).filter(
        (skill) => normalizeName(getSkillName(skill)) !== normalizedName,
      ),
    }));
  };

  const addGoal = (goal) => {
    const goalKey = getGoalKey(goal);
    if (!goalKey) return;

    setLearnerState((currentLearner) => {
      const currentGoals = Array.isArray(currentLearner.goals)
        ? currentLearner.goals
        : [];
      const isDuplicate = currentGoals.some((existingGoal) => getGoalKey(existingGoal) === goalKey);

      return isDuplicate
        ? currentLearner
        : { ...currentLearner, goals: [...currentGoals, goal] };
    });
  };

  const removeGoal = (goal) => {
    const goalKey = getGoalKey(goal);
    if (!goalKey) return;

    setLearnerState((currentLearner) => ({
      ...currentLearner,
      goals: (Array.isArray(currentLearner.goals) ? currentLearner.goals : []).filter(
        (existingGoal) => getGoalKey(existingGoal) !== goalKey,
      ),
    }));
  };

  const resetLearner = () => {
    setLearnerState(createInitialLearner());
  };

  const contextValue = {
    learner,
    setLearner,
    targetRole,
    setTargetRole,
    skills,
    setSkills,
    goals,
    setGoals,
    interests,
    setInterests,
    updateLearner,
    updateSkill,
    addSkill,
    removeSkill,
    addGoal,
    removeGoal,
    resetLearner,
  };

  return (
    <LearnerContext.Provider value={contextValue}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);

  if (!context) {
    throw new Error("useLearner must be used within a LearnerProvider");
  }

  return context;
}
