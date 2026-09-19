import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

/**
 * Top-level shell: sidebar on desktop, bottom nav on mobile (handled purely
 * via CSS media queries so there's no layout flash on resize), with the
 * active page rendered through React Router's <Outlet />.
 */
function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <div className="app-main-inner">
          <Outlet />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

export default AppLayout;
