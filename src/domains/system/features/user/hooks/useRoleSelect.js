import { useEffect, useMemo, useState } from "react";

export function useRoleSelect({ form, roles, initialValues = {}, userText = {} }) {
  const [selectedRoleName, setSelectedRoleName] = useState(null);
  const [selectedBranchRoleId, setSelectedBranchRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const roleGroups = useMemo(() => {
    const groups = (roles || []).reduce((acc, r) => {
      const key = r.name || "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    }, {});

    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => (a.level ?? Infinity) - (b.level ?? Infinity));
    });

    return groups;
  }, [roles]);

  const roleNameOptions = useMemo(() => {
    return Object.keys(roleGroups)
      .sort((a, b) => (roleGroups[a][0]?.level ?? Infinity) - (roleGroups[b][0]?.level ?? Infinity))
      .map((name) => ({
        label: userText?.page?.roles?.[name] || name,
        value: name,
      }));
  }, [roleGroups, userText]);

  const showBranchSelect = selectedRoleName && (roleGroups[selectedRoleName] || []).length > 1;

  useEffect(() => {
    if (!form || !roles.length) return;

    if (initialValues?.id) {
      form.setFieldsValue(initialValues);

      if (initialValues?.roleId) {
        const matched = roles.find((r) => r.id === initialValues.roleId);
        if (matched) {
          setSelectedRole(matched);
          setSelectedRoleName(matched.name);
          form.setFieldValue("_roleDisplay", matched.name);

          const group = roleGroups[matched.name] || [];
          if (group.length > 1) {
            setSelectedBranchRoleId(matched.id);
            form.setFieldValue("_branchDisplay", matched.id);
          }
        }
      }
    } else {
      form.setFieldsValue({
        ...(initialValues || {}),
        isActive: initialValues?.isActive ?? true,
      });
    }

    return () => {
      form?.resetFields?.();
    };
  }, [form, initialValues, roles, roleGroups]);

  const handleRoleNameChange = (roleName) => {
    setSelectedRoleName(roleName);
    setSelectedBranchRoleId(null);
    setSelectedRole(null);

    form.setFieldValue("_roleDisplay", roleName);
    form.setFieldValue("_branchDisplay", null);
    form.setFieldValue("areaId", null);

    const group = roleGroups[roleName] || [];
    if (group.length === 1) {
      const role = group[0];
      setSelectedRole(role);
      form.setFieldsValue({
        roleId: role.id,
        branchId: role?.branchId ?? null,
        organizationId: role?.organizationId ?? null,
        areaId: null,
      });
      form.validateFields(["_roleDisplay"]).catch(() => {});
    } else {
      form.setFieldsValue({
        roleId: null,
        branchId: null,
        areaId: null,
        organizationId: null,
      });
    }
  };

  const handleBranchChange = (roleId) => {
    setSelectedBranchRoleId(roleId);
    form.setFieldValue("_branchDisplay", roleId);

    const role = roles.find((r) => r.id === roleId) || null;
    setSelectedRole(role);
    form.setFieldsValue({
      roleId: role?.id ?? null,
      branchId: role?.branchId ?? null,
      organizationId: role?.organizationId ?? null,
      areaId: null,
    });

    form.validateFields(["_roleDisplay"]).catch(() => {});
  };

  const handleRoleClear = () => {
    setSelectedRoleName(null);
    setSelectedBranchRoleId(null);
    setSelectedRole(null);
    form.setFieldsValue({
      roleId: null,
      branchId: null,
      organizationId: null,
      _roleDisplay: null,
    });
  };

  return {
    selectedRoleName,
    selectedBranchRoleId,
    selectedRole,
    roleGroups,
    roleNameOptions,
    showBranchSelect,
    handleRoleNameChange,
    handleBranchChange,
    handleRoleClear,
  };
}
