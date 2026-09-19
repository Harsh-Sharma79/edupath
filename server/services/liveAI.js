// Live AI adapter. Talks to Claude through the backend only, enforces a hard
// timeout, extracts JSON from the model output, validates it against the Zod
// contracts, and reports failure instead of throwing — the agent falls back
// whenever this module returns ok:false.
import { config } from "../config.js";
import {
  gapsResponseSchema,
  planResponseSchema,
  revisionResponseSchema,
  chatResponseSchema,
  parseWithSchema,
} from "./contracts.js";
import { fallbackAnalyzeGaps, fallbackGeneratePlan, fallbackChatAnswer } from "./fallbacks.js";

function buildPrompt(systemPrompt, userPayload) {
  return `${systemPrompt}

Return ONLY a single JSON object. No markdown fences, no commentary.

Learner context (the only facts you may rely on):
${JSON.stringify(userPayload, null, 2)}`;
}

async function callClaude(systemPrompt, userPayload) {
  const { apiKey, model, maxTokens, timeoutMs, maxOutputChars } = config.liveAi;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: buildPrompt(systemPrompt, userPayload) }],
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `claude_http_${response.status}` };
    }

    const payload = await response.json();
    const blocks = Array.isArray(payload?.content) ? payload.content : [];
    const text = blocks
      .filter((block) => block?.type === "text")
      .map((block) => block?.text || "")
      .join("\n")
      .slice(0, maxOutputChars);

    if (!text.trim()) {
      return { ok: false, error: "empty_completion" };
    }

    return { ok: true, text };
  } catch (error) {
    if (error?.name === "AbortError") return { ok: false, error: "timeout" };
    return { ok: false, error: "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function generateValidated(systemPrompt, userPayload, schema, fallbackFn) {
  const call = await callClaude(systemPrompt, userPayload);
  if (!call.ok) return { ok: false, error: call.error, data: fallbackFn };

  const parsed = extractJson(call.text);
  if (!parsed) return { ok: false, error: "invalid_json" };

  const validated = parseWithSchema(schema, parsed);
  if (!validated.ok) return { ok: false, error: "schema_validation_failed" };

  return { ok: true, data: validated.data };
}

export function isLiveAiEnabled() {
  return Boolean(config.liveAi.enabled && config.liveAi.apiKey);
}

export async function liveAnalyzeGaps(context) {
  const systemPrompt = `You are EduPath's gap analysis engine. Compare the learner's current skills with the requirements of their target role.
Produce 3-5 skill gaps. currentLevel and targetLevel use a 1-5 scale. Order gaps by priority (1 = do first).
The "reason" must reference the learner's actual stated skills or confidence and the target role. The "evidence" must be a concrete, observable demonstration of mastery.
JSON shape: {"gaps":[{"skillName":"...","currentLevel":1,"targetLevel":4,"priority":1,"reason":"...","evidence":"..."}]}`;

  return generateValidated(
    systemPrompt,
    {
      targetRole: context.targetRole,
      weeklyHours: context.weeklyHours,
      skills: context.skills,
    },
    gapsResponseSchema,
    () => fallbackAnalyzeGaps(context),
  );
}

export async function liveGeneratePlan(context, gaps) {
  const systemPrompt = `You are EduPath's weekly planning engine. Create a 7-day plan for the learner's top skill gaps.
Rules: 1-2 measurable weekly objectives; 3-5 concrete tasks; every task references a gap by index; no vague tasks like "learn SQL" — prefer "write three queries using INNER JOIN and explain the result".
Respect the learner's weekly hours: the sum of effortMinutes should not exceed weeklyHours*60.
JSON shape: {"objectives":["..."],"tasks":[{"title":"...","description":"...","effortMinutes":45,"day":1,"gapIndex":0,"resource":"...","completionAction":"...","stuckAction":"...","difficulty":"standard","dependsOn":""}]}`;

  return generateValidated(
    systemPrompt,
    {
      targetRole: context.targetRole,
      weeklyHours: context.weeklyHours,
      skills: context.skills,
      gaps: gaps.slice(0, 5).map((gap) => ({
        skillName: gap.skillName,
        currentLevel: gap.currentLevel,
        targetLevel: gap.targetLevel,
        priority: gap.priority,
      })),
    },
    planResponseSchema,
    () => fallbackGeneratePlan(context, gaps),
  );
}

export async function liveRevisePlan(context, observations, deterministicResult) {
  const systemPrompt = `You are EduPath's plan revision engine. The learner's task outcomes changed; propose a revised plan fragment.
Deterministic rules have already been applied. Refine the revision using the same gap and keep difficulty appropriate.
JSON shape: {"changes":[{"type":"task_added","taskTitle":"...","detail":"..."}],"reason":"...","affectedGap":"...","nextAction":"...","revisedTask":{"title":"...","description":"...","effortMinutes":30,"day":1,"resource":"...","completionAction":"...","stuckAction":"...","difficulty":"easier","dependsOn":""}}`;

  const result = await generateValidated(
    systemPrompt,
    {
      targetRole: context.targetRole,
      gaps: context.gaps.slice(0, 5).map((gap) => ({
        skillName: gap.skillName,
        priority: gap.priority,
      })),
      activePlan: context.plan,
      observations,
      deterministicDraft: deterministicResult,
    },
    revisionResponseSchema,
    () => deterministicResult,
  );
  return result;
}

export async function liveChatAnswer(context, question, recentMessages) {
  const systemPrompt = `You are EduPath's learning coach. Answer the learner's question using ONLY the provided context.
Ground every claim in the target role, current skills, gaps, or active plan. Never invent completed tasks, skills, or progress that are not in the context.
JSON shape: {"answer":"...","contextUsed":["targetRole","currentSkill","activeTask"]}`;

  return generateValidated(
    systemPrompt,
    {
      learner: { name: context.profile?.name, targetRole: context.targetRole },
      skills: context.skills,
      gaps: context.gaps.slice(0, 5),
      plan: context.plan,
      tasks: context.tasks,
      recentMessages,
    },
    chatResponseSchema,
    () => fallbackChatAnswer(context, question),
  );
}
