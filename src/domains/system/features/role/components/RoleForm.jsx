import { Button, Form, Input, Tag } from "antd";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslate } from "@core/providers/TranslateProvider";
import { useAuth } from "@core/providers/AuthProvider";
import SelectShared from "@shared/components/SelectShared";
import PermissionModal from "../../permission/components/PermissionModal";
import { useFetchPermissionsQuery } from "../../permission";
import {
  useFetchRolePermissionsQuery,
  useLazyFetchRolesQuery,
} from "../services/roleService";
import {
  useLazyFetchBranchesQuery,
  useLazyFetchBranchByIdQuery,
} from "../../branch";
import { ACTION_LABELS, MODULE_LABELS } from "../../permission/constants";

const ACTION_ORDER = ["view", "create", "edit", "delete"];

const isSupervisorOrUser = (name) =>
  ["supervisor", "user"].includes((name || "").toLowerCase().trim());

const extractPermissionIds = (rolePermissions = []) =>
  rolePermissions
    .map((p) => p?.permissionId || p?.permission?.id || p?.id)
    .filter(Boolean);

const RoleForm = ({ form, initialValue }) => {
  const { translate, language } = useTranslate();
  const { selectedOrg } = useAuth();

  const roleText = translate("role") || {};
  const modalText = roleText?.modal || {};
  const commonText = translate("common") || {};

  const [fetchRoles] = useLazyFetchRolesQuery();
  const [fetchBranches] = useLazyFetchBranchesQuery();
  const [fetchBranchById] = useLazyFetchBranchByIdQuery();

  const {
    data: permissions,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useFetchPermissionsQuery();

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedBaseRoleId, setSelectedBaseRoleId] = useState(null);
  const [hasBranchOnEdit, setHasBranchOnEdit] = useState(false);

  // ─── RTK Query ───────────────────────────────────────────────────────────────

  const { data: rolePermissionDetail } = useFetchRolePermissionsQuery(
    initialValue?.id,
    { skip: !initialValue?.id },
  );

  const { data: baseRolePermissionDetail } = useFetchRolePermissionsQuery(
    selectedBaseRoleId,
    { skip: !selectedBaseRoleId || !!initialValue?.id },
  );

  // ─── Fetch helpers ───────────────────────────────────────────────────────────

  const fetchBaseRolesFn = async (page, pageSize, query) => {
    try {
      return await fetchRoles({
        filters: { isSystem: true, skipOrgId: true },
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
        keyword: query,
      }).unwrap();
    } catch (err) {
      console.error("fetchBaseRolesFn failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchBranchesFn = async (page, pageSize, query) => {
    try {
      return await fetchBranches({
        keyword: query,
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
      }).unwrap();
    } catch (err) {
      console.error("fetchBranchesFn failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchBranchDetails = async (id) => {
    try {
      return await fetchBranchById(id).unwrap();
    } catch (err) {
      console.error("fetchBranchDetails failed", err);
      return null;
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleRoleChange = (role) => {
    setSelectedRoleName(role?.name || "");
    setSelectedBaseRoleId(role?.id || null);
    form.setFieldValue("baseRoleId", role?.id || null);
  };

  const applyPermissionIds = (ids = []) => {
    setSelectedPermissionIds(ids);
    form.setFieldValue(
      "rolePermissions",
      ids.map((id) => ({ id })),
    );
  };

  const handlePermissionConfirm = (ids) => {
    applyPermissionIds(ids || []);
    setPermissionModalOpen(false);
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue(initialValue);
      setSelectedRoleName(initialValue?.name || "");
      setHasBranchOnEdit(!!initialValue?.branchId);
    } else {
      form.resetFields();
      setSelectedPermissionIds([]);
      setSelectedRoleName("");
      setHasBranchOnEdit(false);
    }
    setSelectedBaseRoleId(null);
  }, [initialValue, form]);

  useEffect(() => {
    if (!rolePermissionDetail) return;
    const { name, branchId, rolePermissions } = rolePermissionDetail;

    form.setFieldsValue({
      name: name || form.getFieldValue("name"),
      branchId: branchId || null,
    });
    setHasBranchOnEdit(!!branchId);
    setSelectedRoleName(name || "");
    applyPermissionIds(extractPermissionIds(rolePermissions));
  }, [rolePermissionDetail]);

  useEffect(() => {
    if (baseRolePermissionDetail) {
      applyPermissionIds(
        extractPermissionIds(baseRolePermissionDetail?.rolePermissions),
      );
    }
  }, [baseRolePermissionDetail]);

  useEffect(() => {
    const roleName = (selectedRoleName || form.getFieldValue("name") || "")
      .toLowerCase()
      .trim();
    if (roleName && !isSupervisorOrUser(roleName) && !initialValue?.id) {
      form.setFieldValue("branchId", null);
    }
  }, [selectedRoleName]);

  useEffect(() => {
    if (
      !initialValue?.id &&
      !permissionModalOpen &&
      selectedPermissionIds.length === 0
    ) {
      form.setFieldValue("rolePermissions", []);
    }
  }, [permissionModalOpen, selectedPermissionIds, initialValue?.id]);

  // ─── Derived state ───────────────────────────────────────────────────────────

  const currentRoleName = selectedRoleName || form.getFieldValue("name") || "";
  const isRoleWithBranch = isSupervisorOrUser(currentRoleName);
  const showBranchField = initialValue?.id
    ? hasBranchOnEdit || isRoleWithBranch
    : isRoleWithBranch;

  const selectedPermissionList = useMemo(() => {
    const modules = Array.isArray(permissions)
      ? permissions
      : Object.values(permissions || {});

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
  }, [permissions, selectedPermissionIds, language]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Form form={form} layout="vertical">
      {!initialValue?.id ? (
        <>
          <Form.Item
            label={modalText?.roleLabel}
            name="baseRoleId"
            rules={[{ required: true, message: modalText?.pleaseSelectRole }]}
          >
            <SelectShared
              style={{ width: "100%" }}
              fetchFn={fetchBaseRolesFn}
              pageSize={10}
              searchable
              placeholder={modalText?.selectRole}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={handleRoleChange}
              resetKey={selectedOrg}
            />
          </Form.Item>

          <Form.Item
            label={modalText?.nameLabel}
            name="name"
            rules={[{ required: true, message: modalText?.nameRequired }]}
          >
            <Input placeholder={modalText?.namePlaceholder} />
          </Form.Item>
        </>
      ) : (
        <Form.Item
          label={modalText?.roleLabel}
          name="name"
          rules={[{ required: true, message: modalText?.nameRequired }]}
        >
          <Input />
        </Form.Item>
      )}

      {showBranchField && (
        <Form.Item
          label={modalText?.branchLabel}
          name="branchId"
          rules={
            isRoleWithBranch
              ? [{ required: true, message: modalText?.pleaseSelectBranch }]
              : []
          }
        >
          <SelectShared
            style={{ width: "100%" }}
            fetchFn={fetchBranchesFn}
            fetchItemById={fetchBranchDetails}
            defaultId={initialValue?.branchId}
            pageSize={10}
            searchable
            placeholder={commonText?.placeholder?.selectBranch}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={(branch) =>
              form.setFieldValue("branchId", branch?.id || null)
            }
            resetKey={selectedOrg}
          />
        </Form.Item>
      )}

      <Form.Item name="rolePermissions" hidden>
        <Input />
      </Form.Item>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          background: "#fafafa",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{modalText?.selectPermissions}</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            {selectedPermissionIds.length === 0
              ? modalText?.noPermissions
              : `${selectedPermissionIds.length} ${modalText?.permissionsSelected}`}
          </div>
        </div>
        <Button type="primary" onClick={() => setPermissionModalOpen(true)}>
          {modalText?.selectPermissions}
        </Button>
      </div>

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

      <PermissionModal
        title={modalText?.selectPermissions || "Chọn quyền"}
        visible={permissionModalOpen}
        selected={selectedPermissionIds}
        onCancel={() => setPermissionModalOpen(false)}
        onConfirm={handlePermissionConfirm}
        permissions={permissions}
        loading={permissionsLoading}
        error={permissionsError}
      />
    </Form>
  );
};

export default RoleForm;
