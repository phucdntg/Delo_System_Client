import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useTranslate } from "@core/providers/TranslateProvider";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import { Button, message, Space } from "antd";
import TopicFormModal from "../components/TopicFormModal";
import {
  useCreateTopicMutation,
  useDeleteTopicMutation,
  useGetTopicsQuery,
  useUpdateTopicMutation,
} from "../services/topicService";

export default function EvaluationManagement() {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};

  const { open, openModal, closeModal, data: dataEditing } = useModal();
  const { pagination, searchTerm, handleSearch, handleTableChange } =
    useTable();

  const {
    data: topics,
    isLoading,
    isFetching,
  } = useGetTopicsQuery({
    pagination,
    search: "name",
    keyword: searchTerm,
  });

  const [createTopic, { isLoading: isCreating }] = useCreateTopicMutation();
  const [updateTopic, { isLoading: isUpdating }] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const handleSubmit = async (values) => {
    try {
      if (dataEditing?.id) {
        await updateTopic({
          id: dataEditing.id,
          ...values,
        }).unwrap();
        message.success(translateEval?.message?.updateSuccess);
      } else {
        await createTopic(values).unwrap();
        message.success(translateEval?.message?.createSuccess);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      message.error(
        dataEditing?.id
          ? translateEval?.message?.updateFailed
          : translateEval?.message?.createFailed,
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTopic(id).unwrap();
      message.success(translateEval?.message?.deleteSuccess);
    } catch (error) {
      console.error(error);
      message.error(translateEval?.message?.deleteFailed);
    }
  };

  const columns = [
    {
      title: translateEval?.table?.name,
      dataIndex: "name",
      key: "name",
    },
    {
      title: translateEval?.table?.description,
      dataIndex: "description",
      key: "description",
      render: (value) => value || "-",
    },
    {
      title: translateEval?.table?.status,
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? translateEval?.table?.active : translateEval?.table?.inactive,
    },
    {
      title: translateEval?.table?.actions,
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space gap={8}>
          <EditButton onEdit={() => openModal(record)} />
          <DeleteButton onDelete={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      {open && (
        <TopicFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={isCreating || isUpdating}
        />
      )}

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={topics?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: topics?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: translateEval?.search?.placeholder,
          handleSearch,
        }}
        topLeftComponent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            {commonText?.button?.create}
          </Button>
        }
      />
    </>
  );
}
