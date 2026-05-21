export default function ProtectedRoute({ children }) {
  //   const { isAuthenticated, loading } = useAuth();

  //   if (loading) {
  //     return <div>Loading...</div>;
  //   }

  //   if (!isAuthenticated) {
  //     return <Navigate to="/login" replace />;
  //   }

  return children;
}
