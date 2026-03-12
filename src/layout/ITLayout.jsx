import { NavLink, Outlet } from "react-router-dom";

function ITLayout() {
  return (
    <div className="it-shell">
      <div className="it-subnav">
        <div className="it-subnav__label">IT Operations</div>
        <nav>
          <NavLink
            to="/it"
            end
            className={({ isActive }) =>
              `it-subnav__link ${isActive ? "it-subnav__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/it/systems"
            className={({ isActive }) =>
              `it-subnav__link ${isActive ? "it-subnav__link--active" : ""}`
            }
          >
            Systems
          </NavLink>
          <NavLink
            to="/it/assets"
            className={({ isActive }) =>
              `it-subnav__link ${isActive ? "it-subnav__link--active" : ""}`
            }
          >
            Assets
          </NavLink>
          <NavLink
            to="/it/maintenance"
            className={({ isActive }) =>
              `it-subnav__link ${isActive ? "it-subnav__link--active" : ""}`
            }
          >
            Maintenance
          </NavLink>
          <NavLink
            to="/it/reports"
            className={({ isActive }) =>
              `it-subnav__link ${isActive ? "it-subnav__link--active" : ""}`
            }
          >
            Reports
          </NavLink>
        </nav>
      </div>
      <div className="it-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default ITLayout;
