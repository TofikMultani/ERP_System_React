import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredRole } from "../utils/auth.js";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const storedRole = getStoredRole();

  if (!storedRole) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
