import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role: "admin" | "faculty" | "student";
}) {
  const { user, loading } = useAuth();

  // ⏳ wait until auth restore completes
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;

  return children;
}