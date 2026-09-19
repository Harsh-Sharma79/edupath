import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  ChevronDown,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useEduPath } from "../../context/LearnerContext";
import "./layout.css";

const pageConfig = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Your personalized learning command center",
  },
  "/skill-gaps": {
    title: "Skill Gaps",
    subtitle: "See what is blocking your target role",
  },
  "/learning-plan": {
    title: "My Learning Plan",
    subtitle: "Your adaptive weekly roadmap",
  },
  "/progress": {
    title: "Progress",
    subtitle: "See how your learning is evolving",
  },
  "/adaptation": {
    title: "Adaptations",
    subtitle: "See how your learning plan is evolving",
  },
  "/chat": {
    title: "Ask EduPath",
    subtitle: "Talk to your learning agent",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Update your learner profile",
  },
};

const defaultPage = {
  title: "EduPath",
  subtitle: "Your personalized learning workspace",
};

function PageContext({ page }) {
  return (
    <div className="topbar-page-context">
      <h1>{page.title}</h1>
      <p>{page.subtitle}</p>
    </div>
  );
}

function AgentStatus() {
  return (
    <div className="topbar-agent-status is-active" role="status" aria-label="Agent Active">
      <span className="topbar-agent-icon" aria-hidden="true">
        <Bot size={15} />
      </span>
      <span className="topbar-agent-dot" aria-hidden="true" />
      <span className="topbar-agent-label">Agent Active</span>
    </div>
  );
}

function ProfileDropdown({
  learner,
  isOpen,
  onToggle,
  onSettingsClick,
  onLogout,
  agentMode,
}) {
  return (
    <div className="topbar-profile-wrapper">
      <button
        type="button"
        className="topbar-profile-trigger"
        aria-label={`Open profile menu for ${learner.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          onSettingsClick();
          onToggle();
        }}
      >
        <span className="topbar-avatar" aria-hidden="true">
          {learner.initials}
        </span>
        <span className="topbar-profile-copy">
          <strong>{learner.name}</strong>
          <span>{learner.role}</span>
        </span>
        <ChevronDown
          className={`topbar-profile-chevron${isOpen ? " is-open" : ""}`}
          size={16}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="topbar-profile-dropdown" role="menu" aria-label="Profile menu">
          <div className="topbar-dropdown-mode">
            <span className="topbar-dropdown-mode-label">AI Mode</span>
            <span
              className={`topbar-dropdown-mode-value ${agentMode === "LIVE_AI" ? "is-live" : ""}`}
            >
              {agentMode === "LIVE_AI" ? "Live AI" : "Fallback"}
            </span>
          </div>
          <div className="topbar-dropdown-divider" />
          <button type="button" role="menuitem" onClick={onSettingsClick}>
            <UserRound size={16} aria-hidden="true" />
            Profile
          </button>
          <button type="button" role="menuitem" onClick={onSettingsClick}>
            <Settings size={16} aria-hidden="true" />
            Settings
          </button>
          <div className="topbar-dropdown-divider" />
          <button
            type="button"
            className="is-danger"
            role="menuitem"
            onClick={onLogout}
          >
            <X size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, agentMode, logout } = useEduPath();
  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const page = pageConfig[location.pathname] || defaultPage;
  const learner = {
    name: profile?.name || user?.name || "Learner",
    role: profile?.targetRole || "Target role pending",
    initials: (profile?.name || user?.name || "L")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-icon-button topbar-menu-button"
          aria-label="Open navigation"
          onClick={() => window.dispatchEvent(new CustomEvent("edupath:open-sidebar"))}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <PageContext page={page} />
      </div>

      <div className="topbar-actions">
        <AgentStatus />
        <div ref={profileRef}>
          <ProfileDropdown
            learner={learner}
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen((open) => !open)}
            onSettingsClick={() => navigate("/settings")}
            onLogout={logout}
            agentMode={agentMode}
          />
        </div>
      </div>
    </header>
  );
}
