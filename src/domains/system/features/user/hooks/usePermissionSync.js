import { useEffect, useState } from "react";
import { useFetchPermissionsByRoleQuery } from "../../permission";
import { useFetchUserPermissionsQuery } from "../services/userService";

const ACTION_ORDER = ["view", "create", "edit", "delete"];

export function usePermissionSync({ form, selectedRoleId = null, initialUserId = null }) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});

  const { data: rolePermsData } = useFetchPermissionsByRoleQuery(selectedRoleId, {
    skip: !selectedRoleId,
  });

  const { data: userPermsData } = useFetchUserPermissionsQuery(initialUserId, {
    skip: !initialUserId,
  });

  useEffect(() => {
    if (!rolePermsData) {
      setRolePermissions({});
      setSelectedPermissionIds([]);
      return;
    }

    const permArray = (rolePermsData?.rolePermissions || [])
      .map((rp) => rp.permission)
      .filter(Boolean);

    const grouped = permArray
      .filter((permission) => permission?.name && typeof permission.name === "string")
      .reduce((acc, permission) => {
        const [module, action] = permission.name.split(".");
        if (!module || !action) return acc;

        if (!acc[module]) {
          acc[module] = { name: module, actions: [] };
        }
        acc[module].actions.push({ id: permission.id, name: action });
        return acc;
      }, {});

    Object.values(grouped).forEach((module) => {
      module.actions.sort((a, b) => {
        const posA = ACTION_ORDER.indexOf(a.name);
        const posB = ACTION_ORDER.indexOf(b.name);
        return (posA === -1 ? Infinity : posA) - (posB === -1 ? Infinity : posB);
      });
    });

    setRolePermissions(grouped);
    // Only reset permissions when creating new user, not when editing
    if (!initialUserId) {
      setSelectedPermissionIds([]);
    }
  }, [rolePermsData, initialUserId]);

  // Pre-fill permissions when editing user
  useEffect(() => {
    if (!initialUserId || !userPermsData) return;

    const userPermIds = (Array.isArray(userPermsData) ? userPermsData : []).map((p) => p?.id);

    setSelectedPermissionIds(userPermIds);

    form.setFieldValue(
      "userPermissions",
      (userPermIds || []).map((id) => ({ permissionId: id })),
    );
  }, [userPermsData, initialUserId, form]);

  const handlePermissionsChange = (ids) => {
    setSelectedPermissionIds(ids);
    form.setFieldValue(
      "userPermissions",
      (ids || []).map((id) => ({ permissionId: id })),
    );
  };

  return {
    selectedPermissionIds,
    rolePermissions,
    handlePermissionsChange,
  };
}
