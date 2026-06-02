import { useAuth } from "@core/providers/auth";
import { PATH } from "@shared/constants/systemConstants";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to={PATH.AUTH} replace />;

  return children;
}
