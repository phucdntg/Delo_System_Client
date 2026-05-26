import { SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input, Select, Switch } from "antd";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import useSelect from "@core/hooks/useSelect";
import { useAuth } from "@core/providers/AuthProvider";
import { useTranslate } from "@core/providers/TranslateProvider";
import SelectShared from "@shared/components/SelectShared";
import {
  useFetchAreasQuery,
  useFetchPermissionsByRoleQuery,
  useFetchPermissionsByUserQuery,
  useFetchRolesQuery,
} from "@domains/system";
import PermissionSelector from "./PermissionSelector";

const roleHierarchy = {
  superadmin: ["supadmin", "admin", "supervisor", "user"],
  supadmin: ["admin", "supervisor", "user"],
  admin: ["supervisor", "user"],
  supervisor: ["user"],
};

function UserForm({ form, initialValues }) {
  const { translate } = useTranslate();
  const { user, selectedOrg } = useAuth();
  const userText = translate("user") || {};
  const userLanguage = userText?.form || {};
  const commonText = translate("common") || {};
  const roleOrder = ["supadmin", "admin", "supervisor", "user"];

  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentAreaPage, setCurrentAreaPage] = useState(1);

  const { data: roleRes } = useFetchRolesQuery({});

  const {
    data: rolePermissions,
    isLoading: loadingRolePermissions,
    isFetching: fetchingRolePermissions,
  } = useFetchPermissionsByRoleQuery(selectedRole?.id, {
    skip: !selectedRole?.id,
  });

  const { data: userPermissions } = useFetchPermissionsByUserQuery(
    initialValues?.id,
    {
      skip: !initialValues?.id,
    },
  );

  const isUserRole = selectedRole?.name === "user";

  const { data: areaRes, isFetching: areaLoading } = useFetchAreasQuery(
    {
      search: null,
      keyword: "",
      filters: {
        branchId: selectedRole?.branchId,
      },
      pagination: {
        current: currentAreaPage,
        pageSize: 10,
      },
    },
    {
      skip: !isUserRole,
    },
  );

  const { options: areaOptions, onLoadMore: loadMoreAreas } = useSelect({
    data: areaRes,
    setCurrentPage: setCurrentAreaPage,
    resetKey: selectedRole?.branchId,
  });

  const roleSystem = useMemo(() => {
    return (
      roleRes?.data
        .filter((r) => r?.isSystem)
        .sort((a, b) => {
          return roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name);
        }) ?? []
    );
  }, [roleRes]);

  const roleIsNotSystem = useMemo(() => {
    return (
      roleRes?.data
        .filter((r) => !r?.isSystem)
        .sort((a, b) => {
          return roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name);
        }) ?? []
    );
  }, [roleRes]);

  const roleChilds = useMemo(() => {
    if (selectedOrg === 0) {
      return roleSystem.filter((r) => r.name === "supadmin");
    }

    if (user?.roleId === 0 && user?.username === "superadmin") {
      return [...roleIsNotSystem];
    }

    if (user?.roleName) {
      const childs = roleHierarchy[user?.roleName] || [];
      return roleIsNotSystem.filter((r) => childs.includes(r.name));
    }

    return [];
  }, [user, roleSystem, roleIsNotSystem, selectedOrg]);

  const permissionGrouped = useMemo(() => {
    const permissionList = Array.isArray(rolePermissions)
      ? rolePermissions
      : rolePermissions?.data || [];

    if (permissionList.length === 0) return {};

    return permissionList.reduce((group, item) => {
      const [module, action] = item.name.split(".");
      if (!group[module]) group[module] = [];

      group[module].push({
        ...item,
        checked: false,
        action,
      });

      return group;
    }, {});
  }, [rolePermissions]);

  const toUserPermissionsPayload = (permissions = {}) =>
    Object.entries(permissions).flatMap(([_, permIds]) =>
      permIds.map((permissionId) => ({ permissionId })),
    );

  const handleCheckedPermissions = () => {
    const checkedPerms = {};

    for (const checkedPermission of userPermissions || []) {
      const [module] = checkedPermission?.name.split(".");
      if (!checkedPerms[module]) checkedPerms[module] = [];
      if (!checkedPerms[module].includes(checkedPermission.id)) {
        checkedPerms[module] = [...checkedPerms[module], checkedPermission.id];
      }
    }

    setSelectedPermissions(checkedPerms);
    form.setFieldsValue({
      userPermissions: toUserPermissionsPayload(checkedPerms),
    });
  };

  useEffect(() => {
    if (userPermissions && userPermissions?.length > 0) {
      handleCheckedPermissions();
    }
  }, [userPermissions]);

  useEffect(() => {
    form.setFieldsValue({
      userPermissions: toUserPermissionsPayload(selectedPermissions),
    });
  }, [selectedPermissions, form]);

  useLayoutEffect(() => {
    if (form && initialValues) {
      form.setFieldsValue(initialValues);
    }

    return () => {
      form.resetFields();
    };
  }, [form, initialValues]);

  useEffect(() => {
    if (!initialValues?.roleId || !roleChilds?.length) return;
    const matched = roleChilds.find((r) => r?.id === initialValues.roleId);
    if (matched) setSelectedRole(matched);
  }, [initialValues?.roleId, roleChilds]);

  const handleRoleChange = (value) => {
    const role = roleChilds?.find((r) => r?.id === value);
    setSelectedRole(role);
    setSelectedPermissions({});
    form.setFieldsValue({ userPermissions: [] });
    form.setFieldsValue({
      branchId: role?.branchId,
      organizationId: role?.organizationId,
      areaId: undefined,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      initialValues={{ isActive: false }}
    >
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>
        <UserOutlined /> {userLanguage?.sections?.basicInfo}
      </div>

      <Form.Item
        label={userLanguage?.username}
        name="username"
        rules={[
          { required: true, message: userLanguage?.errors?.usernameRequired },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: userLanguage?.errors?.usernameFormat,
          },
        ]}
      >
        <Input placeholder={userLanguage?.usernamePlaceholder} />
      </Form.Item>

      <Form.Item
        name="fullName"
        label={userLanguage?.name}
        rules={[
          { required: true, message: userLanguage?.errors?.nameRequired },
        ]}
      >
        <Input placeholder={userLanguage?.namePlaceholder} />
      </Form.Item>

      <Form.Item
        name="email"
        label={userLanguage?.email}
        rules={[
          { required: true, message: userLanguage?.errors?.emailRequired },
        ]}
      >
        <Input placeholder={userLanguage?.emailPlaceholder} />
      </Form.Item>

      <Form.Item
        name="password"
        label={userLanguage?.password}
        rules={[
          {
            required: initialValues ? false : true,
            message: userLanguage?.errors?.passwordRequired,
          },
          {
            min: 8,
            message: userLanguage?.errors?.passwordMinLength,
          },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="roleId"
        label={userLanguage?.role}
        rules={[
          { required: true, message: userLanguage?.errors?.roleRequired },
        ]}
      >
        <Select
          placeholder={userLanguage?.rolePlaceholder}
          options={roleChilds.map((role) => ({
            value: role.id,
            label:
              role.name === "supadmin"
                ? userText?.page?.labels?.supadmin || "Supadmin"
                : (userText?.page?.roles?.[role.name] || role.name) +
                  `${role?.branchName ? ` - ${role.branchName}` : ""}`,
          }))}
          onChange={handleRoleChange}
        />
      </Form.Item>

      {isUserRole && (
        <Form.Item
          name="areaId"
          label={userLanguage?.area}
          rules={[
            {
              required: true,
              message: userLanguage?.errors?.areaRequired,
            },
          ]}
        >
          <SelectShared
            placeholder={commonText?.placeholder?.selectArea}
            options={areaOptions}
            loading={areaLoading}
            hasMore={areaOptions.length < (areaRes?.meta?.totalItems || 0)}
            onLoadMore={loadMoreAreas}
            style={{ width: "100%" }}
          />
        </Form.Item>
      )}

      <Form.Item
        name="isActive"
        label={userLanguage?.status}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item name="userPermissions" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="branchId" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="organizationId" hidden>
        <Input />
      </Form.Item>

      {selectedRole && selectedRole?.name !== "supadmin" && (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>
            <SafetyOutlined /> {userLanguage?.sections?.permissions}
          </div>

          <PermissionSelector
            permissionGrouped={permissionGrouped}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            isLoading={loadingRolePermissions || fetchingRolePermissions}
          />
        </>
      )}
    </Form>
  );
}

export default UserForm;
