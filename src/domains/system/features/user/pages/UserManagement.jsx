import useModal from "@core/hooks/useModal";
import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import ModalShared from "@shared/components/ModalShared";
import { App, Tabs } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetchRolesQuery } from "../../role";
import UserForm from "../components/UserForm";
import UserTabContent from "../components/UserTabContent";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../services/userService";

export default function UserManagement() {
  const { message } = App.useApp();
  const { user, selectedOrg } = useAuth();
  const [selectedByName, setSelectedByName] = useState({});
  const { translate } = useTranslate();
  const common = translate("common") || {};
  const t = translate("user") || {};

  const [form] = useForm();
  const { open, data: userEditing, openModal, closeModal } = useModal();

  const [activeKey, setActiveKey] = useState(() => null);

  const { data: roleRes } = useFetchRolesQuery({
    filters: {
      organizationId: selectedOrg || "null",
      isSystem: false,
    },
  });

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const roleGroups = useMemo(() => {
    const minLevel = user?.role?.level ?? null;
    const filtered = (roleRes?.data || []).filter(
      (r) => minLevel === null || r.level >= minLevel,
    );

    const groupMap = filtered.reduce((acc, r) => {
      const key = r.name || "";
      (acc[key] ??= []).push(r);
      return acc;
    }, {});

    return Object.values(groupMap)
      .map((roles) => ({
        name: roles[0].name,
        roles: roles.sort(
          (a, b) => (a.level ?? Infinity) - (b.level ?? Infinity),
        ),
      }))
      .sort(
        (a, b) =>
          (a.roles[0]?.level ?? Infinity) - (b.roles[0]?.level ?? Infinity),
      );
  }, [roleRes?.data, user?.role?.level]);

  const onSelectBranchRole = useCallback((roleName, roleId) => {
    setSelectedByName((prev) => ({ ...prev, [roleName]: roleId }));
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteUser(id).unwrap();
      message.success(
        t?.page?.messages?.deleteSuccess || "User deactivated successfully",
      );
    } catch (error) {
      console.error("Error deactivating user:", error);
      message.error(
        t?.page?.messages?.deleteFailed || "Failed to deactivate user",
      );
    }
  };

  const tabItems = useMemo(
    () =>
      roleGroups.map((group) => ({
        key: group.name,
        label: `${group.name.charAt(0).toUpperCase()}${group.name.slice(1)}`,
        children: (
          <UserTabContent
            group={group}
            selectedByName={selectedByName}
            onSelectBranchRole={onSelectBranchRole}
            openModal={openModal}
            onEdit={(record) => openModal(record)}
            onDelete={handleDelete}
          />
        ),
      })),
    [roleGroups, selectedByName, onSelectBranchRole, openModal, handleDelete],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      delete payload._roleDisplay;
      delete payload._branchDisplay;

      if (!payload.password) delete payload.password;

      if (userEditing?.id) {
        await updateUser({ id: userEditing.id, ...payload }).unwrap();
        message.success(
          t?.page?.messages?.updateSuccess || "User updated successfully",
        );
      } else {
        await createUser(payload).unwrap();
        message.success(
          t?.page?.messages?.createSuccess || "User created successfully",
        );
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting user form:", error);
      message.error(
        userEditing?.id
          ? t?.page?.messages?.updateFailed || "Failed to update user"
          : t?.page?.messages?.createFailed || "Failed to create user",
      );
    }
  };

  useEffect(() => {
    if (!activeKey && roleGroups && roleGroups.length > 0) {
      setActiveKey(roleGroups[0].name);
    }
  }, [roleGroups, activeKey]);

  return (
    <div className="h-full p-5 bg-white rounded flex flex-col">
      {open && (
        <ModalShared
          open={open}
          onCancel={closeModal}
          title={userEditing ? t.editUser : t.addUser}
          width={600}
          onOk={() => handleSubmit()}
          confirmLoading={isCreatingUser || isUpdatingUser}
          permissionKey="users"
        >
          <UserForm form={form} initialValues={userEditing || {}} />
        </ModalShared>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs
          className="flex-1 flex flex-col min-h-0 user-tabs"
          items={tabItems}
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          tabBarStyle={{ marginBottom: 12 }}
        />
      </div>
    </div>
  );
}
