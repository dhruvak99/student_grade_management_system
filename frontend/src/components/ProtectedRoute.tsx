import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role: "faculty" | "student";
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/login" />;

  return children;
}