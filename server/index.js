import { db, initializeSchema } from "./db/database.js";
import { seedDatabase } from "./db/seed.js";
import { createApp } from "./app.js";
import { buildApiRouter, agentMode } from "./routes/index.js";
import { config } from "./config.js";

initializeSchema();

// First boot on a fresh database: make the demo usable immediately.
const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
if (count === 0) {
  seedDatabase();
  console.log("Fresh database detected — Aditi demo seeded.");
}

const app = createApp({ apiRouter: buildApiRouter(), agentMode });

app.listen(config.port, () => {
  console.log(`EduPath server listening on http://localhost:${config.port}`);
  console.log(`Agent mode: ${agentMode()}`);
});
