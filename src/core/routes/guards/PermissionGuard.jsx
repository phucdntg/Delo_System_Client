// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../providers/AuthProvider';
// import appRoutes from '../AppRoutes';

// const normalizePermissions = (permissions) =>
//   Array.isArray(permissions) ? permissions : permissions ? [permissions] : [];

// const getFirstAccessiblePath = (user) => {
//   if (!user) return '/login';
//   if (user.username === 'superadmin' || user.roleName === 'supadmin') return '/';

//   const userPermissionNames = new Set(
//     user?.userPermissions?.map((item) => item?.permission?.name) || [],
//   );

//   const firstAccessibleRoute = appRoutes.find((route) => {
//     const permissions = normalizePermissions(route.permissions);

//     if (permissions.length === 0) {
//       return true;
//     }

//     return permissions.some((permission) => userPermissionNames.has(permission));
//   });

//   if (!firstAccessibleRoute) {
//     return '/403-forbidden';
//   }

//   return firstAccessibleRoute.index ? '/' : `/${firstAccessibleRoute.path}`;
// };

// export default function PermissionGuard({ children, requiredPermissions = [] }) {
//   const { user, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user.username === 'superadmin' || user.roleName === 'supadmin') {
//     return children;
//   }

//   const permissions = normalizePermissions(requiredPermissions);

//   if (permissions.length === 0) {
//     return children;
//   }

//   const userPermissionNames = user.userPermissions?.map((item) => item?.permission?.name) || [];

//   const hasPermission = permissions.every((permission) => userPermissionNames.includes(permission));

//   if (!hasPermission) {
//     const fallbackPath = getFirstAccessiblePath(user);

//     if (fallbackPath === '/403-forbidden' || fallbackPath === location.pathname) {
//       return <Navigate to="/403-forbidden" replace />;
//     }

//     return <Navigate to={fallbackPath} replace />;
//   }

//   return children;
// }

export default function PermissionGuard({
  children,
  requiredPermissions = [],
}) {
  return children;
}
