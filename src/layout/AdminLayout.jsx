import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

function getModuleMeta(pathname) {
  if (pathname.startsWith("/root-admin/requests")) {
    return {
      title: "Requests Management",
      description:
        "Review landing page workspace requests and approve or reject them.",
    };
  }

  if (pathname.startsWith("/root-admin/modules")) {
    return {
      title: "Module Configuration",
      description:
        "Activate or deactivate modules and manage per-module pricing for approvals.",
    };
  }

  if (pathname.startsWith("/root-admin/payments")) {
    return {
      title: "Payment Provisioning",
      description:
        "Review completed payments and generate login credentials for paid customers.",
    };
  }

  if (pathname.startsWith("/my-users")) {
    return {
      title: "My Users",
      description:
        "Create, update, and delete sub-users for the modules allocated to your account.",
    };
  }

  const currentModule = pathname.split("/")[1] || "admin";

  const labels = {
    admin: "Dashboard",
    "root-admin": "Root Admin",
    hr: "HR",
    sales: "Sales",
    inventory: "Inventory",
    finance: "Finance",
    support: "Customer Support",
    it: "IT",
    profile: "Profile",
    settings: "Settings",
    "my-users": "My Users",
  };

  const descriptions = {
    admin:
      "Track company-wide metrics, orders, people, and operational health.",
    "root-admin":
      "Review landing-page access requests and approve or reject requested modules.",
    hr: "Manage workforce operations, attendance, payroll, and talent programs.",
    sales: "Review pipeline, customers, orders, quotations, and collections.",
    inventory: "Control products, warehouses, stock levels, and suppliers.",
    finance: "Monitor invoices, expenses, payouts, and business cash flow.",
    support: "Supervise tickets, assignment queues, and response performance.",
    it: "Oversee systems, assets, maintenance schedules, and uptime.",
    profile: "Review account identity, role, and contact information.",
    settings: "Configure currency, language, and dashboard preferences.",
    "my-users": "Manage sub-users assigned to your requested modules.",
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
