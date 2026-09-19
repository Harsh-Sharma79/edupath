import express from "express";
import cors from "cors";

export function createApp(routes) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "edupath-server",
      time: new Date().toISOString(),
      agentMode: routes.agentMode(),
    });
  });

  app.use("/api", routes.apiRouter);

  // JSON 404 for unknown API paths (the SPA handles its own routing).
  app.use("/api", (req, res) => {
    res.status(404).json({ message: "API endpoint not found." });
  });

  // Final error handler: never leaks stack traces to the client.
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err?.message || err);
    res.status(500).json({
      message: "Something went wrong on the EduPath server. Please try again.",
    });
  });

  return app;
}
