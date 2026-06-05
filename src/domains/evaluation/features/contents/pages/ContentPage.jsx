import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers";
import { useTranslate } from "@core/providers/translate";
import {
  useLazyGetActionsQuery,
  useLazyGetTopicsQuery,
} from "@domains/evaluation";
import { useLazyFetchBranchesQuery } from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Space, Tag } from "antd";
import { useCallback, useRef } from "react";
import ContentFormModal from "../components/ContentFormModal";
import {
  useCreateContentMutation,
  useDeleteContentMutation,
  useGetContentsQuery,
  useUpdateContentMutation,
} from "../services/contentService";

export default function ContentPage() {
  const { selectedOrg } = useAuth();
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

  // ─── Branch filter ──────────────────────────────────────────────────
  const [fetchBranches] = useLazyFetchBranchesQuery();

  const fetchBranchesFn = useCallback(
    async (page, pageSize, query) => {
      try {
        return await fetchBranches({
          keyword: query,
          pagination: { current: page, pageSize },
          search: query ? "name" : null,
        }).unwrap();
      } catch (err) {
        console.error("fetchBranchesFn failed", err);
        return { data: [], meta: { totalPages: 0 } };
      }
    },
    [fetchBranches],
  );

  // ─── Topic filter (scoped by branch) ────────────────────────────────
  const [triggerFetchTopics] = useLazyGetTopicsQuery();
  const branchFilterIdRef = useRef();

  const fetchFilterTopics = useCallback(
    async (page, pageSize, query) => {
      if (!branchFilterIdRef.current) {
        return { data: [], meta: { totalPages: 0 } };
      }
      try {
        return await triggerFetchTopics({
          pagination: { current: page, pageSize },
          search: query ? "name" : null,
          keyword: query,
          filters: { branchId: branchFilterIdRef.current },
        }).unwrap();
      } catch (err) {
        console.error("fetchFilterTopics failed", err);
        return { data: [], meta: { totalPages: 0 } };
      }
    },
    [triggerFetchTopics],
  );

  const handleBranchChange = useCallback(
    (branch) => {
      const branchId = branch?.id || undefined;
      branchFilterIdRef.current = branchId;
      setFilters((prev) => ({
        ...prev,
        "topic.branchId": branchId,
        topicId: undefined,
        actionId: undefined,
      }));
    },
    [setFilters],
  );

  // ─── Action filter (scoped by selected topic) ────────────────────────
  const [triggerFetchActions] = useLazyGetActionsQuery();
  const topicFilterIdRef = useRef();

  const fetchFilterActions = useCallback(
    async (page, pageSize, query) => {
      if (!topicFilterIdRef.current) {
        return { data: [], meta: { totalPages: 0 } };
      }
      try {
        return await triggerFetchActions({
          pagination: { current: page, pageSize },
          search: query ? "label" : null,
          keyword: query,
          filters: { topicId: topicFilterIdRef.current },
        }).unwrap();
      } catch (err) {
        console.error("fetchFilterActions failed", err);
        return { data: [], meta: { totalPages: 0 } };
      }
    },
    [triggerFetchActions],
  );

  const handleTopicChange = useCallback(
    (item) => {
      const topicId = item?.id || undefined;
      topicFilterIdRef.current = topicId;
      setFilters((prev) => ({
        ...prev,
        topicId,
        actionId: undefined,
      }));
    },
    [setFilters],
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
      render: (actionId, record) => {
        return record?.action?.label ? (
          <Tag color="blue">{record.action.label}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: translateEval?.table?.topic,
      key: "topic",
      render: (record) => {
        return record?.action?.topic?.name ? (
          <Tag color="blue">{record.action.topic.name}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: translateEval?.table?.branch,
      key: "branch",
      render: (record) => {
        return record?.action?.topic?.branch?.name ? (
          <Tag color="blue">{record.action.topic.branch.name}</Tag>
        ) : (
          "-"
        );
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
      <ContentFormModal
        open={open}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialValue={dataEditing}
        confirmLoading={isCreating || isUpdating}
      />

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
            <SelectShared
              style={{ width: 200 }}
              allowClear
              placeholder={commonText?.placeholder?.selectBranch}
              fetchFn={fetchBranchesFn}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={handleBranchChange}
              value={filters?.["topic.branchId"]}
              resetKey={selectedOrg}
            />

            <SelectShared
              style={{ width: 200 }}
              allowClear
              disabled={!filters?.["topic.branchId"]}
              placeholder={commonText?.placeholder?.selectTopic}
              fetchFn={fetchFilterTopics}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={handleTopicChange}
              value={filters?.topicId}
              resetKey={filters?.["topic.branchId"]}
            />

            <SelectShared
              style={{ width: 200 }}
              allowClear
              disabled={!filters?.topicId}
              placeholder={commonText?.placeholder?.selectAction}
              fetchFn={fetchFilterActions}
              getLabel={(item) => item.label}
              getValue={(item) => item.id}
              onChange={(item) => {
                setFilters((prev) => ({
                  ...prev,
                  actionId: item?.id || undefined,
                }));
              }}
              value={filters?.actionId}
              resetKey={filters?.topicId}
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
