import { NavLink, useNavigate } from "react-router-dom";
import { clearStoredRole } from "../utils/auth.js";

const navigationItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "HR", path: "/hr" },
  { label: "Sales", path: "/sales" },
  { label: "Inventory", path: "/inventory" },
  { label: "Finance", path: "/finance" },
  { label: "Customer Support", path: "/support" },
  { label: "IT", path: "/it" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearStoredRole();
    navigate("/", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__eyebrow">ERP System</span>
        <h1>Control Panel</h1>
        <p>Reusable dashboard layout for all ERP modules.</p>
      </div>

      <nav className="sidebar__nav" aria-label="ERP navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar__logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
