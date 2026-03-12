import { NavLink, Outlet } from "react-router-dom";

const supportNav = [
  { label: "Dashboard", path: "/support" },
  { label: "Tickets", path: "/support/tickets" },
  { label: "Assign Ticket", path: "/support/assign-ticket" },
  { label: "Reports", path: "/support/reports" },
];

function SupportLayout() {
  return (
    <div className="support-shell">
      <aside className="support-subnav">
        <p className="support-subnav__label">Support Module</p>
        <nav>
          {supportNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/support"}
              className={({ isActive }) =>
                isActive
                  ? "support-subnav__link support-subnav__link--active"
                  : "support-subnav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="support-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default SupportLayout;
