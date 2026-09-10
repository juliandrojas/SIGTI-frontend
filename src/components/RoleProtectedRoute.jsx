import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

export default function RoleProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = getUserRole();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect unauthenticated or unauthorized users
    // We could potentially route them to their specific home page, but redirecting to login forces them to re-auth
    // or we can redirect to a "Not authorized" page. 
    // For now, if unauthorized, we can redirect back to login and clear session.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
