import { Navigate, Outlet } from "react-router-dom";
import { tokenManager, isTokenExpired, getRoleFromToken } from "@/helpers/jwt";

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = tokenManager.getAccessToken();

  if (!token || isTokenExpired(token)) {
    tokenManager.clearAccessToken();
    return <Navigate to="/admin/login" replace />;
  }

  const role = getRoleFromToken(token);

  if (role !== "admin") {
    // If authenticated as a different role, redirect to their respective portal
    if (role === "teacher") {
      return <Navigate to="/teacher/classes" replace />;
    }
    if (role === "parent") {
      return <Navigate to="/parent/home" replace />;
    }
    // Unauthorized user
    tokenManager.clearAccessToken();
    return <Navigate to="/admin/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
