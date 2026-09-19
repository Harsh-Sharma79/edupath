import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { agentMode } from "../services/agent.js";

import authRoutes from "./auth.js";
import demoRoutes from "./demo.js";
import profileRoutes from "./profile.js";
import gapsRoutes from "./gaps.js";
import planRoutes from "./plan.js";
import tasksRoutes from "./tasks.js";
import chatRoutes from "./chat.js";
import reportRoutes from "./report.js";

export function buildApiRouter() {
  const apiRouter = Router();

  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/demo", demoRoutes);
  apiRouter.use("/chat", requireAuth, chatRoutes);
  apiRouter.use("/report", requireAuth, reportRoutes);
  apiRouter.use("/profile", requireAuth, profileRoutes);
  apiRouter.use("/gaps", requireAuth, gapsRoutes);
  apiRouter.use("/plans", requireAuth, planRoutes);
  apiRouter.use("/tasks", requireAuth, tasksRoutes);

  return apiRouter;
}

export { agentMode };
