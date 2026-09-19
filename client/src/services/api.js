const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const defaultHeaders = {
  Accept: "application/json",
};

const statusMessages = {
  400: "The request could not be understood.",
  401: "You are not authorized to perform this action.",
  403: "You do not have permission to perform this action.",
  404: "The requested EduPath resource was not found.",
  409: "This request conflicts with the current resource state.",
  422: "Some of the provided information needs attention.",
  429: "Too many requests were made. Please try again shortly.",
};

function endpointPath(...segments) {
  return segments
    .filter((segment) => segment !== undefined && segment !== null && segment !== "")
    .map((segment) => encodeURIComponent(String(segment)))
    .join("/");
}

function buildUrl(endpoint) {
  const baseUrl = String(API_BASE_URL).replace(/\/+$/, "");
  const safeEndpoint = String(endpoint || "").replace(/^\/+/, "");
  return safeEndpoint ? `${baseUrl}/${safeEndpoint}` : baseUrl;
}

function parseResponseBody(text, contentType = "") {
  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getServerMessage(data, status) {
  if (data && typeof data === "object") {
    const candidate = data.message || data.error || data.detail;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === "object" && typeof candidate.message === "string") {
      return candidate.message.trim();
    }
  }

  return statusMessages[status] || (status >= 500
    ? "The EduPath server encountered an error. Please try again later."
    : "The request could not be completed.");
}

function unwrapResponseData(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data;
  }

  return payload;
}

function createHttpError(message, status, data) {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}

async function request(endpoint, options = {}) {
  const { body, headers: optionHeaders, ...fetchOptions } = options;
  const hasBody = body !== undefined && body !== null;
  const headers = {
    ...defaultHeaders,
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(optionHeaders || {}),
  };

  const requestOptions = {
    ...fetchOptions,
    headers,
  };

  if (hasBody) {
    requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(endpoint), requestOptions);
  } catch {
    throw createHttpError(
      "Unable to connect to the EduPath server. Please try again.",
      0,
      null,
    );
  }

  const responseText = await response.text();
  const responseData = parseResponseBody(
    responseText,
    response.headers.get("content-type") || "",
  );

  if (!response.ok) {
    throw createHttpError(
      getServerMessage(responseData, response.status),
      response.status,
      responseData,
    );
  }

  return unwrapResponseData(responseData);
}

export async function getLearner(learnerId) {
  return request(`learners/${endpointPath(learnerId)}`, { method: "GET" });
}

export async function updateLearner(learnerId, data) {
  return request(`learners/${endpointPath(learnerId)}`, {
    method: "PATCH",
    body: data,
  });
}

export async function getLearnerSkills(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/skills`, { method: "GET" });
}

export async function updateLearnerSkill(learnerId, skillId, data) {
  return request(`learners/${endpointPath(learnerId)}/skills/${endpointPath(skillId)}`, {
    method: "PATCH",
    body: data,
  });
}

export async function getSkillGaps(learnerId, role) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  const query = params.toString();
  const endpoint = `learners/${endpointPath(learnerId)}/skill-gaps${query ? `?${query}` : ""}`;
  return request(endpoint, { method: "GET" });
}

export async function analyzeSkillGaps(learnerId, role) {
  const body = role ? { role } : {};
  return request(`learners/${endpointPath(learnerId)}/skill-gaps/analyze`, {
    method: "POST",
    body,
  });
}

export async function getLearningPlan(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/plan`, { method: "GET" });
}

export async function createLearningPlan(learnerId, data) {
  return request(`learners/${endpointPath(learnerId)}/plan`, {
    method: "POST",
    body: data,
  });
}

export async function updateLearningPlan(learnerId, data) {
  return request(`learners/${endpointPath(learnerId)}/plan`, {
    method: "PATCH",
    body: data,
  });
}

export async function getTasks(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/tasks`, { method: "GET" });
}

export async function getTask(learnerId, taskId) {
  return request(`learners/${endpointPath(learnerId)}/tasks/${endpointPath(taskId)}`, {
    method: "GET",
  });
}

export async function updateTask(learnerId, taskId, data) {
  return request(`learners/${endpointPath(learnerId)}/tasks/${endpointPath(taskId)}`, {
    method: "PATCH",
    body: data,
  });
}

export async function completeTask(learnerId, taskId) {
  return request(`learners/${endpointPath(learnerId)}/tasks/${endpointPath(taskId)}/complete`, {
    method: "POST",
  });
}

export async function getAdaptations(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/adaptations`, { method: "GET" });
}

export async function getLatestAdaptation(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/adaptations/latest`, {
    method: "GET",
  });
}

export async function requestAdaptation(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/adaptations`, {
    method: "POST",
  });
}

export async function getProgress(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/progress`, { method: "GET" });
}

export async function getSkillProgress(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/progress/skills`, {
    method: "GET",
  });
}

export async function getAgentStatus(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/agent/status`, { method: "GET" });
}

export async function getAgentActivities(learnerId) {
  return request(`learners/${endpointPath(learnerId)}/agent/activities`, {
    method: "GET",
  });
}

export async function sendChatMessage(learnerId, message, conversationId) {
  return request(`learners/${endpointPath(learnerId)}/chat`, {
    method: "POST",
    body: {
      message,
      conversationId,
    },
  });
}

export async function getChatHistory(learnerId, conversationId) {
  return request(`learners/${endpointPath(learnerId)}/chat/${endpointPath(conversationId)}`, {
    method: "GET",
  });
}
