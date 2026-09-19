import React from "react";
import { useMemo, useState } from "react";

const supportedStatuses = new Set([
  "pending",
  "in-progress",
  "completed",
  "locked",
  "skipped",
]);

const demoPlan = {
  id: "plan-demo",
  title: "Full Stack Developer Learning Path",
  description: "A personalized learning plan for becoming a Full Stack Developer.",
  targetRole: "Full Stack Developer",
  duration: "12 weeks",
  createdAt: "",
  updatedAt: "",
};

const demoTasks = [
  {
    id: "task-javascript-async",
    title: "Master JavaScript Async Patterns",
    description: "Learn promises, async/await, error handling, and asynchronous workflows.",
    status: "in-progress",
    type: "Learning",
    duration: "45 min",
    difficulty: "Intermediate",
    skill: "JavaScript",
    dueDate: "This week",
    progress: 45,
    resources: [],
  },
  {
    id: "task-react-components",
    title: "Build Reusable React Components",
    description: "Practice component composition, props, and reusable UI patterns.",
    status: "pending",
    type: "Practice",
    duration: "60 min",
    difficulty: "Intermediate",
    skill: "React",
    dueDate: "Next week",
    progress: 0,
    resources: [],
  },
  {
    id: "task-node-api",
    title: "Create a Node.js API",
    description: "Build a small REST API with routing, validation, and clear responses.",
    status: "pending",
    type: "Project",
    duration: "90 min",
    difficulty: "Intermediate",
    skill: "Node.js",
    dueDate: "Next week",
    progress: 0,
    resources: [],
  },
  {
    id: "task-sql-joins",
    title: "Practice SQL Joins",
    description: "Use inner, left, and aggregate joins to answer practical data questions.",
    status: "completed",
    type: "Practice",
    duration: "40 min",
    difficulty: "Beginner",
    skill: "SQL",
    dueDate: "Completed",
    progress: 100,
    resources: [],
  },
  {
    id: "task-git-workflow",
    title: "Improve Your Git Workflow",
    description: "Practice branching, pull requests, and meaningful commit history.",
    status: "locked",
    type: "Learning",
    duration: "35 min",
    difficulty: "Beginner",
    skill: "Git",
    dueDate: "Locked",
    progress: 0,
    resources: [],
  },
  {
    id: "task-full-stack-project",
    title: "Plan a Full Stack Project",
    description: "Define a small project that brings your frontend and backend skills together.",
    status: "pending",
    type: "Project",
    duration: "75 min",
    difficulty: "Advanced",
    skill: "Full Stack Development",
    dueDate: "In two weeks",
    progress: 0,
    resources: [],
  },
];

function cloneTask(task) {
  if (!task || typeof task !== "object") return null;
  return {
    ...task,
    resources: Array.isArray(task.resources) ? [...task.resources] : [],
  };
}

function cloneTasks(tasks) {
  return Array.isArray(tasks) ? tasks.map(cloneTask).filter(Boolean) : [];
}

function clonePlan(plan) {
  return plan && typeof plan === "object" ? { ...plan } : null;
}

function createInitialState(initialPlan) {
  const hasInitialPlan = initialPlan && typeof initialPlan === "object";
  const plan = clonePlan(hasInitialPlan ? initialPlan : demoPlan);
  const tasks = cloneTasks(
    hasInitialPlan && Array.isArray(initialPlan.tasks) ? initialPlan.tasks : demoTasks,
  );

  return { plan, tasks, currentTaskId: null };
}

function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function safeTaskId(taskId) {
  return taskId === undefined || taskId === null ? "" : String(taskId);
}

export function usePlan(initialPlan = null) {
  const [state, setState] = useState(() => createInitialState(initialPlan));
  const { plan, tasks, currentTaskId } = state;

  const updateStateTasks = (updater) => {
    setState((currentState) => ({
      ...currentState,
      tasks: updater(currentState.tasks),
    }));
  };

  const setPlan = (nextPlan) => {
    setState((currentState) => {
      const resolvedPlan = typeof nextPlan === "function"
        ? nextPlan(currentState.plan)
        : nextPlan;

      return {
        ...currentState,
        plan: clonePlan(resolvedPlan),
      };
    });
  };

  const setTasks = (nextTasks) => {
    setState((currentState) => {
      const resolvedTasks = typeof nextTasks === "function"
        ? nextTasks(currentState.tasks)
        : nextTasks;

      return {
        ...currentState,
        tasks: cloneTasks(resolvedTasks),
        currentTaskId: Array.isArray(resolvedTasks) && resolvedTasks.some(
          (task) => String(task?.id) === String(currentState.currentTaskId),
        )
          ? currentState.currentTaskId
          : null,
      };
    });
  };

  const currentTask = useMemo(
    () => tasks.find((task) => String(task?.id) === String(currentTaskId)) || null,
    [currentTaskId, tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => normalize(task?.status) === "completed").length,
    [tasks],
  );
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0
    ? Math.min(100, Math.max(0, (completedTasks / totalTasks) * 100))
    : 0;

  const updateTask = (taskId, updates) => {
    const normalizedId = safeTaskId(taskId);
    if (!normalizedId || !updates || typeof updates !== "object") return;

    updateStateTasks((currentTasks) => {
      const exists = currentTasks.some((task) => String(task?.id) === normalizedId);
      if (!exists) return currentTasks;

      return currentTasks.map((task) =>
        String(task?.id) === normalizedId
          ? { ...task, ...updates }
          : { ...task },
      );
    });
  };

  const completeTask = (taskId) => {
    updateTask(taskId, { status: "completed", progress: 100 });
  };

  const reopenTask = (taskId) => {
    const normalizedId = safeTaskId(taskId);
    if (!normalizedId) return;

    updateStateTasks((currentTasks) =>
      currentTasks.map((task) =>
        String(task?.id) === normalizedId && ["completed", "skipped"].includes(normalize(task?.status))
          ? { ...task, status: "pending" }
          : { ...task },
      ),
    );
  };

  const skipTask = (taskId) => {
    updateTask(taskId, { status: "skipped" });
  };

  const getTask = (taskId) => {
    const normalizedId = safeTaskId(taskId);
    if (!normalizedId) return null;
    return tasks.find((task) => String(task?.id) === normalizedId) || null;
  };

  const getTasksByStatus = (status) => {
    const normalizedStatus = normalize(status);
    if (!supportedStatuses.has(normalizedStatus)) return [];
    return tasks.filter((task) => normalize(task?.status) === normalizedStatus);
  };

  const getTasksBySkill = (skillName) => {
    const normalizedSkill = normalize(skillName);
    if (!normalizedSkill) return [];
    return tasks.filter((task) => normalize(task?.skill) === normalizedSkill);
  };

  const setCurrentTask = (taskId) => {
    const normalizedId = safeTaskId(taskId);
    const exists = normalizedId && tasks.some((task) => String(task?.id) === normalizedId);

    setState((currentState) => ({
      ...currentState,
      currentTaskId: exists ? normalizedId : null,
    }));
  };

  const resetPlan = () => {
    setState(createInitialState(initialPlan));
  };

  return {
    plan,
    tasks,
    currentTask,
    completedTasks,
    totalTasks,
    completionPercentage,

    setPlan,
    setTasks,

    updateTask,
    completeTask,
    reopenTask,
    skipTask,

    getTask,
    getTasksByStatus,
    getTasksBySkill,

    setCurrentTask,
    resetPlan,
  };
}
