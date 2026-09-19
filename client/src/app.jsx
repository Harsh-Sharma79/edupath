import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { EduPathProvider, useEduPath } from "./context/LearnerContext";
import Sidebar from "./components/layout/sidebar";
import Topbar from "./components/layout/topbar";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import SkillGaps from "./pages/SkillGaps";
import LearningPlan from "./pages/LearningPlan";
import Adaptation from "./pages/Adaptation";
import Chat from "./pages/Chat";
import Progress from "./pages/Progress";

function Toast() {
  const { toast } = useEduPath();
  if (!toast) return null;

  const toneClass =
    toast.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : toast.tone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-indigo-200 bg-indigo-50 text-indigo-800";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className={`pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toneClass}`}>
        {toast.message}
      </div>
    </div>
  );
}

function BootScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="animate-pulse text-sm font-medium text-slate-500">Loading EduPath…</div>
    </main>
  );
}

function AppRoutes() {
  const { user, authReady, profile, loadDemo, login, signup, loading } = useEduPath();
  const location = useLocation();

  if (!authReady) return <BootScreen />;

  if (!user) {
    if (location.pathname === "/") {
      return (
        <Welcome
          userName="Aditi"
          onGetStarted={loadDemo}
          onExploreDashboard={loadDemo}
          onLogin={login}
          onSignup={signup}
          onLoadDemo={loadDemo}
          loading={loading}
        />
      );
    }
    return (
      <Login
        onLoadDemo={loadDemo}
        onLogin={login}
        onSignup={signup}
        loading={loading}
      />
    );
  }

  // Signed in but no profile yet: guide the learner through setup first.
  if (!profile && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  // Profile exists (e.g. demo just loaded): setup screen has done its job.
  if (profile && location.pathname === "/profile-setup") {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname === "/profile-setup") {
    return (
      <>
        <ProfilePage setupMode />
        <Toast />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar />
      <div className="app-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skill-gaps" element={<SkillGaps />} />
          <Route path="/learning-plan" element={<LearningPlan />} />
          <Route path="/adaptation" element={<Adaptation />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <EduPathProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </EduPathProvider>
  );
}

export default App;
