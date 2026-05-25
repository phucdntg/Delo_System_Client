import { Button, Tag } from "antd";
import { useState } from "react";
import { useFetchPermissionsQuery } from "../../permission";
import PermissionModal from "../../permission/components/PermissionModal";
import { useFetchRolesQuery } from "../services/roleService";

export default function RoleManagement() {
  const {
    data: roles,
    isLoading,
    error,
  } = useFetchRolesQuery({
    filters: {
      isSystem: true,
    },
  });
  const {
    data: permissions,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useFetchPermissionsQuery();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleConfirm = (ids) => {
    setSelectedPermissionIds(ids);
    setModalVisible(false);
    console.log("Selected permission ids:", ids);
  };

  return (
    <div>
      <h2>Role Management</h2>

      <div style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={openModal}>
          Chọn Permission
        </Button>
        <span style={{ marginLeft: 12 }}>
          {selectedPermissionIds.length === 0 ? (
            <Tag>Chưa có permission</Tag>
          ) : (
            <Tag color="blue">{selectedPermissionIds.length} đã chọn</Tag>
          )}
        </span>
      </div>

      <PermissionModal
        visible={modalVisible}
        selected={selectedPermissionIds}
        onCancel={closeModal}
        onConfirm={handleConfirm}
        permissions={permissions}
        loading={permissionsLoading}
        error={permissionsError}
      />
    </div>
  );
}
