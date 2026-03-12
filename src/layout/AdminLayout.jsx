import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

function getModuleMeta(pathname) {
  const currentModule = pathname.split("/")[1] || "admin";

  const labels = {
    admin: "Dashboard",
    hr: "HR",
    sales: "Sales",
    inventory: "Inventory",
    finance: "Finance",
    support: "Customer Support",
    it: "IT",
    profile: "Profile",
    settings: "Settings",
  };

  const descriptions = {
    admin:
      "Track company-wide metrics, orders, people, and operational health.",
    hr: "Manage workforce operations, attendance, payroll, and talent programs.",
    sales: "Review pipeline, customers, orders, quotations, and collections.",
    inventory: "Control products, warehouses, stock levels, and suppliers.",
    finance: "Monitor invoices, expenses, payouts, and business cash flow.",
    support: "Supervise tickets, assignment queues, and response performance.",
    it: "Oversee systems, assets, maintenance schedules, and uptime.",
    profile: "Review account identity, role, and contact information.",
    settings: "Configure currency, language, and dashboard preferences.",
  };

  return {
    title: labels[currentModule] ?? "Dashboard",
    description: descriptions[currentModule] ?? descriptions.admin,
  };
}

function AdminLayout() {
  const location = useLocation();
  const meta = getModuleMeta(location.pathname);

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-shell__content">
        <Topbar title={meta.title} description={meta.description} />
        <main className="admin-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
