import { NavLink, Outlet } from "react-router-dom";

function SalesLayout() {
  return (
    <div className="sales-shell">
      <div className="sales-subnav">
        <div className="sales-subnav__label">Sales</div>
        <nav>
          <NavLink
            to="/sales"
            end
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/sales/customers"
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Customers
          </NavLink>
          <NavLink
            to="/sales/orders"
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Orders
          </NavLink>
          <NavLink
            to="/sales/invoices"
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/sales/quotations"
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Quotations
          </NavLink>
          <NavLink
            to="/sales/reports"
            className={({ isActive }) =>
              `sales-subnav__link ${isActive ? "sales-subnav__link--active" : ""}`
            }
          >
            Reports
          </NavLink>
        </nav>
      </div>
      <div className="sales-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default SalesLayout;
