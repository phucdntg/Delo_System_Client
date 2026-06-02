import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useTranslate } from "@core/providers/translate";
import { useGetTopicsQuery } from "@domains/evaluation";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import { App, Button, Select, Space, Tag } from "antd";
import { useMemo } from "react";
import TargetFormModal from "../components/TargetFormModal";
import {
  useCreateTargetMutation,
  useDeleteTargetMutation,
  useGetTargetsQuery,
  useUpdateTargetMutation,
} from "../services/targetService";

export default function TargetPage() {
  const { message: messageApi } = App.useApp();
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};

  const { open, openModal, closeModal, data: dataEditing } = useModal();
  const {
    pagination,
    searchTerm,
    filters,
    handleSearch,
    handleTableChange,
    setFilters,
  } = useTable();

  const { data: topicsData } = useGetTopicsQuery({
    pagination: { current: 1, pageSize: 10 },
  });

  const topicOptions = useMemo(
    () =>
      (topicsData?.data || []).map((t) => ({
        label: t.name,
        value: t.id,
      })),
    [topicsData],
  );

  const {
    data: targets,
    isLoading,
    isFetching,
  } = useGetTargetsQuery({
    pagination,
    search: searchTerm ? "name" : null,
    keyword: searchTerm,
    filters,
  });

  const [createTarget, { isLoading: isCreating }] = useCreateTargetMutation();
  const [updateTarget, { isLoading: isUpdating }] = useUpdateTargetMutation();
  const [deleteTarget] = useDeleteTargetMutation();

  const handleSubmit = async (values) => {
    try {
      if (dataEditing?.id) {
        await updateTarget({ id: dataEditing.id, ...values }).unwrap();
        messageApi.success(translateEval?.message?.updateSuccess);
      } else {
        await createTarget(values).unwrap();
        messageApi.success(translateEval?.message?.createSuccess);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      messageApi.error(
        dataEditing?.id
          ? translateEval?.message?.updateFailed
          : translateEval?.message?.createFailed,
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTarget(id).unwrap();
      messageApi.success(translateEval?.message?.deleteSuccess);
    } catch (error) {
      console.error(error);
      messageApi.error(translateEval?.message?.deleteFailed);
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
      title: translateEval?.table?.topic,
      dataIndex: "topicId",
      key: "topic",
      render: (topicId) => {
        const topic = topicsData?.data?.find((t) => t.id === topicId);
        return topic ? <Tag color="blue">{topic.name}</Tag> : "-";
      },
    },
    {
      title: translateEval?.table?.status,
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">{commonText?.status?.active || "Active"}</Tag>
        ) : (
          <Tag color="red">{commonText?.status?.inactive || "Inactive"}</Tag>
        ),
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
        <TargetFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={isCreating || isUpdating}
          topics={topicsData?.data || []}
        />
      )}

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={targets?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: targets?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: translateEval?.search?.placeholder,
          handleSearch,
        }}
        topRightComponent={
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder={
              translateEval?.filter?.topic || "-- Lọc theo chủ đề --"
            }
            options={topicOptions}
            onChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                topicId: value || undefined,
              }));
            }}
            value={filters?.topicId}
          />
        }
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
