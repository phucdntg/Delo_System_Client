import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers/AuthProvider";
import { useTranslate } from "@core/providers/TranslateProvider";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import TableShared from "@shared/components/TableShared";
import { Button, message, Space, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import AreaForm from "../components/AreaForm";
import {
  useCreateAreaMutation,
  useDeleteAreaMutation,
  useFetchAreasQuery,
  useUpdateAreaMutation,
} from "../services/areaService";

export default function AreaManagement() {
  const { selectedOrg } = useAuth();
  const { translate } = useTranslate();
  const areaText = translate("area") || {};
  const commonText = translate("common") || {};

  const [form] = useForm();
  const { open, data: dataEditing, openModal, closeModal } = useModal();
  const { pagination, handleTableChange, searchTerm, handleSearch } = useTable({
    resetKey: selectedOrg,
  });

  const {
    data: areas,
    isLoading,
    isFetching,
  } = useFetchAreasQuery({
    search: searchTerm.length > 0 ? "name" : null,
    keyword: searchTerm,
    pagination,
  });

  const [createArea, { isLoading: isCreating }] = useCreateAreaMutation();
  const [updateArea, { isLoading: isUpdating }] = useUpdateAreaMutation();
  const [deleteArea] = useDeleteAreaMutation();

  const columns = [
    {
      key: "name",
      title: areaText?.table?.name,
      dataIndex: "name",
      width: 200,
    },
    {
      key: "branch",
      title: areaText?.table?.branch,
      dataIndex: "branchId",
      width: 200,
      render: (_, record) => record?.branch?.name || "",
    },
    {
      key: "description",
      title: areaText?.table?.description,
      dataIndex: "description",
      width: 300,
    },
    {
      key: "status",
      title: areaText?.table?.status,
      dataIndex: "isActive",
      width: 150,
      render: (isActive) =>
        isActive ? (
          <Tag color="green">{commonText?.status?.active}</Tag>
        ) : (
          <Tag color="red">{commonText?.status?.inactive}</Tag>
        ),
    },
    {
      key: "actions",
      title: areaText?.table?.actions,
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space style={{ display: "flex", justifyContent: "center" }}>
          <EditButton onEdit={() => openModal(record)} />
          <DeleteButton onDelete={() => deleteArea(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!dataEditing?.id) {
        await createArea(values).unwrap();
        message.success(areaText?.message?.createSuccess);
      } else {
        await updateArea({ id: dataEditing.id, ...values }).unwrap();
        message.success(areaText?.message?.updateSuccess);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      message.error(
        !dataEditing?.id
          ? areaText?.message?.createFailed
          : areaText?.message?.updateFailed,
      );
    }
  };

  return (
    <div>
      <ModalShared
        title={
          dataEditing?.id ? areaText?.form?.editTitle : areaText?.form?.addTitle
        }
        open={open}
        confirmLoading={isCreating || isUpdating}
        onOk={handleSubmit}
        onCancel={closeModal}
      >
        <AreaForm form={form} initialValue={dataEditing} />
      </ModalShared>

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        columns={columns}
        dataSource={areas?.data || []}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: areas?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: areaText?.search?.placeholder,
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
