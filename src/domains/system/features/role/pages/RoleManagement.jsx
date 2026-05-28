import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers/AuthProvider";
import { useTranslate } from "@core/providers/TranslateProvider";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import TableShared from "@shared/components/TableShared";
import { Button, message, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import RoleForm from "../components/RoleForm";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useFetchRolesQuery,
  useUpdateRoleMutation,
} from "../services/roleService";

export default function RoleManagement() {
  const { selectedOrg } = useAuth();
  const { translate } = useTranslate();
  const roleText = translate("role") || {};
  const commonText = translate("common") || {};

  const [form] = useForm();
  const { open, data: dataEditing, openModal, closeModal } = useModal();
  const { pagination, handleTableChange, searchTerm, handleSearch } = useTable({
    resetKey: selectedOrg,
  });

  const {
    data: roles,
    isLoading,
    isFetching,
  } = useFetchRolesQuery({
    search: searchTerm?.length ? "name" : null,
    keyword: searchTerm,
    pagination,
    filters: {
      isSystem: false,
      organizationId: selectedOrg || "null",
    },
  });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const columns = [
    {
      key: "name",
      title: roleText?.table?.role,
      dataIndex: "name",
      width: 200,
    },
    {
      key: "branch",
      title: roleText?.table?.branch,
      dataIndex: "branchId",
      width: 200,
      render: (_, record) => record?.branch?.name || "-",
    },
    {
      key: "createdAt",
      title: roleText?.table?.createdAt,
      dataIndex: "createdAt",
      width: 200,
      render: (value) => (value ? new Date(value).toLocaleString() : "-"),
    },
    {
      key: "actions",
      title: roleText?.table?.actions || commonText?.table?.actions,
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space style={{ display: "flex", justifyContent: "center" }}>
          <EditButton onEdit={() => openModal(record)} />
          <DeleteButton onDelete={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { baseRoleId, ...rest } = values;
      const payload = {
        ...rest,
        ...(selectedOrg
          ? { organizationId: selectedOrg }
          : { organizationId: "null" }),
      };

      if (dataEditing?.id) {
        await updateRole({
          id: dataEditing.id,
          ...payload,
        }).unwrap();
        message.success(roleText?.message?.updateSuccess);
      } else {
        await createRole(payload).unwrap();
        message.success(roleText?.message?.createSuccess);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      message.error(
        dataEditing?.id
          ? roleText?.message?.updateFail
          : roleText?.message?.createFail,
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRole(id).unwrap();
      message.success(roleText?.message?.deleteSuccess);
    } catch (error) {
      console.error(error);
      message.error(roleText?.message?.deleteFail);
    }
  };

  return (
    <div>
      <ModalShared
        title={roleText?.modal?.titleBasicInfo}
        open={open}
        confirmLoading={isCreating || isUpdating}
        onOk={handleSubmit}
        onCancel={closeModal}
      >
        <RoleForm form={form} initialValue={dataEditing} />
      </ModalShared>

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        columns={columns}
        dataSource={roles?.data || []}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: roles?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: roleText?.search?.placeholder,
          handleSearch: (value) => handleSearch(value),
        }}
        topLeftComponent={
          <Button
            type="primary"
            onClick={() => openModal()}
            icon={<PlusOutlined />}
          >
            {commonText?.button?.create}
          </Button>
        }
      />
    </div>
  );
}
