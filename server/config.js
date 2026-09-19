// Central server configuration. Every knob the demo can toggle lives here so
// the LIVE_AI / FALLBACK switch needs no code changes.
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// LIVE_AI=true enables Claude; anything else (or a missing API key) forces the
// deterministic fallback engine. The UI reads the resolved mode from /api/health.
export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInteger(process.env.PORT, 5000),
  databasePath: process.env.DB_PATH || path.join(__dirname, "data", "edupath.db"),

  liveAi: {
    enabled: parseBoolean(process.env.LIVE_AI, false),
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",
    maxTokens: parseInteger(process.env.ANTHROPIC_MAX_TOKENS, 1500),
    timeoutMs: parseInteger(process.env.AI_TIMEOUT_MS, 8000),
    maxOutputChars: parseInteger(process.env.AI_MAX_OUTPUT_CHARS, 20000),
  },

  auth: {
    tokenTtlSeconds: parseInteger(process.env.AUTH_TTL_SECONDS, 60 * 60 * 24 * 7),
  },

  chat: {
    maxHistoryMessages: parseInteger(process.env.CHAT_HISTORY_LIMIT, 20),
    maxMessageLength: parseInteger(process.env.CHAT_MAX_MESSAGE_LENGTH, 2000),
  },
};
