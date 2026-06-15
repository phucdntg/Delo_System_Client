import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers";
import { useTranslate } from "@core/providers/translate";
import { useGetTopicsQuery } from "@domains/evaluation";
import {
  useFetchBranchesQuery,
  useFetchBranchByIdQuery,
} from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Space, Tag } from "antd";
import { useMemo } from "react";
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
  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters, resetTable } =
    useTable();

  const branchId = filters?.topic?.branchId;

  const topicQueryParams = useMemo(
    () => (branchId ? { filters: { branchId } } : undefined),
    [branchId],
  );

  const {
    data: targets,
    isLoading,
    isFetching,
    refetch: refetchTargets,
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
    <div className="h-full p-5 bg-white rounded">
      {open && (
        <TargetFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={isCreating || isUpdating}
          useQueryHook={useFetchBranchesQuery}
          useItemQueryHook={useFetchBranchByIdQuery}
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
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        onReload={() => { resetTable?.(); refetchTargets?.(); }}
        search={{
          useSearch: true,
          hint: translateEval?.search?.placeholder,
          handleSearch,
        }}
        topRightComponent={
          <Space>
            <SelectShared
              style={{ width: 200 }}
              useQueryHook={useFetchBranchesQuery}
              searchField="name"
              allowClear
              placeholder={commonText?.placeholder?.selectBranch}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={(item) => {
                const newBranchId = item?.id || undefined;
                setFilters((prev) => ({
                  ...prev,
                  topic: { branchId: newBranchId },
                  topicId: undefined,
                }));
              }}
              value={filters?.topic?.branchId}
              resetKey={selectedOrg}
            />

            <SelectShared
              style={{ width: 200 }}
              useQueryHook={useGetTopicsQuery}
              queryParams={topicQueryParams}
              searchField="name"
              allowClear
              disabled={!branchId}
              placeholder={commonText?.placeholder?.selectTopic}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={(item) => {
                setFilters((prev) => ({
                  ...prev,
                  topicId: item?.id || undefined,
                }));
              }}
              value={filters?.topicId}
              resetKey={branchId}
            />
          </Space>
        }
        topLeftComponent={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            {commonText?.button?.create}
          </Button>
        }
      />
    </div>
  );
}
