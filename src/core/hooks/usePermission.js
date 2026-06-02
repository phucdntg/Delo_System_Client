import { useAuth } from "@core/providers/auth";

export const usePermission = () => {
  const { user } = useAuth();

  const isSuperAdmin =
    user?.username === "superadmin" || user?.roleName === "supadmin";

  const hasPermission = (permission) => {
    if (isSuperAdmin) return true;
    return (
      user?.userPermissions?.some((p) => p.permission.name === permission) ??
      false
    );
  };

  return { hasPermission };
};
