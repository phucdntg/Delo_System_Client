// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../providers/AuthProvider';

// export default function RoleGate({ children, requiredRole = 'user', fallbackTo = '/' }) {
//   const { user } = useAuth();

//   if (user?.roleName !== requiredRole) {
//     return <Navigate to={fallbackTo} replace />;
//   }

//   return children;
// }

export default function RoleGate({
  children,
  requiredRole = "user",
  fallbackTo = "/",
}) {
  return children;
}
