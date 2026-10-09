import { Navigate, Outlet } from "react-router-dom";
import { tokenManager, isTokenExpired, getRoleFromToken } from "@/helpers/jwt";

interface ParentProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ParentProtectedRoute({ children }: ParentProtectedRouteProps) {
  const token = tokenManager.getAccessToken();

  if (!token || isTokenExpired(token)) {
    tokenManager.clearAccessToken();
    return <Navigate to="/parent/login" replace />;
  }

  const role = getRoleFromToken(token);

  if (role !== "parent") {
    // If authenticated as a different role, redirect to their respective portal
    if (role === "teacher") {
      return <Navigate to="/teacher/classes" replace />;
    }
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    // Unauthorized user
    tokenManager.clearAccessToken();
    return <Navigate to="/parent/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

