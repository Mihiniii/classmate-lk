import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// role dunnoth e role eke users ta witharai; anith aya dashboard ekata
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
