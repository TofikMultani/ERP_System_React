import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import ModuleLayout from "../layout/ModuleLayout.jsx";
import Login from "../pages/login/Login.jsx";

const modules = [
  {
    key: "admin",
    title: "Admin Dashboard",
    description:
      "Overview of organization-wide activity, approvals, and pending actions.",
  },
  {
    key: "hr",
    title: "HR Module",
    description:
      "Employee lifecycle, attendance, and hiring workflows will live here.",
  },
  {
    key: "sales",
    title: "Sales Module",
    description:
      "Lead tracking, order flow, and revenue snapshots will be routed here.",
  },
  {
    key: "inventory",
    title: "Inventory Module",
    description:
      "Stock visibility, warehouse movement, and reorder planning placeholder.",
  },
  {
    key: "finance",
    title: "Finance Module",
    description:
      "Budgets, expenses, and payment monitoring will be surfaced here.",
  },
  {
    key: "support",
    title: "Support Module",
    description:
      "Tickets, SLAs, and service workflows are reserved for this route.",
  },
  {
    key: "it",
    title: "IT Module",
    description:
      "Assets, access requests, and infrastructure operations placeholder.",
  },
  {
    key: "profile",
    title: "Profile",
    description: "Personal information and activity summary route shell.",
  },
  {
    key: "settings",
    title: "Settings",
    description: "Application settings and preferences route shell.",
  },
];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {modules.map((module) => (
            <Route
              key={module.key}
              path={`/${module.key}`}
              element={
                <ModuleLayout
                  moduleKey={module.key}
                  title={module.title}
                  description={module.description}
                />
              }
            />
          ))}
        </Route>
      </Route>

      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
