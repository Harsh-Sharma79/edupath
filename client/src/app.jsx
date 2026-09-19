import React from "react";
import { useCallback, useMemo } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
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
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const destinations = Object.freeze({
  "skill-gaps": "/skill-gaps",
  "learning-plan": "/learning-plan",
  adaptations: "/adaptation",
  chat: "/chat",
  progress: "/progress",
});

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    adaptations,
    agentActivities,
    agentStatus,
    chatMessages,
    learner: learnerData,
    nextAction,
    plan,
    progress,
    progressInsights,
    skillGaps,
    skillProgress,
    tasks,
  } = demoData;

  const learner = useMemo(
    () => ({
      ...learnerData,
      initials: getInitials(learnerData.name),
      role: learnerData.targetRole,
    }),
    [learnerData],
  );

  const goTo = useCallback(
    (destination) => navigate(destinations[destination] ?? destination),
    [navigate],
  );

  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <Welcome
            userName={learnerData.name}
            onGetStarted={() => navigate("/dashboard")}
            onExploreDashboard={() => navigate("/dashboard")}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            user={learnerData}
            progress={progress}
            skills={skillProgress}
            nextAction={nextAction}
            agentActivities={agentActivities}
            agentStatus={agentStatus}
            onNavigate={goTo}
          />
        }
      />
      <Route
        path="/skill-gaps"
        element={
          <SkillGaps
            selectedRole={learnerData.targetRole}
            gaps={skillGaps}
            loading={false}
          />
        }
      />
      <Route
        path="/learning-plan"
        element={
          <LearningPlan
            plan={plan}
            tasks={tasks}
            latestAdaptation={adaptations[0]}
            loading={false}
          />
        }
      />
      <Route
        path="/adaptation"
        element={
          <Adaptation
            adaptations={adaptations}
            latestAdaptation={adaptations[0]}
            agentStatus={agentStatus}
            loading={false}
          />
        }
      />
      <Route
        path="/chat"
        element={
          <Chat
            messages={chatMessages}
            loading={false}
            agentStatus={agentStatus}
          />
        }
      />
      <Route
        path="/progress"
        element={
          <Progress
            overallProgress={progress.overallProgress}
            skills={skillProgress}
            tasksCompleted={progress.tasksCompleted}
            totalTasks={progress.totalTasks}
            learningStreak={progress.learningStreak}
            previousProgress={progress.previousProgress}
            nextAction={nextAction}
            insights={progressInsights}
          />
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );

  if (location.pathname === "/") return routes;

  return (
    <div className="app-shell">
      <Sidebar learner={learner} agentStatus={agentStatus} />
      <Topbar learner={learner} agentStatus={agentStatus} />
      <div className="app-content">{routes}</div>
    </div>
  );
}

function App() {
  return (
    <LearnerProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LearnerProvider>
  );
}

export default App;

// If your project uses React Router's data-router APIs, replace BrowserRouter
// with the corresponding router provider without changing AppRoutes.
