import {
  Boxes,
  BriefcaseBusiness,
  CircleUserRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  clearStoredRole,
  getStoredRole,
  ROLE_ALLOWED_PATHS,
} from "../utils/auth.js";
import { getStoredProfile, PROFILE_UPDATED_EVENT } from "../utils/profile.js";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/admin",
    category: "main",
    icon: LayoutDashboard,
  },
  { label: "HR", path: "/hr", category: "modules", icon: BriefcaseBusiness },
  { label: "Sales", path: "/sales", category: "modules", icon: ShoppingCart },
  { label: "Inventory", path: "/inventory", category: "modules", icon: Boxes },
  { label: "Finance", path: "/finance", category: "modules", icon: Wallet },
  {
    label: "Customer Support",
    path: "/support",
    category: "modules",
    icon: LifeBuoy,
  },
  { label: "IT", path: "/it", category: "modules", icon: Wrench },
  {
    label: "Profile",
    path: "/profile",
    category: "user",
    icon: CircleUserRound,
  },
  { label: "Settings", path: "/settings", category: "user", icon: Settings },
];

function Sidebar() {
  const navigate = useNavigate();
  const userRole = getStoredRole() || "admin";
  const allowedPaths = ROLE_ALLOWED_PATHS[userRole] || [];
  const [, setProfileVersion] = useState(0);
  const profile = getStoredProfile(userRole);

  useEffect(() => {
    function handleProfileUpdate() {
      setProfileVersion((value) => value + 1);
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
  }, [userRole]);

  // Filter navigation items based on role access
  const filteredItems = navigationItems.filter((item) =>
    allowedPaths.includes(item.path),
  );

  // Group items by category
  const groupedItems = {
    main: filteredItems.filter((item) => item.category === "main"),
    modules: filteredItems.filter((item) => item.category === "modules"),
    user: filteredItems.filter((item) => item.category === "user"),
  };

  function handleLogout() {
    clearStoredRole();
    navigate("/", { replace: true });
  }

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar__brand sidebar__brand-button"
        onClick={() => navigate("/profile")}
      >
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">📊</div>
          <div>
            <div className="sidebar__logo-text">ERP System</div>
            <div className="sidebar__logo-sub">{profile.name}</div>
            <div className="sidebar__logo-meta">{userRole.toUpperCase()}</div>
          </div>
        </div>
      </button>

      <nav className="sidebar__nav" aria-label="ERP navigation">
        {/* Main Navigation */}
        {groupedItems.main.length > 0 && (
          <div className="sidebar__section">
            {groupedItems.main.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
              >
                <item.icon className="sidebar__link-icon" strokeWidth={1.9} />
                <span className="sidebar__link-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* Modules Section */}
        {groupedItems.modules.length > 0 && (
          <div className="sidebar__section">
            <div className="sidebar__section-title">Modules</div>
            {groupedItems.modules.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
              >
                <item.icon className="sidebar__link-icon" strokeWidth={1.9} />
                <span className="sidebar__link-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* User Section */}
        {groupedItems.user.length > 0 && (
          <div className="sidebar__section sidebar__section--user">
            {groupedItems.user.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
              >
                <item.icon className="sidebar__link-icon" strokeWidth={1.9} />
                <span className="sidebar__link-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <button type="button" className="sidebar__logout" onClick={handleLogout}>
        <LogOut className="sidebar__link-icon" strokeWidth={1.9} />
        <span className="sidebar__link-text">Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
