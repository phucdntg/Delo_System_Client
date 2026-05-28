import { useTranslate } from "@core/providers/TranslateProvider";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Select, Switch } from "antd";
import PermissionSelector from "../../permission/components/PermissionSelector";
import { useFetchRolesQuery } from "../../role";
import { useAreaFetch } from "../hooks/useAreaFetch";
import { usePermissionSync } from "../hooks/usePermissionSync";
import { useRoleSelect } from "../hooks/useRoleSelect";
import { useSelectedPermissionList } from "../hooks/useSelectedPermissionList";

export default function UserForm({ form, initialValues = {}, onFinish }) {
  const { translate, language } = useTranslate();
  const userText = translate("user") || {};
  const common = translate("common") || {};
  const userForm = userText?.form || {};

  const { data: roleRes } = useFetchRolesQuery({});
  const roles = roleRes?.data || [];

  const {
    selectedRoleName,
    selectedBranchRoleId,
    selectedRole,
    roleGroups,
    roleNameOptions,
    showBranchSelect,
    handleRoleNameChange,
    handleBranchChange,
    handleRoleClear,
  } = useRoleSelect({ form, roles, initialValues, userText });

  const { selectedPermissionIds, rolePermissions, handlePermissionsChange } = usePermissionSync({
    form,
    selectedRoleId: selectedRole?.id ?? null,
    initialUserId: initialValues?.id ?? null,
  });

  const { fetchAreasFn, fetchAreaByIdFn } = useAreaFetch({
    selectedRole,
    form,
  });

  const selectedPermissionList = useSelectedPermissionList({
    rolePermissions,
    selectedPermissionIds,
    language,
  });

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
            message: userForm?.errors?.usernameRequired || "Username is required",
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
            message: userForm?.errors?.passwordRequired || "Password is required",
          },
        ]}
      >
        <Input.Password placeholder={userForm?.passwordPlaceholder || ""} />
      </Form.Item>

      <Form.Item label={userForm?.status || "Active"} name="isActive" valuePropName="checked">
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
                return Promise.reject(userForm?.errors?.roleRequired || "Vui lòng chọn vai trò");
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
          onClear={handleRoleClear}
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
                    userForm?.errors?.branchRequired || "Vui lòng chọn chi nhánh",
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            placeholder={common?.placeholder?.selectBranch || "-- Chọn chi nhánh --"}
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

      {!showBranchSelect && selectedRole?.branchId && (
        <span className="text-gray-500">Chi nhánh: {selectedRole.branch?.name}</span>
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
      {/* {selectedPermissionList.length > 0 && (
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
      )} */}

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
