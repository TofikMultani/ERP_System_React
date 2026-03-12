import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Admin", path: "/admin" },
  { label: "HR", path: "/hr" },
  { label: "Sales", path: "/sales" },
  { label: "Inventory", path: "/inventory" },
  { label: "Finance", path: "/finance" },
  { label: "Support", path: "/support" },
  { label: "IT", path: "/it" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__eyebrow">ERP System</span>
        <h1>Workspace</h1>
        <p>Static module navigation and layout shell.</p>
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
    </aside>
  );
}

export default Sidebar;
