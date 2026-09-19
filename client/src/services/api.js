// Thin API client. Every call attaches the bearer token when present and
// converts server errors into friendly messages. The frontend never needs to
// know whether an answer came from live AI or the deterministic fallback.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "edupath_token";
const USER_KEY = "edupath_user";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  } catch {
    // Private browsing — session stays in memory only.
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

const statusMessages = {
  400: "The request could not be completed.",
  401: "Your session expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested EduPath resource was not found.",
  409: "This conflicts with the current state.",
  422: "Some of the provided information needs attention.",
  429: "Too many requests. Please try again shortly.",
};

async function request(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Unable to reach the EduPath server. Is it running?");
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      statusMessages[response.status] ||
      "The request could not be completed.";
    const error = new Error(typeof message === "string" ? message : "Request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}

// --- system -----------------------------------------------------------------
export const getHealth = () => request("/health");

// --- demo -------------------------------------------------------------------
export const loadDemoSeed = () => request("/demo/seed");

// --- auth -------------------------------------------------------------------
export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

export const signup = (name, email, password) =>
  request("/auth/signup", { method: "POST", body: { name, email, password } });

// --- profile ----------------------------------------------------------------
export const getProfile = () => request("/profile");

export const saveProfile = (profile) => request("/profile", { method: "POST", body: profile });

// --- gaps -------------------------------------------------------------------
export const analyzeGaps = () => request("/gaps/analyze", { method: "POST", body: {} });

export const fetchGaps = () => request("/gaps");

// --- plan -------------------------------------------------------------------
export const fetchCurrentPlan = () => request("/plans/current");

export const generatePlan = () => request("/plans/generate", { method: "POST", body: {} });

export const revisePlan = () => request("/plans/revise", { method: "POST", body: {} });

// --- tasks ------------------------------------------------------------------
export const setTaskStatus = (taskId, status, note = "") =>
  request(`/tasks/${taskId}/status`, { method: "POST", body: { status, note } });

// --- chat -------------------------------------------------------------------
export const sendChatMessage = (message) => request("/chat", { method: "POST", body: { message } });

export const fetchChatHistory = () => request("/chat");

// --- report -----------------------------------------------------------------
export const fetchReport = () => request("/report");
