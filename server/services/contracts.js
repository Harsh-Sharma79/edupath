// Zod contracts. Every AI response passes through one of these before it is
// stored or rendered; a failed validation always routes to fallback instead of
// ever letting raw model text become application state.
import { z } from "zod";

export const gapSchema = z.object({
  skillName: z.string().min(1).max(80),
  currentLevel: z.number().int().min(1).max(5),
  targetLevel: z.number().int().min(1).max(5),
  priority: z.number().int().min(1).max(10),
  reason: z.string().min(1).max(600),
  evidence: z.string().min(1).max(600),
});

export const gapsResponseSchema = z.object({
  gaps: z.array(gapSchema).min(3).max(5),
});

export const taskSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(600),
  effortMinutes: z.number().int().min(15).max(180),
  day: z.number().int().min(1).max(7),
  gapIndex: z.number().int().min(0).max(4),
  resource: z.string().max(400).default(""),
  completionAction: z.string().max(400).default(""),
  stuckAction: z.string().max(400).default(""),
  difficulty: z.enum(["easier", "standard", "harder"]).default("standard"),
  dependsOn: z.string().max(160).default(""),
});

export const planResponseSchema = z.object({
  objectives: z.array(z.string().min(3).max(300)).min(1).max(4),
  tasks: z.array(taskSchema).min(3).max(8),
});

export const revisionChangeSchema = z.object({
  type: z.enum([
    "task_added",
    "task_revised",
    "task_replaced",
    "task_unlocked",
    "difficulty_reduced",
    "explanation_added",
  ]),
  taskTitle: z.string().max(160).default(""),
  detail: z.string().min(3).max(400),
});

export const revisionResponseSchema = z.object({
  changes: z.array(revisionChangeSchema).min(1).max(8),
  reason: z.string().min(3).max(600),
  affectedGap: z.string().max(80).default(""),
  nextAction: z.string().min(3).max(400),
  revisedTask: taskSchema.partial({ gapIndex: true }).optional(),
});

export const chatResponseSchema = z.object({
  answer: z.string().min(3).max(2000),
  contextUsed: z.array(z.string().max(60)).max(8).default([]),
});

export function parseWithSchema(schema, payload) {
  const result = schema.safeParse(payload);
  return result.success ? { ok: true, data: result.data } : { ok: false, errors: result.error.issues };
}
