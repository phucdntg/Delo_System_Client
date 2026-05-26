import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tabs } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useMemo } from 'react';
import useModal from '@core/hooks/useModal';
import { useAuth } from '@core/providers/AuthProvider';
import { useTranslate } from '@core/providers/TranslateProvider';
import ModalShared from '@shared/components/ModalShared';
import { PERMISSION_MODULES } from '@shared/constants/permission.constant';
import { usePermission } from '@core/hooks/usePermission';
import { useFetchRolesQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '@domains/system';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';

const roleHierarchy = {
  superadmin: ['supadmin', 'admin', 'supervisor', 'user'],
  supadmin: ['admin', 'supervisor', 'user'],
  admin: ['supervisor', 'user'],
  supervisor: ['user'],
};

export default function UserManagement() {
  const { translate } = useTranslate();
  const { selectedOrg, user } = useAuth();
  const { hasPermission } = usePermission();
  const userText = translate('user') || {};
  const t = userText?.page || {};

  const roleOrder = ['supadmin', 'admin', 'supervisor', 'user'];

  const [form] = useForm();
  const { open, data: dataEditing, openModal, closeModal } = useModal();

  const { data: roleRes } = useFetchRolesQuery({});
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const roleSystem = useMemo(() => {
    return (
      roleRes?.data
        ?.filter((r) => r?.isSystem)
        .sort((a, b) => roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name)) ?? []
    );
  }, [roleRes]);

  const roleIsNotSystem = useMemo(() => {
    return (
      roleRes?.data
        ?.filter((r) => !r?.isSystem)
        .sort((a, b) => roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name)) ?? []
    );
  }, [roleRes]);

  const roleChilds = useMemo(() => {
    if (selectedOrg === 0) {
      return roleSystem.filter((r) => r.name === 'supadmin');
    }

    let roles = [];

    if (user?.roleId === 0 && user?.username === 'superadmin') {
      roles = roleIsNotSystem;
    } else if (user?.roleName) {
      const childs = roleHierarchy[user?.roleName] || [];
      roles = roleIsNotSystem.filter((r) => childs.includes(r.name));
    }

    const seen = new Set();
    const uniqueRoles = roles.filter((r) => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    });

    return uniqueRoles;
  }, [user, roleSystem, roleIsNotSystem, selectedOrg]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!dataEditing?.id) {
        await createUser(values).unwrap();
        message.success(userText?.message?.createSuccess || 'User created successfully');
      } else {
        await updateUser({ ...values, id: dataEditing?.id }).unwrap();
        message.success(userText?.message?.updateSuccess || 'User updated successfully');
      }

      form.resetFields();
      closeModal();
    } catch (error) {
      console.error('Failed to submit user form:', error);
      message.error(userText?.message?.submitFailed || 'Failed to submit user form');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id).unwrap();
      message.success(t?.messages?.deleteSuccess || 'User deleted successfully');
    } catch (error) {
      message.error(t?.messages?.deleteFailed || 'Failed to delete user');
      console.error(error);
    }
  };

  const canCreate = hasPermission(PERMISSION_MODULES.USERS + '.create');

  return (
    <div>
      {canCreate && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          style={{ marginBottom: 16 }}
        >
          {t?.createButton || 'Create User'}
        </Button>
      )}

      <ModalShared
        width={600}
        title={dataEditing?.id ? userText?.modal?.editTitle : userText?.modal?.createTitle}
        open={open}
        onCancel={() => {
          closeModal();
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
      >
        <UserForm form={form} initialValues={dataEditing} />
      </ModalShared>

      {roleRes?.data?.length > 0 && (
        <Tabs
          items={(roleChilds || []).map((r) => ({
            key: r.id,
            label: r.name === 'supadmin' ? t?.labels?.supadmin || 'Supadmin' : t?.roles?.[r.name] || r?.name,
            children: (
              <UserTable
                tabRole={r}
                onEdit={(record) => openModal(record)}
                onDelete={(id) => handleDeleteUser(id)}
              />
            ),
          }))}
        />
      )}
    </div>
  );
}
