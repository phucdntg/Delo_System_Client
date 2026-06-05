import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers";
import { useTranslate } from "@core/providers/translate";
import { useGetActionsQuery, useGetTopicsQuery } from "@domains/evaluation";
import { useFetchBranchesQuery } from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Space, Tag } from "antd";
import { useMemo } from "react";
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
  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters } =
    useTable();

  const branchId = filters?.["topic.branchId"];
  const topicId = filters?.topicId;

  const topicQueryParams = useMemo(
    () => (branchId ? { filters: { branchId } } : undefined),
    [branchId],
  );

  const actionQueryParams = useMemo(
    () => (topicId ? { filters: { topicId } } : undefined),
    [topicId],
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
        return record?.action?.label ? <Tag color="blue">{record.action.label}</Tag> : "-";
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
      {open && (
        <ContentFormModal
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
        dataSource={contents?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: contents?.meta?.totalItems || 0,
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
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
                  "topic.branchId": newBranchId,
                  topicId: undefined,
                  actionId: undefined,
                }));
              }}
              value={filters?.["topic.branchId"]}
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
                  actionId: undefined,
                }));
              }}
              value={filters?.topicId}
              resetKey={branchId}
            />

            <SelectShared
              style={{ width: 200 }}
              useQueryHook={useGetActionsQuery}
              queryParams={actionQueryParams}
              searchField="label"
              allowClear
              disabled={!topicId}
              placeholder={commonText?.placeholder?.selectAction}
              getLabel={(item) => item.label}
              getValue={(item) => item.id}
              onChange={(item) => {
                setFilters((prev) => ({
                  ...prev,
                  actionId: item?.id || undefined,
                }));
              }}
              value={filters?.actionId}
              resetKey={topicId}
            />
          </Space>
        }
        topLeftComponent={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            {commonText?.button?.create}
          </Button>
        }
      />
    </>
  );
}
