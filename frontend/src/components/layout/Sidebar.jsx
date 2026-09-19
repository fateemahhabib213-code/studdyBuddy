import { NavLink } from "react-router-dom";
import { LayoutGrid, Sparkles, BookOpenCheck, Layers, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/generate", label: "Generate Cards", icon: Sparkles },
  { to: "/review", label: "Review", icon: BookOpenCheck },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden="true">
          <Layers size={17} strokeWidth={2.2} />
        </div>
        <span className="sidebar-brand-name">StudyBuddy</span>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <Icon strokeWidth={2.1} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="#settings" className="sidebar-link" aria-label="Settings">
          <Settings strokeWidth={2.1} />
          Settings
        </a>
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar" aria-hidden="true">S</div>
          <div className="sidebar-profile-text">
            <span className="sidebar-profile-name">Student</span>
            <span className="sidebar-profile-sub">Local account</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
