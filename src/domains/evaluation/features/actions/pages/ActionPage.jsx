import { PlusOutlined } from "@ant-design/icons";
import { config } from "@core/config";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useAuth } from "@core/providers";
import { useTranslate } from "@core/providers/translate";
import { useGetTopicsQuery } from "@domains/evaluation";
import { useFetchBranchesQuery } from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Image, Space, Tag } from "antd";
import { useMemo } from "react";
import ActionFormModal from "../components/ActionFormModal";
import {
  useCreateActionMutation,
  useCreateActionWithIconMutation,
  useDeleteActionMutation,
  useGetActionsQuery,
  useUpdateActionIconMutation,
  useUpdateActionMutation,
} from "../services/actionService";

export default function ActionPage() {
  const { selectedOrg } = useAuth();
  const { message: messageApi } = App.useApp();
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};

  const { open, openModal, closeModal, data: dataEditing } = useModal();
  const { pagination, searchTerm, filters, handleSearch, handleTableChange, setFilters } =
    useTable();

  const branchId = filters?.["topic.branchId"];

  const topicQueryParams = useMemo(
    () => (branchId ? { filters: { branchId } } : undefined),
    [branchId],
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
    const { _iconFile, _iconRemoved: iconRemoved, ...data } = values;

    try {
      if (isEdit) {
        if (hasFile) {
          await updateActionIcon({
            id: dataEditing.id,
            formData: _iconFile,
            ...data,
          }).unwrap();
        } else if (iconRemoved) {
          // User explicitly removed the icon — clear it on server
          await updateAction({ id: dataEditing.id, ...data, icon: "" }).unwrap();
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
        isEdit ? translateEval?.message?.updateFailed : translateEval?.message?.createFailed,
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
      render: (topicId, record) => {
        return record?.topic?.name ? <Tag color="blue">{record.topic.name}</Tag> : "-";
      },
    },
    {
      title: translateEval?.table?.branch,
      key: "branch",
      render: (record) => {
        return record?.topic?.branch?.name ? (
          <Tag color="blue">{record.topic.branch.name}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: translateEval?.table?.icon,
      dataIndex: "icon",
      key: "icon",
      render: (icon) =>
        icon ? (
          <Image
            src={`${config.baseUrl}/download/evaluation-icons/${icon}`}
            alt={icon}
            width={40}
            height={40}
            style={{ objectFit: "contain", borderRadius: 4 }}
            fallback=""
          />
        ) : (
          "-"
        ),
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
        <ActionFormModal
          open={open}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialValue={dataEditing}
          confirmLoading={false}
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
    </>
  );
}
