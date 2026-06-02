import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Space, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import BranchForm from "../components/BranchForm";
import {
  useCreateBranchMutation,
  useDeleteBranchMutation,
  useFetchBranchesQuery,
  useUpdateBranchMutation,
} from "../services/branchService";

export default function BranchManagement() {
  const { message } = App.useApp();
  const { selectedOrg } = useAuth();
  const { translate } = useTranslate();
  const translateBranchPage = translate("branch") || {};

  const [form] = useForm();
  const { open, data: dataEditing, openModal, closeModal } = useModal();
  const { pagination, handleTableChange, searchTerm, handleSearch } = useTable({
    resetKey: selectedOrg,
  });

  const { data, isLoading, isFetching } = useFetchBranchesQuery({
    search: searchTerm.length > 0 ? "name,address" : null,
    keyword: searchTerm,
    pagination: pagination,
  });

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const columns = [
    // { key: "id", title: "ID", dataIndex: "id", width: 100 },
    {
      key: "name",
      title: translateBranchPage?.table?.name,
      dataIndex: "name",
      width: 300,
      textWrap: "word-break",
    },
    {
      key: "address",
      title: translateBranchPage?.table?.address,
      dataIndex: "address",
      width: 400,
      textWrap: "word-break",
    },
    {
      key: "phoneNumber",
      title: translateBranchPage?.table?.phoneNumber,
      dataIndex: "phoneNumber",
      width: 200,
    },
    {
      key: "status",
      title: translateBranchPage?.table?.status,
      dataIndex: "isActive",
      width: 150,
      render: (isActive) =>
        isActive ? (
          <Tag color="green">{translate("common.status.active")}</Tag>
        ) : (
          <Tag color="red">{translate("common.status.inactive")}</Tag>
        ),
    },
    {
      key: "actions",
      title: translate("common")?.table?.actions,
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space style={{ display: "flex", justifyContent: "center" }}>
          <EditButton onEdit={() => openModal(record)} />
          <DeleteButton onDelete={() => deleteBranch(record?.id)} />
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (dataEditing?.id) {
        await updateBranch({ id: dataEditing.id, ...values }).unwrap();
        message.success(translateBranchPage?.message?.updateSuccess);
      } else {
        await createBranch({ ...values }).unwrap();
        message.success(translateBranchPage?.message?.createSuccess);
      }

      closeModal();
      form.resetFields();
    } catch (error) {
      message.error(
        dataEditing?.id
          ? translateBranchPage?.message?.updateFailed
          : translateBranchPage?.message?.createFailed,
      );
      console.log("Failed with error:", error);
    }
  };

  return (
    <div>
      <ModalShared
        title={
          dataEditing?.id
            ? translateBranchPage?.modal?.editTitle
            : translateBranchPage?.modal?.addTitle
        }
        open={open}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={isCreating || isUpdating}
      >
        <BranchForm form={form} initialValue={dataEditing} />
      </ModalShared>

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={data?.data || []}
        columns={columns}
        search={{
          useSearch: true,
          hint: translateBranchPage?.search?.placeholder,
          handleSearch: (v) => handleSearch(v),
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        topLeftComponent={
          <>
            <Button
              type="primary"
              onClick={() => openModal()}
              icon={<PlusOutlined />}
            >
              {translate("common.button")?.create}
            </Button>
          </>
        }
      />
    </div>
  );
}
