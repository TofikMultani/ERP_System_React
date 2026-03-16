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
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredRole,
  getStoredRole,
  ROLE_ALLOWED_PATHS,
} from "../utils/auth.js";
import { getStoredProfile, PROFILE_UPDATED_EVENT } from "../utils/profile.js";

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

const moduleChildNavigation = {
  "/hr": [
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
  ],
  "/sales": [
    { label: "Dashboard", path: "/sales" },
    { label: "Customers", path: "/sales/customers" },
    { label: "Orders", path: "/sales/orders" },
    { label: "Invoices", path: "/sales/invoices" },
    { label: "Quotations", path: "/sales/quotations" },
    { label: "Reports", path: "/sales/reports" },
  ],
  "/inventory": [
    { label: "Products", path: "/inventory" },
    { label: "Categories", path: "/inventory/categories" },
    { label: "Stock", path: "/inventory/stock" },
    { label: "Suppliers", path: "/inventory/suppliers" },
    { label: "Warehouses", path: "/inventory/warehouses" },
    { label: "Purchase Orders", path: "/inventory/purchase-orders" },
    { label: "Adjustments", path: "/inventory/adjustments" },
    { label: "Reports", path: "/inventory/reports" },
  ],
  "/finance": [
    { label: "Dashboard", path: "/finance" },
    { label: "Invoices", path: "/finance/invoices" },
    { label: "Expenses", path: "/finance/expenses" },
    { label: "Payments", path: "/finance/payments" },
    { label: "Reports", path: "/finance/reports" },
  ],
  "/it": [
    { label: "Dashboard", path: "/it" },
    { label: "Systems", path: "/it/systems" },
    { label: "Assets", path: "/it/assets" },
    { label: "Maintenance", path: "/it/maintenance" },
    { label: "Reports", path: "/it/reports" },
  ],
  "/support": [
    { label: "Dashboard", path: "/support" },
    { label: "Tickets", path: "/support/tickets" },
    { label: "Assign Ticket", path: "/support/assign-ticket" },
    { label: "Reports", path: "/support/reports" },
  ],
};

function isSectionActive(pathname, basePath) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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

  const filteredItems = navigationItems.filter((item) =>
    allowedPaths.includes(item.path),
  );

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

        {groupedItems.modules.length > 0 && (
          <div className="sidebar__section">
            <div className="sidebar__section-title">Modules</div>
            {groupedItems.modules.map((item) => {
              const showChildren = isSectionActive(pathname, item.path);
              const childLinks = moduleChildNavigation[item.path] || [];

              return (
                <div key={item.path} className="sidebar__module-group">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? "sidebar__link sidebar__link--active"
                        : "sidebar__link"
                    }
                  >
                    <item.icon
                      className="sidebar__link-icon"
                      strokeWidth={1.9}
                    />
                    <span className="sidebar__link-text">{item.label}</span>
                  </NavLink>

                  {showChildren && childLinks.length > 0 && (
                    <div
                      className="sidebar__subnav"
                      aria-label={`${item.label} links`}
                    >
                      {childLinks.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end={child.path === item.path}
                          className={({ isActive }) =>
                            isActive
                              ? "sidebar__sublink sidebar__sublink--active"
                              : "sidebar__sublink"
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
