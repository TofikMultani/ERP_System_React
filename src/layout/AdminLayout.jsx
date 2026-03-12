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

  return {
    title: labels[currentModule] ?? "Dashboard",
    description:
      "Reusable ERP dashboard layout with shared navigation and content shell.",
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
