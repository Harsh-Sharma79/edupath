import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  Brain,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Map,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import "./layout.css";

const mainNavigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Skills", path: "/skills", icon: Brain },
  { label: "Skill Gaps", path: "/gaps", icon: Target },
  { label: "My Plan", path: "/plan", icon: Map },
  { label: "Progress", path: "/progress", icon: BarChart3 },
];

const aiNavigation = [
  { label: "Ask EduPath", path: "/chat", icon: Sparkles },
];

const defaultLearner = {
  name: "Aditi",
  role: "Data Analyst",
};

function NavigationItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/dashboard"}
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

function AgentStatus({ status }) {
  const isActive = status === "active";
  const statusLabel = isActive ? "Active" : "Paused";
  const statusMessage = isActive
    ? "Observing your progress"
    : "Agent observation paused";

  return (
    <section className="agent-status-card" aria-label="EduPath agent status">
      <div className="agent-status-heading">
        <span className="agent-status-icon" aria-hidden="true">
          <Bot size={16} />
        </span>
        <span>EduPath Agent</span>
      </div>
      <div className="agent-status-state">
        <span
          className={`agent-status-dot${isActive ? " is-active" : ""}`}
          aria-hidden="true"
        />
        <span>{statusLabel}</span>
      </div>
      <p>{statusMessage}</p>
    </section>
  );
}

function LearnerProfile({ learner }) {
  const initials = learner.name
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
        <strong>{learner.name}</strong>
        <span>{learner.role}</span>
      </div>
    </div>
  );
}

export default function Sidebar({ learner = defaultLearner, agentStatus = "active" }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileDrawer = () => setIsMobileOpen(false);

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
                <span className="logo-subtitle">AI Learning Agent</span>
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
              <p className="sidebar-section-label">AI</p>
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
            <AgentStatus status={agentStatus} />
            <div className="sidebar-divider" />
            <LearnerProfile learner={{ ...defaultLearner, ...learner }} />
          </div>
        </div>
      </aside>
    </>
  );
}
