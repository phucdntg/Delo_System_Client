import { Navigate } from "react-router-dom";
import { PATH } from "../../../shared/constants/systemConstants";
import { useAuth } from "../../providers/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to={PATH.AUTH} replace />;

  return children;
}
