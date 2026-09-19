import { NavLink } from "react-router-dom";
import { LayoutGrid, Sparkles, BookOpenCheck, Layers } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: LayoutGrid, end: true },
  { to: "/generate", label: "Generate", icon: Sparkles },
  { to: "/review", label: "Review", icon: BookOpenCheck },
  { to: "/flashcards", label: "Cards", icon: Layers },
];

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Primary">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            "mobile-nav-link" + (isActive ? " active" : "")
          }
        >
          <Icon strokeWidth={2.2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
