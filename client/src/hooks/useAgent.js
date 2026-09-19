import { useMemo, useState } from "react";

const supportedStatuses = new Set([
  "online",
  "working",
  "analyzing",
  "planning",
  "updating",
  "completed",
  "paused",
  "error",
  "offline",
]);

const supportedActivityTypes = new Set([
  "analysis",
  "skill-gap",
  "plan",
  "task",
  "adaptation",
  "recommendation",
  "success",
  "info",
  "warning",
]);

const workingStatuses = new Set([
  "working",
  "analyzing",
  "planning",
  "updating",
]);

const taskStatusMap = {
  analysis: "analyzing",
  "skill-gap": "analyzing",
  planning: "planning",
  plan: "planning",
  adaptation: "updating",
  updating: "updating",
  task: "working",
  working: "working",
};

const demoState = {
  status: "online",
  activities: [
    {
      id: "activity-1",
      type: "analysis",
      title: "Skill profile ready",
      description: "Your current skills are ready to be analyzed.",
      timestamp: "",
      status: "completed",
    },
  ],
};

let generatedActivityId = 0;

function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeStatus(status, fallback = "online") {
  const normalizedStatus = normalize(status);
  return supportedStatuses.has(normalizedStatus) ? normalizedStatus : fallback;
}

function normalizeActivityType(type) {
  const normalizedType = normalize(type);
  return supportedActivityTypes.has(normalizedType) ? normalizedType : "info";
}

function createActivityId() {
  generatedActivityId += 1;
  return `activity-${Date.now()}-${generatedActivityId}`;
}

function sanitizeActivity(activity) {
  if (!activity || typeof activity !== "object") return null;

  const title = typeof activity.title === "string" ? activity.title.trim() : "";
  const description = typeof activity.description === "string"
    ? activity.description.trim()
    : "";

  if (!title && !description) return null;

  return {
    id: activity.id === undefined || activity.id === null || String(activity.id).trim() === ""
      ? createActivityId()
      : String(activity.id),
    type: normalizeActivityType(activity.type),
    title: title || "Agent update",
    description,
    timestamp: activity.timestamp || "",
    status: normalizeStatus(activity.status, "completed"),
  };
}

function cloneActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return activities.map(sanitizeActivity).filter(Boolean);
}

function createInitialState(initialState) {
  const hasInitialState = initialState && typeof initialState === "object" && Object.keys(initialState).length > 0;
  const source = hasInitialState ? initialState : demoState;

  return {
    status: normalizeStatus(source.status),
    activities: cloneActivities(source.activities),
  };
}

function getSafeErrorMessage(errorMessage) {
  if (typeof errorMessage !== "string") return "The requested update could not be completed.";

  const firstLine = errorMessage.split(/[\r\n]/)[0].trim();
  const withoutStackMarker = firstLine.replace(/^error:\s*/i, "");
  return withoutStackMarker.slice(0, 160) || "The requested update could not be completed.";
}

export function useAgent(initialState = {}) {
  const [state, setState] = useState(() => createInitialState(initialState));
  const { status, activities } = state;

  const latestActivity = useMemo(() => activities[0] || null, [activities]);
  const isWorking = useMemo(() => workingStatuses.has(status), [status]);

  const setStatus = (nextStatus) => {
    setState((currentState) => {
      const resolvedStatus = typeof nextStatus === "function"
        ? nextStatus(currentState.status)
        : nextStatus;

      return {
        ...currentState,
        status: normalizeStatus(resolvedStatus, currentState.status),
      };
    });
  };

  const addActivity = (activity) => {
    const safeActivity = sanitizeActivity(activity);
    if (!safeActivity) return null;

    setState((currentState) => ({
      ...currentState,
      activities: [safeActivity, ...currentState.activities],
    }));

    return safeActivity.id;
  };

  const removeActivity = (activityId) => {
    if (activityId === undefined || activityId === null) return;
    const normalizedId = String(activityId);

    setState((currentState) => ({
      ...currentState,
      activities: currentState.activities.filter(
        (activity) => String(activity.id) !== normalizedId,
      ),
    }));
  };

  const clearActivities = () => {
    setState((currentState) => ({
      ...currentState,
      activities: [],
    }));
  };

  const startTask = (taskType) => {
    const normalizedType = normalize(taskType);
    const nextStatus = taskStatusMap[normalizedType] || "working";
    setStatus(nextStatus);
  };

  const finishTask = (activity) => {
    setStatus("completed");
    if (activity) addActivity(activity);
  };

  const failTask = (errorMessage) => {
    setStatus("error");
    addActivity({
      type: "warning",
      title: "Agent update could not be completed",
      description: getSafeErrorMessage(errorMessage),
      status: "error",
    });
  };

  const getActivitiesByType = (type) => {
    const normalizedType = normalize(type);
    if (!supportedActivityTypes.has(normalizedType)) return [];
    return activities.filter((activity) => activity.type === normalizedType);
  };

  const resetAgent = () => {
    setState(createInitialState(initialState));
  };

  return {
    status,
    activities,
    latestActivity,
    isWorking,

    setStatus,
    addActivity,
    removeActivity,
    clearActivities,

    startTask,
    finishTask,
    failTask,

    getActivitiesByType,
    resetAgent,
  };
}
