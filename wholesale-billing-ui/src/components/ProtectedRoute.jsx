import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const rawRoles = Array.isArray(user?.roles)
        ? user.roles
        : user?.roles
        ? Array.from(user.roles)
        : [];
      const roles = rawRoles.map((r) => (typeof r === "string" ? r.replace(/^ROLE_/, "") : r));
      const hasAccess = roles.some((r) => allowedRoles.includes(r));
      if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
      }
    } catch {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
