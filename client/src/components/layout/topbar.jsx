import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  Bot,
  ChevronDown,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import "./layout.css";

const pageConfig = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Your personalized learning command center",
  },
  "/skills": {
    title: "My Skills",
    subtitle: "Track your current capabilities",
  },
  "/gaps": {
    title: "Skill Gaps",
    subtitle: "See what is blocking your target role",
  },
  "/plan": {
    title: "My Learning Plan",
    subtitle: "Your adaptive weekly roadmap",
  },
  "/progress": {
    title: "Progress",
    subtitle: "See how your learning is evolving",
  },
  "/chat": {
    title: "Ask EduPath",
    subtitle: "Talk to your learning agent",
  },
};

const defaultLearner = {
  name: "Aditi",
  role: "Data Analyst",
  initials: "AS",
};

const defaultPage = {
  title: "EduPath",
  subtitle: "Your personalized learning workspace",
};

function MobileMenuButton({ onMenuClick }) {
  return (
    <button
      type="button"
      className="topbar-icon-button topbar-menu-button"
      aria-label="Open navigation"
      onClick={onMenuClick}
    >
      <Menu size={20} aria-hidden="true" />
    </button>
  );
}

function PageContext({ page }) {
  return (
    <div className="topbar-page-context">
      <h1>{page.title}</h1>
      <p>{page.subtitle}</p>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <label className="topbar-search" aria-label="Search your learning">
      <Search className="topbar-search-icon" size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search your learning..."
        aria-label="Search your learning"
      />
    </label>
  );
}

const agentStatusConfig = {
  active: { label: "Agent Active", icon: Bot },
  thinking: { label: "Agent Thinking...", icon: Sparkles },
  offline: { label: "Agent Offline", icon: Bot },
};

function AgentStatus({ status }) {
  const normalizedStatus = agentStatusConfig[status]
    ? status
    : "active";
  const { label, icon: Icon } = agentStatusConfig[normalizedStatus];

  return (
    <div
      className={`topbar-agent-status is-${normalizedStatus}`}
      role="status"
      aria-label={label}
    >
      <span className="topbar-agent-icon" aria-hidden="true">
        <Icon size={15} />
      </span>
      <span className="topbar-agent-dot" aria-hidden="true" />
      <span className="topbar-agent-label">{label}</span>
    </div>
  );
}

function NotificationButton({ hasNotifications, onNotificationClick }) {
  return (
    <button
      type="button"
      className="topbar-icon-button topbar-notification-button"
      aria-label={hasNotifications ? "View notifications" : "Notifications"}
      onClick={onNotificationClick}
    >
      <Bell size={18} aria-hidden="true" />
      {hasNotifications && <span className="notification-dot" aria-hidden="true" />}
    </button>
  );
}

function ProfileDropdown({
  learner,
  isOpen,
  onToggle,
  onProfileClick,
  onSettingsClick,
  onLogout,
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
          onProfileClick();
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
          <button type="button" role="menuitem" onClick={onProfileClick}>
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

export default function Topbar({
  learner = defaultLearner,
  agentStatus = "active",
  hasNotifications = false,
  onMenuClick = () => {},
  onSearch = () => {},
  onNotificationClick = () => {},
  onProfileClick = () => {},
  onSettingsClick = () => {},
  onLogout = () => {},
  searchValue,
}) {
  const location = useLocation();
  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const page = pageConfig[location.pathname] || defaultPage;
  const resolvedLearner = { ...defaultLearner, ...learner };
  const currentSearchValue = searchValue ?? internalSearchValue;

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

  const handleSearchChange = (value) => {
    if (searchValue === undefined) {
      setInternalSearchValue(value);
    }
    onSearch(value);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <MobileMenuButton onMenuClick={onMenuClick} />
        <PageContext page={page} />
      </div>

      <div className="topbar-actions">
        <SearchBar value={currentSearchValue} onChange={handleSearchChange} />
        <AgentStatus status={agentStatus} />
        <NotificationButton
          hasNotifications={hasNotifications}
          onNotificationClick={onNotificationClick}
        />
        <div ref={profileRef}>
          <ProfileDropdown
            learner={resolvedLearner}
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen((open) => !open)}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
