import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers";
import { useTranslate } from "@core/providers/translate";
import { useLazyGetTopicsQuery } from "@domains/evaluation";
import { useLazyFetchBranchesQuery } from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Space, Tag } from "antd";
import { useCallback, useRef } from "react";
import TargetFormModal from "../components/TargetFormModal";
import {
  useCreateTargetMutation,
  useDeleteTargetMutation,
  useGetTargetsQuery,
  useUpdateTargetMutation,
} from "../services/targetService";

export default function TargetPage() {
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
        topic: { branchId },
        topicId: undefined,
      }));
    },
    [setFilters],
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
      key: "topic",
      render: (record) => {
        if (!record.topicId) return "-";
        return <Tag color="blue">{record?.topic?.name || "-"}</Tag>;
      },
    },
    {
      title: translateEval?.table?.branch,
      key: "branch",
      render: (record) => {
        if (!record.topic?.branchId) return "-";
        return <Tag color="blue">{record?.topic?.branch?.name || "-"}</Tag>;
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
      <TargetFormModal
        open={open}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialValue={dataEditing}
        confirmLoading={isCreating || isUpdating}
      />

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
          <Space>
            <SelectShared
              style={{ width: 200 }}
              allowClear
              placeholder={commonText?.placeholder?.selectBranch}
              fetchFn={fetchBranchesFn}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={handleBranchChange}
              value={filters?.topic?.branchId}
              resetKey={selectedOrg}
            />

            <SelectShared
              style={{ width: 200 }}
              allowClear
              disabled={!filters?.topic?.branchId}
              placeholder={commonText?.placeholder?.selectTopic}
              fetchFn={fetchFilterTopics}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={(item) => {
                setFilters((prev) => ({
                  ...prev,
                  topicId: item?.id || undefined,
                }));
              }}
              value={filters?.topicId}
              resetKey={filters?.topic?.branchId}
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
