import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import { useGetTopicsQuery, useLazyGetActionsQuery } from "@domains/evaluation";
import { App, Button, Select, Space, Tag } from "antd";
import { useMemo, useCallback, useState } from "react";
import ContentFormModal from "../components/ContentFormModal";
import {
  useCreateContentMutation,
  useDeleteContentMutation,
  useGetContentsQuery,
  useUpdateContentMutation,
} from "../services/contentService";

export default function ContentPage() {
  const { message: messageApi } = App.useApp();
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};

  const { open, openModal, closeModal, data: dataEditing } = useModal();
  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters } =
    useTable();

  // Fetch topics for filter
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

  // Fetch actions lazily based on selected topic
  const [triggerFetchActions] = useLazyGetActionsQuery();
  const [actionOptions, setActionOptions] = useState([]);

  const handleTopicChange = useCallback(
    async (topicId) => {
      setFilters((prev) => ({
        ...prev,
        topicId: topicId || undefined,
        actionId: undefined,
      }));
      if (topicId) {
        try {
          const res = await triggerFetchActions({
            pagination: { current: 1, pageSize: 1000 },
            filters: { topicId },
          }).unwrap();
          setActionOptions(
            (res.data || []).map((a) => ({ label: a.label, value: a.id })),
          );
        } catch {
          setActionOptions([]);
        }
      } else {
        setActionOptions([]);
      }
    },
    [triggerFetchActions, setFilters],
  );

  const {
    data: contents,
    isLoading,
    isFetching,
  } = useGetContentsQuery({
    pagination,
    search: searchTerm ? "content" : null,
    keyword: searchTerm,
    filters,
  });

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [deleteContent] = useDeleteContentMutation();

  const handleSubmit = async (values) => {
    try {
      if (dataEditing?.id) {
        await updateContent({ id: dataEditing.id, ...values }).unwrap();
        messageApi.success(translateEval?.message?.updateSuccess);
      } else {
        await createContent(values).unwrap();
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
      await deleteContent(id).unwrap();
      messageApi.success(translateEval?.message?.deleteSuccess);
    } catch (error) {
      console.error(error);
      messageApi.error(translateEval?.message?.deleteFailed);
    }
  };

  const columns = [
    {
      title: translateEval?.table?.content,
      dataIndex: "content",
      key: "content",
    },
    {
      title: translateEval?.table?.action,
      dataIndex: "actionId",
      key: "action",
      render: () => "-",
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
        <ContentFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={isCreating || isUpdating}
          topicOptions={topicOptions}
        />
      )}

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={contents?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: contents?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: translateEval?.search?.placeholder,
          handleSearch,
        }}
        topRightComponent={
          <Space>
            <Select
              allowClear
              style={{ width: 200 }}
              placeholder={translateEval?.filter?.topic || "-- Lọc theo chủ đề --"}
              options={topicOptions}
              onChange={handleTopicChange}
              value={filters?.topicId}
            />
            <Select
              allowClear
              style={{ width: 200 }}
              placeholder={translateEval?.filter?.action || "-- Lọc theo hành động --"}
              options={actionOptions}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  actionId: value || undefined,
                }));
              }}
              value={filters?.actionId}
            />
          </Space>
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
