import { Navigate, Outlet } from "react-router-dom";
import { tokenManager, isTokenExpired, getRoleFromToken } from "@/helpers/jwt";

interface TeacherProtectedRouteProps {
  children?: React.ReactNode;
}

export default function TeacherProtectedRoute({ children }: TeacherProtectedRouteProps) {
  const token = tokenManager.getAccessToken();

  if (!token || isTokenExpired(token)) {
    tokenManager.clearAccessToken();
    return <Navigate to="/teacher/login" replace />;
  }

  const role = getRoleFromToken(token);

  if (role !== "teacher") {
    // If authenticated as a different role, redirect to their respective portal
    if (role === "parent") {
      return <Navigate to="/parent/home" replace />;
    }
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    // Unauthorized user
    tokenManager.clearAccessToken();
    return <Navigate to="/teacher/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

