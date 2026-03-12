import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowAccess = true, children }) {
  const location = useLocation();

  if (!allowAccess) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
