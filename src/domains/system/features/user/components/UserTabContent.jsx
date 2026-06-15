import { PlusOutlined } from "@ant-design/icons";
import { usePermission } from "@core/hooks/usePermission";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import {
  PERMISSIONS,
  PERMISSION_MODULES,
} from "@shared/constants/permission.constant";
import { useFetchBranchesQuery } from "@domains/system";
import { Button, Select, Space, Tag } from "antd";
import { useEffect } from "react";
import { useFetchUsersQuery } from "../services/userService";

export default function UserTabContent({
  group,
  selectedByName,
  onSelectBranchRole,
  search,
  onEdit,
  onDelete,
  openModal,
}) {
  const { translate } = useTranslate();
  const { selectedOrg } = useAuth();
  const { hasPermission } = usePermission();
  const tUser = translate("user") || {};
  const t = tUser?.table || {};
  const commonText = translate("common") || {};

  const single = group.roles.length === 1;
  const selectedRoleId = single
    ? group.roles[0].id
    : (selectedByName[group.name] ?? null);

  const activeRole = group.roles.find((r) => r.id === selectedRoleId) ?? null;

  useEffect(() => {
    if (
      !single &&
      (selectedByName[group.name] === undefined ||
        selectedByName[group.name] === null)
    ) {
      const defaultRole = group.roles[0];
      if (defaultRole) onSelectBranchRole(group.name, defaultRole.id);
    }
  }, [single, selectedByName, group, onSelectBranchRole]);

  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters, resetTable } =
    useTable({ resetKey: selectedOrg });

  useEffect(() => {
    if (search !== undefined) {
      handleSearch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const canShowActions = [
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
  ].some((permission) => hasPermission(permission));

  const queryFilters = { ...filters, roleId: activeRole?.id || null };

  const {
    data: userRes,
    isLoading,
    isFetching,
    refetch: refetchUsers,
  } = useFetchUsersQuery({
    search: searchTerm?.length ? "name" : null,
    keyword: searchTerm,
    pagination,
    filters: queryFilters,
  });

  const columns = [
    { title: t.name, width: 200, dataIndex: "fullName" },
    { title: t.username, width: 200, dataIndex: "username" },
    { title: t.email, width: 200, dataIndex: "email" },
    ...(activeRole?.name === "admin"
      ? [{ title: t.organization, dataIndex: "organizationName", width: 200 }]
      : []),
    ...(activeRole?.branchId
      ? [{ title: t.branch, dataIndex: "branchName", width: 200 }]
      : []),
    {
      title: t.status,
      dataIndex: "isActive",
      width: 200,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? t.statuses?.active : t.statuses?.inactive}
        </Tag>
      ),
    },
    ...(canShowActions
      ? [
          {
            title: t.actions,
            width: 150,
            align: "center",
            render: (_, record) => (
              <Space>
                <EditButton
                  onEdit={() => onEdit(record)}
                  permissionKey={PERMISSION_MODULES.USERS}
                />
                <DeleteButton
                  onDelete={() => onDelete(record?.id)}
                  permissionKey={PERMISSION_MODULES.USERS}
                />
              </Space>
            ),
          },
        ]
      : []),
  ];

  if (!activeRole) {
    return (
      <div style={{ color: "#666", padding: 16 }}>
        Please select a branch to view users for this role.
      </div>
    );
  }

  return (
    <div className="h-full">
      <TableShared
      columns={columns}
      dataSource={userRes?.data || []}
      isLoading={isLoading}
      isFetching={isFetching}
      onReload={() => {
        resetTable?.();
        refetchUsers?.();
      }}
      search={{
        useSearch: true,
        hint: tUser?.page?.searchPlaceholder,
        handleSearch,
      }}
      topRightComponent={
        <Space>
          <SelectShared
            style={{ width: 200 }}
            useQueryHook={useFetchBranchesQuery}
            searchField="name"
            allowClear
            placeholder={commonText?.placeholder?.selectBranch || "-- Chọn chi nhánh --"}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={(item) => {
              setFilters((prev) => ({
                ...prev,
                branchId: item?.id || undefined,
              }));
            }}
            value={filters?.branchId}
            resetKey={selectedOrg}
          />
          <Select
            allowClear
            placeholder={commonText?.placeholder?.selectStatus}
            style={{ width: 180 }}
            options={[
              { label: commonText?.status?.active || "Active", value: true },
              { label: commonText?.status?.inactive || "Inactive", value: false },
            ]}
            value={filters?.isActive}
            onChange={(v) =>
              setFilters((prev) => ({ ...prev, isActive: v }))
            }
          />
        </Space>
      }
      topLeftComponent={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal?.()}>
          {commonText?.button?.create}
        </Button>
      }
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: userRes?.meta?.totalItems || 0,
        onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
      }}
    />
    </div>
  );
}
