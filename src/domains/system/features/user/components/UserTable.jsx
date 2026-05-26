import { Space, Tag } from 'antd';
import useTable from '@core/hooks/useTable';
import { useAuth } from '@core/providers/AuthProvider';
import { useTranslate } from '@core/providers/TranslateProvider';
import TableShared from '@shared/components/TableShared';
import DeleteButton from '@shared/components/DeleteButton';
import EditButton from '@shared/components/EditButton';
import { PERMISSIONS, PERMISSION_MODULES } from '@shared/constants/permission.constant';
import { usePermission } from '@core/hooks/usePermission';
import { useFetchUsersQuery } from '../services/userService';

export default function UserTable({ onEdit, onDelete, tabRole }) {
  const { translate } = useTranslate();
  const { selectedOrg } = useAuth();
  const { hasPermission } = usePermission();
  const t = translate('user.table') || {};

  const canShowActions = [PERMISSIONS.USERS.UPDATE, PERMISSIONS.USERS.DELETE].some((permission) =>
    hasPermission(permission),
  );

  const { pagination, handleTableChange, searchTerm, handleSearch } = useTable({
    resetKey: selectedOrg,
  });

  const {
    data: userRes,
    isLoading,
    isFetching,
  } = useFetchUsersQuery({
    search: searchTerm?.length ? 'name' : null,
    keyword: searchTerm,
    pagination,
    filters: {
      role: {
        name: tabRole?.name,
      },
      organizationId: tabRole?.organizationId || null,
    },
  });

  const columns = [
    { title: t.name, width: 200, dataIndex: 'fullName' },
    { title: t.username, width: 200, dataIndex: 'username' },
    { title: t.email, width: 200, dataIndex: 'email' },
    ...(tabRole?.name === 'admin'
      ? [{ title: t.organization, dataIndex: 'organizationName', width: 200 }]
      : []),
    ...(tabRole?.name !== 'admin' && tabRole?.name !== 'supadmin'
      ? [{ title: t.branch, dataIndex: 'branchName', width: 200 }]
      : []),
    {
      title: t.status,
      dataIndex: 'isActive',
      width: 200,
      render: (isActive) => {
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? t.statuses?.active : t.statuses?.inactive}
          </Tag>
        );
      },
    },
    ...(canShowActions
      ? [
          {
            title: t.actions,
            fixed: 'right',
            width: 150,
            align: 'center',
            render: (_, record) => (
              <Space>
                <EditButton onEdit={() => onEdit(record)} permissionKey={PERMISSION_MODULES.USERS} />
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
        onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
      }}
      onSearch={handleSearch}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
