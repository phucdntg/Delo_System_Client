import { usePermission } from "@core/hooks/usePermission";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import {
  PERMISSIONS,
  PERMISSION_MODULES,
} from "@shared/constants/permission.constant";
import { Space, Tag } from "antd";
import { useEffect } from "react";
import { useFetchUsersQuery } from "../services/userService";

export default function UserTable({
  onEdit,
  onDelete,
  tabRole,
  externalSearch,
}) {
  const { translate } = useTranslate();
  const { selectedOrg } = useAuth();
  const { hasPermission } = usePermission();
  const t = translate("user.table") || {};

  const canShowActions = [
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
  ].some((permission) => hasPermission(permission));

  const {
    pagination,
    handleTableChange,
    searchTerm,
    handleSearch,
    setSearchTerm,
  } = useTable({
    resetKey: selectedOrg,
  });

  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== searchTerm) {
      setSearchTerm(externalSearch || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSearch]);

  const {
    data: userRes,
    isLoading,
    isFetching,
  } = useFetchUsersQuery({
    search: searchTerm?.length ? "name" : null,
    keyword: searchTerm,
    pagination,
    filters: {
      roleId: tabRole?.id || null,
    },
  });

  const columns = [
    { title: t.name, width: 200, dataIndex: "fullName" },
    { title: t.username, width: 200, dataIndex: "username" },
    { title: t.email, width: 200, dataIndex: "email" },
    ...(tabRole?.name === "admin"
      ? [{ title: t.organization, dataIndex: "organizationName", width: 200 }]
      : []),
    ...(tabRole?.branchId
      ? [{ title: t.branch, dataIndex: "branchName", width: 200 }]
      : []),
    {
      title: t.status,
      dataIndex: "isActive",
      width: 200,
      render: (isActive) => {
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? t.statuses?.active : t.statuses?.inactive}
          </Tag>
        );
      },
    },
    ...(canShowActions
      ? [
          {
            title: t.actions,
            fixed: "right",
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

  return (
    <TableShared
      columns={columns}
      dataSource={userRes?.data || []}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: userRes?.meta?.totalItems || 0,
        onChange: (page, pageSize) =>
          handleTableChange({ current: page, pageSize }),
      }}
      onSearch={handleSearch}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
