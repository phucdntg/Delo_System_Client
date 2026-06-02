import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import { useGetTopicsQuery } from "@domains/evaluation";
import { App, Button, Select, Space, Tag } from "antd";
import { useMemo } from "react";
import ActionFormModal from "../components/ActionFormModal";
import {
  useCreateActionMutation,
  useCreateActionWithIconMutation,
  useDeleteActionMutation,
  useGetActionsQuery,
  useUpdateActionMutation,
  useUpdateActionIconMutation,
} from "../services/actionService";

export default function ActionPage() {
  const { message: messageApi } = App.useApp();
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};

  const { open, openModal, closeModal, data: dataEditing } = useModal();
  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters } =
    useTable();

  const { data: topicsData } = useGetTopicsQuery({
    pagination: { current: 1, pageSize: 1000 },
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
    data: actions,
    isLoading,
    isFetching,
  } = useGetActionsQuery({
    pagination,
    search: searchTerm ? "label" : null,
    keyword: searchTerm,
    filters,
  });

  const [createAction] = useCreateActionMutation();
  const [createActionWithIcon] = useCreateActionWithIconMutation();
  const [updateAction] = useUpdateActionMutation();
  const [updateActionIcon] = useUpdateActionIconMutation();
  const [deleteAction] = useDeleteActionMutation();

  const handleSubmit = async (values) => {
    const isEdit = !!dataEditing?.id;
    const hasFile = values._iconFile instanceof File;
    const { _iconFile, ...data } = values;

    try {
      if (isEdit) {
        if (hasFile) {
          await updateActionIcon({ id: dataEditing.id, formData: _iconFile, ...data }).unwrap();
        } else {
          await updateAction({ id: dataEditing.id, ...data }).unwrap();
        }
        messageApi.success(translateEval?.message?.updateSuccess);
      } else {
        if (hasFile) {
          await createActionWithIcon({ formData: _iconFile, ...data }).unwrap();
        } else {
          await createAction(data).unwrap();
        }
        messageApi.success(translateEval?.message?.createSuccess);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      messageApi.error(
        isEdit
          ? translateEval?.message?.updateFailed
          : translateEval?.message?.createFailed,
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAction(id).unwrap();
      messageApi.success(translateEval?.message?.deleteSuccess);
    } catch (error) {
      console.error(error);
      messageApi.error(translateEval?.message?.deleteFailed);
    }
  };

  const columns = [
    {
      title: translateEval?.table?.label,
      dataIndex: "label",
      key: "label",
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
      title: translateEval?.table?.icon,
      dataIndex: "icon",
      key: "icon",
      render: (icon) => icon || "-",
    },
    {
      title: translateEval?.table?.color,
      dataIndex: "color",
      key: "color",
      render: (color) =>
        color ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: color,
              }}
            />
            {color}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: translateEval?.table?.displayOrder,
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 100,
    },
    {
      title: translateEval?.table?.status,
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value
          ? <Tag color="green">{commonText?.status?.active || "Active"}</Tag>
          : <Tag color="red">{commonText?.status?.inactive || "Inactive"}</Tag>,
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
        <ActionFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={false}
          topics={topicsData?.data || []}
        />
      )}

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={actions?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: actions?.meta?.totalItems || 0,
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
            placeholder={translateEval?.filter?.topic || "-- Lọc theo chủ đề --"}
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
