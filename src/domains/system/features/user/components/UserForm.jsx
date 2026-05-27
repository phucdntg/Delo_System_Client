import { useTranslate } from "@core/providers/TranslateProvider";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Select, Switch, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLazyFetchAreaByIdQuery, useLazyFetchAreasQuery } from "../../area";
import { useFetchPermissionsByRoleQuery } from "../../permission";
import PermissionSelector from "../../permission/components/PermissionSelector";
import { ACTION_LABELS, MODULE_LABELS } from "../../permission/constants";
import { useFetchRolesQuery } from "../../role";
import { useFetchUserPermissionsQuery } from "../services/userService";

export default function UserForm({ form, initialValues = {}, onFinish }) {
  const { translate, language } = useTranslate();
  const userText = translate("user") || {};
  const common = translate("common") || {};
  const userForm = userText?.form || {};

  const { data: roleRes } = useFetchRolesQuery({});
  const roles = roleRes?.data || [];

  const [selectedRoleName, setSelectedRoleName] = useState(null);
  const [selectedBranchRoleId, setSelectedBranchRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});

  const ACTION_ORDER = ["view", "create", "edit", "delete"];

  // Fetch role permissions when selectedRole changes
  const { data: rolePermsData } = useFetchPermissionsByRoleQuery(
    selectedRole?.id,
    { skip: !selectedRole?.id },
  );

  // Fetch user permissions when editing
  const { data: userPermsData } = useFetchUserPermissionsQuery(
    initialValues?.id,
    { skip: !initialValues?.id },
  );

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
      .sort(
        (a, b) =>
          (roleGroups[a][0]?.level ?? Infinity) -
          (roleGroups[b][0]?.level ?? Infinity),
      )
      .map((name) => ({
        label: userText?.page?.roles?.[name] || name,
        value: name,
      }));
  }, [roleGroups, userText]);

  // Transform role permissions to grouped format
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
      .filter(
        (permission) => permission?.name && typeof permission.name === "string",
      )
      .reduce((acc, permission) => {
        const [module, action] = permission.name.split(".");
        if (!module || !action) return acc;
        if (!acc[module]) acc[module] = { name: module, actions: [] };
        acc[module].actions.push({ id: permission.id, name: action });
        return acc;
      }, {});

    Object.values(grouped).forEach((module) => {
      module.actions.sort((a, b) => {
        const posA = ACTION_ORDER.indexOf(a.name);
        const posB = ACTION_ORDER.indexOf(b.name);
        return (
          (posA === -1 ? Infinity : posA) - (posB === -1 ? Infinity : posB)
        );
      });
    });

    setRolePermissions(grouped);
    // Clear selected permissions when role permissions change
    setSelectedPermissionIds([]);
  }, [rolePermsData]);

  // Pre-fill permissions when editing user
  useEffect(() => {
    if (!initialValues?.id || !userPermsData) return;

    const userPermIds = (Array.isArray(userPermsData) ? userPermsData : []).map(
      (p) => p?.id,
    );
    setSelectedPermissionIds(userPermIds);
    form.setFieldValue(
      "userPermissions",
      userPermIds.map((id) => ({ permissionId: id })),
    );
  }, [userPermsData, initialValues?.id, form]);

  // Init state khi edit user (roles phải load xong mới chạy)
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

    // Sync field ảo để clear error
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
      // Clear role-related validation after auto-select
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

    // Sync field ảo để clear error
    form.setFieldValue("_branchDisplay", roleId);

    const role = roles.find((r) => r.id === roleId) || null;
    setSelectedRole(role);
    form.setFieldsValue({
      roleId: role?.id ?? null,
      branchId: role?.branchId ?? null,
      organizationId: role?.organizationId ?? null,
      areaId: null,
    });
    // Re-validate role display to hide branch-required error
    form.validateFields(["_roleDisplay"]).catch(() => {});
  };

  // Area select: paginated fetch using SelectShared
  const [fetchAreas] = useLazyFetchAreasQuery();
  const [fetchAreaById] = useLazyFetchAreaByIdQuery();

  const fetchAreasFn = async (page, pageSize, query) => {
    try {
      const branchId = selectedRole?.branchId || form.getFieldValue("branchId");
      return await fetchAreas({
        filters: branchId ? { branchId } : undefined,
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
        keyword: query,
      }).unwrap();
    } catch (err) {
      console.error("fetchAreasFn failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchAreaByIdFn = async (id) => {
    try {
      return await fetchAreaById(id).unwrap();
    } catch (err) {
      console.error("fetchAreaById failed", err);
      return null;
    }
  };

  const handlePermissionsChange = (ids) => {
    setSelectedPermissionIds(ids);
    form.setFieldValue(
      "userPermissions",
      (ids || []).map((id) => ({ permissionId: id })),
    );
  };

  const selectedPermissionList = useMemo(() => {
    const modules = Object.values(rolePermissions || {});

    const permissionMap = new Map(
      modules.flatMap((module) =>
        (module?.actions || []).map((action) => [
          action?.id,
          { module: module?.name, action: action?.name },
        ]),
      ),
    );

    const grouped = new Map();
    selectedPermissionIds.forEach((id) => {
      const data = permissionMap.get(id);
      if (!data) return;
      const moduleLabel = MODULE_LABELS[data.module]?.[language] || data.module;
      const actionLabel = ACTION_LABELS[data.action]?.[language] || data.action;
      if (!grouped.has(moduleLabel)) grouped.set(moduleLabel, new Map());
      grouped.get(moduleLabel).set(data.action, actionLabel);
    });

    return Array.from(grouped.entries()).map(([moduleLabel, actionsMap]) => ({
      moduleLabel,
      actionsLabel: ACTION_ORDER.filter((a) => actionsMap.has(a))
        .map((a) => actionsMap.get(a))
        .join(", "),
    }));
  }, [rolePermissions, selectedPermissionIds, language]);

  const showBranchSelect =
    selectedRoleName && (roleGroups[selectedRoleName] || []).length > 1;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
      <Form.Item
        label={userForm?.name || "Full name"}
        name="fullName"
        rules={[
          {
            required: true,
            message: userForm?.errors?.nameRequired || "Full name is required",
          },
        ]}
      >
        <Input placeholder={userForm?.namePlaceholder || ""} />
      </Form.Item>

      <Form.Item
        label={userForm?.username || "Username"}
        name="username"
        rules={[
          {
            required: true,
            message:
              userForm?.errors?.usernameRequired || "Username is required",
          },
        ]}
      >
        <Input placeholder={userForm?.usernamePlaceholder || ""} />
      </Form.Item>

      <Form.Item
        label={userForm?.email || "Email"}
        name="email"
        rules={[
          {
            required: true,
            message: userForm?.errors?.emailRequired || "Email is required",
          },
        ]}
      >
        <Input placeholder={userForm?.emailPlaceholder || ""} />
      </Form.Item>

      <Form.Item
        label={userForm?.password || "Password"}
        name="password"
        rules={[
          {
            required: !initialValues?.id,
            message:
              userForm?.errors?.passwordRequired || "Password is required",
          },
        ]}
      >
        <Input.Password placeholder={userForm?.passwordPlaceholder || ""} />
      </Form.Item>

      <Form.Item
        label={userForm?.status || "Active"}
        name="isActive"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* Role name selector */}
      <Form.Item
        required
        label={userForm?.role || "Role"}
        name="_roleDisplay" // tên ảo, không gửi lên server
        rules={[
          {
            validator: () => {
              if (!selectedRoleName) {
                return Promise.reject(
                  userForm?.errors?.roleRequired || "Vui lòng chọn vai trò",
                );
              }
              if (showBranchSelect && !selectedBranchRoleId) {
                return Promise.reject(
                  userForm?.errors?.branchRequired || "Vui lòng chọn chi nhánh",
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select
          placeholder={userForm?.rolePlaceholder || "Select a role"}
          options={roleNameOptions}
          value={selectedRoleName}
          onChange={handleRoleNameChange}
          allowClear
          onClear={() => {
            setSelectedRoleName(null);
            setSelectedBranchRoleId(null);
            setSelectedRole(null);
            form.setFieldsValue({
              roleId: null,
              branchId: null,
              organizationId: null,
              _roleDisplay: null,
            });
          }}
        />
      </Form.Item>

      {/* Branch select */}
      {showBranchSelect && (
        <Form.Item
          // label={common?.placeholder?.selectBranch || "Chi nhánh"}
          name="_branchDisplay" // tên ảo
          rules={[
            {
              validator: () => {
                if (!selectedBranchRoleId) {
                  return Promise.reject(
                    userForm?.errors?.branchRequired ||
                      "Vui lòng chọn chi nhánh",
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            placeholder={
              common?.placeholder?.selectBranch || "-- Chọn chi nhánh --"
            }
            options={(roleGroups[selectedRoleName] || []).map((r) => ({
              label: r.branch?.name || "(No branch)",
              value: r.id,
            }))}
            value={selectedBranchRoleId}
            onChange={handleBranchChange}
          />
        </Form.Item>
      )}

      {/* Area select (depends on selected branch) */}
      {(selectedRole?.branchId || form.getFieldValue("branchId")) && (
        <Form.Item label={userForm?.area || "Khu vực"} name="areaId" rules={[]}>
          <SelectShared
            allowClear
            style={{ width: "100%" }}
            fetchFn={fetchAreasFn}
            fetchItemById={fetchAreaByIdFn}
            defaultId={initialValues?.areaId}
            value={form.getFieldValue("areaId")}
            pageSize={10}
            searchable
            placeholder={userForm?.areaPlaceholder || "-- Chọn khu vực --"}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={(area) => form.setFieldValue("areaId", area?.id || null)}
            resetKey={selectedRole?.branchId || form.getFieldValue("branchId")}
          />
        </Form.Item>
      )}

      {/* Permission Selector - show only if role is selected */}
      {selectedRole && Object.keys(rolePermissions).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>
            {userForm?.permissions || "Permissions"}
          </div>
          <PermissionSelector
            permissions={rolePermissions}
            selected={selectedPermissionIds}
            onChange={handlePermissionsChange}
          />
        </div>
      )}

      {/* Display selected permissions as tags */}
      {selectedPermissionList.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {selectedPermissionList.map((item) => (
            <Tag key={item.moduleLabel} color="blue">
              {item.moduleLabel} ({item.actionsLabel})
            </Tag>
          ))}
        </div>
      )}

      {/* Hidden fields — giá trị thực gửi lên server */}
      <Form.Item name="roleId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="organizationId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="branchId" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="userPermissions" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
}
