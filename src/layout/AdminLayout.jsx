import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

function getModuleMeta(pathname) {
  const currentModule = pathname.split("/")[1] || "admin";
  const label = currentModule === "it" ? "IT" : currentModule;

  return {
    title: label.charAt(0).toUpperCase() + label.slice(1),
    description:
      "Static ERP dashboard layout with routing-only module placeholders.",
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
