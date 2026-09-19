import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Brain,
  ChevronRight,
  LayoutDashboard,
  Map,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useEduPath } from "../../context/LearnerContext";
import "./layout.css";

const mainNavigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Skill Gaps", path: "/skill-gaps", icon: Target },
  { label: "My Plan", path: "/learning-plan", icon: Map },
  { label: "Adaptations", path: "/adaptation", icon: Brain },
  { label: "Progress", path: "/progress", icon: BarChart3 },
];

const aiNavigation = [
  { label: "AI Coach", path: "/chat", icon: Sparkles },
  { label: "Settings", path: "/settings", icon: Bot },
];

function NavigationItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-nav-link${isActive ? " is-active" : ""}`
      }
      onClick={onNavigate}
      title={item.label}
    >
      <Icon className="sidebar-nav-icon" aria-hidden="true" />
      <span>{item.label}</span>
      <ChevronRight className="sidebar-nav-chevron" aria-hidden="true" />
    </NavLink>
  );
}

function AgentModeCard({ agentMode }) {
  const isLive = agentMode === "LIVE_AI";
  return (
    <section className="agent-status-card" aria-label="AI mode">
      <div className="agent-status-heading">
        <span className="agent-status-icon" aria-hidden="true">
          <Bot size={16} />
        </span>
        <span>AI Mode</span>
      </div>
      <div className="agent-status-state">
        <span
          className={`agent-status-dot${isLive ? " is-active" : ""}`}
          aria-hidden="true"
        />
        <span>{isLive ? "Live AI" : "Fallback"}</span>
      </div>
      <p>
        {isLive
          ? "Claude generates guidance with plan context."
          : "Using prepared guidance from your plan state."}
      </p>
    </section>
  );
}

function LearnerProfile({ learner }) {
  const initials = (learner.name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="learner-profile">
      <div className="learner-avatar" aria-hidden="true">
        {initials}
      </div>
      <div className="learner-details">
        <strong>{learner.name || "Learner"}</strong>
        <span>{learner.role || "Setting goals"}</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, user, agentMode } = useEduPath();

  // The topbar's menu button lives outside this tree on small screens.
  React.useEffect(() => {
    const open = () => setIsMobileOpen(true);
    window.addEventListener("edupath:open-sidebar", open);
    return () => window.removeEventListener("edupath:open-sidebar", open);
  }, []);

  const closeMobileDrawer = () => setIsMobileOpen(false);
  const learner = {
    name: profile?.name || user?.name || "Learner",
    role: profile?.targetRole || "Target role pending",
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-menu-button"
        aria-label="Open navigation menu"
        aria-controls="edupath-sidebar"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMobileDrawer}
        />
      )}

      <aside
        id="edupath-sidebar"
        className={`sidebar${isMobileOpen ? " is-mobile-open" : ""}`}
        aria-label="EduPath primary navigation"
      >
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <NavLink
              to="/dashboard"
              className="sidebar-logo"
              aria-label="EduPath home"
              onClick={closeMobileDrawer}
            >
              <span className="logo-mark" aria-hidden="true">
                <Sparkles size={18} />
              </span>
              <span className="logo-copy">
                <span className="logo-name">EDUPATH</span>
                <span className="logo-subtitle">Learning Agent</span>
              </span>
            </NavLink>
            <button
              type="button"
              className="sidebar-close-button"
              aria-label="Close navigation menu"
              onClick={closeMobileDrawer}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="sidebar-divider" />

          <nav className="sidebar-navigation">
            <div className="sidebar-section">
              <p className="sidebar-section-label">Main</p>
              <div className="sidebar-nav-list">
                {mainNavigation.map((item) => (
                  <NavigationItem
                    key={item.path}
                    item={item}
                    onNavigate={closeMobileDrawer}
                  />
                ))}
              </div>
            </div>

            <div className="sidebar-section sidebar-ai-section">
              <p className="sidebar-section-label">AI & Account</p>
              <div className="sidebar-nav-list">
                {aiNavigation.map((item) => (
                  <NavigationItem
                    key={item.path}
                    item={item}
                    onNavigate={closeMobileDrawer}
                  />
                ))}
              </div>
            </div>
          </nav>

          <div className="sidebar-lower-content">
            <AgentModeCard agentMode={agentMode} />
            <div className="sidebar-divider" />
            <LearnerProfile learner={learner} />
          </div>
        </div>
      </aside>
    </>
  );
}
