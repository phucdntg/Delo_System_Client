import { PlusOutlined } from "@ant-design/icons";
import {
  useFetchAreasQuery,
  useLazyFetchAreaByIdQuery,
  useLazyFetchAreasQuery,
  useLazyFetchBranchByIdQuery,
  useLazyFetchBranchesQuery,
} from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { App, Button, Form, Space, Tag } from "antd";
import { useCallback, useMemo, useState } from "react";
import EvaluationContentFormEmployee from "../components/EvaluationContentFormEmployee";
import { useEmployeeEvaluationContentManager } from "../hooks/useEmployeeEvaluationContentManager";

export default function EmployeeEvaluationTab() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalBranchId, setModalBranchId] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const {
    dataSource,
    meta,
    isLoading,
    isFetching,
    searchContent,
    selectedAreaId,
    selectedBranchId,
    page,
    pageSize,
    handlePageChange,
    handleSearch,
    handleAreaChange,
    handleBranchChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
  } = useEmployeeEvaluationContentManager();

  // Fetch areas for filter
  const { data: areasResponse } = useFetchAreasQuery({
    page: 1,
    limit: 1000,
  });

  const areas = useMemo(() => areasResponse?.data ?? [], [areasResponse?.data]);

  const areaMap = useMemo(() => {
    const map = {};
    areas.forEach((area) => {
      map[area.id] = area;
    });
    return map;
  }, [areas]);

  const [triggerFetchAreas] = useLazyFetchAreasQuery();
  const [triggerFetchAreaById] = useLazyFetchAreaByIdQuery();
  const [triggerFetchBranches] = useLazyFetchBranchesQuery();
  const [triggerFetchBranchById] = useLazyFetchBranchByIdQuery();

  // Fetch areas for SelectShared
  const fetchAreas = useCallback(
    async (page, pageSize, search, branchIdOverride = null) => {
      const filters = {};
      if (search) filters.name = search;
      const branchId = branchIdOverride ?? selectedBranchId;
      if (branchId) filters.branchId = branchId;

      const result = await triggerFetchAreas({
        page,
        limit: pageSize,
        filters,
      }).unwrap();

      return result;
    },
    [triggerFetchAreas, selectedBranchId],
  );

  const fetchAreaById = useCallback(
    async (id) => {
      const result = await triggerFetchAreaById(id).unwrap();
      return result;
    },
    [triggerFetchAreaById],
  );

  const fetchBranches = useCallback(
    async (page, pageSize, search) => {
      const filters = {};
      if (search) filters.name = search;

      const result = await triggerFetchBranches({
        page,
        limit: pageSize,
        filters,
      }).unwrap();

      return result;
    },
    [triggerFetchBranches],
  );

  const fetchBranchById = useCallback(
    async (id) => {
      const result = await triggerFetchBranchById(id).unwrap();
      return result;
    },
    [triggerFetchBranchById],
  );

  // Memoized getters for SelectShared to prevent infinite loop
  const getItemLabel = useCallback((item) => item?.name || "", []);
  const getItemValue = useCallback((item) => item?.id, []);

  // Open modal for create
  const handleOpenCreate = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    setModalBranchId(null); // Form starts empty, independent of table filter
    setModalKey((prev) => prev + 1);
    setIsModalOpen(true);
  }, [form]);

  // Open modal for edit
  const handleOpenEdit = useCallback(
    async (record) => {
      setEditingRecord(record);
      form.setFieldsValue({
        content: record.content,
        areaId: record.areaId,
        isActive: record.isActive,
      });
      try {
        if (record.areaId) {
          const res = await triggerFetchAreaById(record.areaId).unwrap();
          const branchId = res?.branchId ?? selectedBranchId ?? null;
          setModalBranchId(branchId);
        } else {
          setModalBranchId(selectedBranchId || null);
        }
      } catch (err) {
        console.error("Failed to fetch area for edit modal", err);
        setModalBranchId(selectedBranchId || null);
      }

      setModalKey((prev) => prev + 1);
      setIsModalOpen(true);
    },
    [form, triggerFetchAreaById, selectedBranchId],
  );

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
    setModalBranchId(null);
  }, [form]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (editingRecord) {
        await handleUpdate(editingRecord.id, values);
        message.success("Cập nhật nội dung đánh giá thành công");
      } else {
        await handleCreate(values);
        message.success("Tạo nội dung đánh giá thành công");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.errorFields) {
        // Validation error - do nothing, form will show errors
        return;
      }
      message.error(
        editingRecord
          ? "Cập nhật nội dung đánh giá thất bại"
          : "Tạo nội dung đánh giá thất bại",
      );
    }
  }, [form, editingRecord, handleCreate, handleUpdate, handleCloseModal]);

  // Delete handler
  const handleDeleteRecord = useCallback(
    async (record) => {
      modal.confirm({
        title: "Xác nhận xóa",
        content: `Bạn có chắc chắn muốn xóa nội dung đánh giá "${record.content}"?`,
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await handleDelete(record.id);
            message.success("Xóa nội dung đánh giá thành công");
          } catch (error) {
            console.error("Error deleting record:", error);
            message.error("Xóa nội dung đánh giá thất bại");
          }
        },
      });
    },
    [handleDelete],
  );

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        width: 60,
        align: "center",
        render: (_, __, index) => (page - 1) * pageSize + index + 1,
      },
      {
        title: "Nội dung đánh giá",
        dataIndex: "content",
        key: "content",
        width: 300,
      },
      {
        title: "Khu vực",
        dataIndex: "areaId",
        key: "area",
        width: 200,
        render: (areaId) => {
          const area = areaMap[areaId];
          return area ? (
            <Tag color="green">{area.name}</Tag>
          ) : (
            <Tag color="default">Không xác định</Tag>
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "isActive",
        key: "isActive",
        width: 120,
        align: "center",
        render: (isActive) =>
          isActive ? (
            <Tag color="success">Hoạt động</Tag>
          ) : (
            <Tag color="default">Không hoạt động</Tag>
          ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Space size="small">
            <EditButton onClick={() => handleOpenEdit(record)} />
            <DeleteButton onClick={() => handleDeleteRecord(record)} />
          </Space>
        ),
      },
    ],
    [page, pageSize, areaMap, handleOpenEdit, handleDeleteRecord],
  );

  return (
    <div>
      <TableShared
        dataSource={dataSource}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: meta.totalItems || 0,
          onChange: handlePageChange,
        }}
        search={{
          useSearch: true,
          hint: "Tìm kiếm theo nội dung đánh giá",
          handleSearch: handleSearch,
        }}
        topRightComponent={
          <Space>
            <SelectShared
              fetchFn={fetchBranches}
              fetchItemById={fetchBranchById}
              placeholder="Lọc theo chi nhánh"
              searchable={true}
              getLabel={getItemLabel}
              getValue={getItemValue}
              value={selectedBranchId}
              onChange={(item) => handleBranchChange(item?.id || null)}
              style={{ width: 200 }}
              allowClear
            />

            <SelectShared
              fetchFn={fetchAreas}
              fetchItemById={fetchAreaById}
              placeholder="Lọc theo khu vực"
              searchable={true}
              getLabel={getItemLabel}
              getValue={getItemValue}
              value={selectedAreaId}
              onChange={(item) => handleAreaChange(item?.id || null)}
              style={{ width: 200 }}
              allowClear
              resetKey={selectedBranchId}
              disabled={!selectedBranchId}
            />
          </Space>
        }
        topLeftComponent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Thêm mới
          </Button>
        }
      />

      <ModalShared
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        title={
          editingRecord
            ? "Chỉnh sửa nội dung đánh giá nhân viên"
            : "Thêm mới nội dung đánh giá nhân viên"
        }
        okText={editingRecord ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={isCreating || isUpdating}
      >
        <EvaluationContentFormEmployee
          key={modalKey}
          form={form}
          fetchAreas={fetchAreas}
          fetchAreaById={fetchAreaById}
          fetchBranches={fetchBranches}
          fetchBranchById={fetchBranchById}
          selectedBranchId={modalBranchId}
        />
      </ModalShared>
    </div>
  );
}
