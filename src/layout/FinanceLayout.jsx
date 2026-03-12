import { NavLink, Outlet } from "react-router-dom";

function FinanceLayout() {
  return (
    <div className="finance-shell">
      <div className="finance-subnav">
        <div className="finance-subnav__label">Finance</div>
        <nav>
          <NavLink
            to="/finance"
            end
            className={({ isActive }) =>
              `finance-subnav__link ${isActive ? "finance-subnav__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/finance/invoices"
            className={({ isActive }) =>
              `finance-subnav__link ${isActive ? "finance-subnav__link--active" : ""}`
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/finance/expenses"
            className={({ isActive }) =>
              `finance-subnav__link ${isActive ? "finance-subnav__link--active" : ""}`
            }
          >
            Expenses
          </NavLink>
          <NavLink
            to="/finance/payments"
            className={({ isActive }) =>
              `finance-subnav__link ${isActive ? "finance-subnav__link--active" : ""}`
            }
          >
            Payments
          </NavLink>
          <NavLink
            to="/finance/reports"
            className={({ isActive }) =>
              `finance-subnav__link ${isActive ? "finance-subnav__link--active" : ""}`
            }
          >
            Reports
          </NavLink>
        </nav>
      </div>
      <div className="finance-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default FinanceLayout;
