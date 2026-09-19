import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { LearnerProvider } from "./context/LearnerContext";
import { demoData } from "./data/demoData";
import Adaptation from "./pages/Adaptation";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import LearningPlan from "./pages/LearningPlan";
import Progress from "./pages/Progress";
import SkillGaps from "./pages/SkillGaps";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <LearnerProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Welcome userName={demoData.learner.name} />}
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                user={demoData.learner}
                progress={demoData.progress}
                skills={demoData.skillProgress}
                nextAction={demoData.nextAction}
                agentActivities={demoData.agentActivities}
                agentStatus={demoData.agentStatus}
              />
            }
          />
          <Route
            path="/skill-gaps"
            element={
              <SkillGaps
                selectedRole={demoData.learner.targetRole}
                gaps={demoData.skillGaps}
                loading={false}
              />
            }
          />
          <Route
            path="/learning-plan"
            element={
              <LearningPlan
                plan={demoData.plan}
                tasks={demoData.tasks}
                latestAdaptation={demoData.adaptations[0]}
                loading={false}
              />
            }
          />
          <Route
            path="/adaptation"
            element={
              <Adaptation
                adaptations={demoData.adaptations}
                latestAdaptation={demoData.adaptations[0]}
                agentStatus={demoData.agentStatus}
                loading={false}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <Chat
                messages={demoData.chatMessages}
                loading={false}
                agentStatus={demoData.agentStatus}
              />
            }
          />
          <Route
            path="/progress"
            element={
              <Progress
                overallProgress={demoData.progress.overallProgress}
                skills={demoData.skillProgress}
                tasksCompleted={demoData.progress.tasksCompleted}
                totalTasks={demoData.progress.totalTasks}
                learningStreak={demoData.progress.learningStreak}
                previousProgress={demoData.progress.previousProgress}
                nextAction={demoData.nextAction}
                insights={demoData.progressInsights}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LearnerProvider>
  );
}

export default App;
