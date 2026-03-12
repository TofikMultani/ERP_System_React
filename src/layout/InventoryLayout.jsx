import { NavLink, Outlet } from "react-router-dom";

const inventoryNav = [
  { label: "Products", path: "/inventory" },
  { label: "Categories", path: "/inventory/categories" },
  { label: "Stock", path: "/inventory/stock" },
  { label: "Suppliers", path: "/inventory/suppliers" },
  { label: "Warehouses", path: "/inventory/warehouses" },
  { label: "Purchase Orders", path: "/inventory/purchase-orders" },
  { label: "Adjustments", path: "/inventory/adjustments" },
  { label: "Reports", path: "/inventory/reports" },
];

function InventoryLayout() {
  return (
    <div className="inv-shell">
      <aside className="inv-subnav">
        <p className="inv-subnav__label">Inventory Module</p>
        <nav>
          {inventoryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/inventory"}
              className={({ isActive }) =>
                isActive
                  ? "inv-subnav__link inv-subnav__link--active"
                  : "inv-subnav__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="inv-shell__content">
        <Outlet />
      </div>
    </div>
  );
}

export default InventoryLayout;
