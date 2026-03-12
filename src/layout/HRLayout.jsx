import { NavLink, Outlet } from "react-router-dom";

const hrNav = [
  { label: "Dashboard", path: "/hr" },
  { label: "Employees", path: "/hr/employees" },
  { label: "Departments", path: "/hr/departments" },
  { label: "Attendance", path: "/hr/attendance" },
  { label: "Leave", path: "/hr/leave" },
  { label: "Payroll", path: "/hr/payroll" },
  { label: "Recruitment", path: "/hr/recruitment" },
  { label: "Performance", path: "/hr/performance" },
  { label: "Documents", path: "/hr/documents" },
  { label: "Training", path: "/hr/training" },
  { label: "Reports", path: "/hr/reports" },
];

function HRLayout() {
  return (
    <div className="hr-shell">
      <aside className="hr-subnav">
        <p className="hr-subnav__label">HR Module</p>
        <nav>
          {hrNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/hr"}
              className={({ isActive }) =>
                isActive
                  ? "hr-subnav__link hr-subnav__link--active"
                  : "hr-subnav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="hr-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default HRLayout;
