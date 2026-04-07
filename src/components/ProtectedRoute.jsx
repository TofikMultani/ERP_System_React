import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  getAllowedPathsForRole,
  getStoredRole,
  getRouteForRole,
} from "../utils/auth.js";

/**
 * Guards all child routes.
 *
 * - No role stored  → redirect to / (login).
 * - Role exists but path is not in ROLE_ALLOWED_PATHS[role]
 *   → redirect to the role's own home route.
 * - Allowed          → render children / Outlet.
 *
 * Access matrix:
 *   admin     → all routes
 *   hr        → /hr, /profile, /settings
 *   sales     → /sales, /profile, /settings
 *   inventory → /inventory, /profile, /settings
 *   finance   → /finance, /profile, /settings
 *   support   → /support, /profile, /settings
 *   it        → /it, /profile, /settings
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const role = getStoredRole();

  // Not authenticated → back to login
  if (!role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowedPaths = getAllowedPathsForRole(role);
  const isAllowed = allowedPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  // Authenticated but not permitted on this path → own home route
  if (!isAllowed) {
    return <Navigate to={getRouteForRole(role)} replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
