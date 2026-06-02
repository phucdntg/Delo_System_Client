import { PlusOutlined } from "@ant-design/icons";
import {
  useLazyFetchBranchByIdQuery,
  useLazyFetchBranchesQuery,
} from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import TableShared from "@shared/components/TableShared";
import { Button, Form, message, Modal, Space, Tag } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import EvaluationContentFormService from "../components/EvaluationContentFormService";
import { useServiceEvaluationContentManager } from "../hooks/useServiceEvaluationContentManager";
import {
  useLazyFetchServiceByIdQuery,
  useLazyFetchServicesQuery,
} from "../services/serviceService";

export default function ServiceEvaluationTab() {
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
    selectedBranchId,
    selectedServiceId,
    page,
    pageSize,
    handlePageChange,
    handleSearch,
    handleBranchChange,
    handleServiceChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
  } = useServiceEvaluationContentManager();

  // RTK Query lazy hooks for SelectShared
  const [triggerFetchBranches] = useLazyFetchBranchesQuery();
  const [triggerFetchBranchById] = useLazyFetchBranchByIdQuery();
  const [triggerFetchServices] = useLazyFetchServicesQuery();
  const [triggerFetchServiceById] = useLazyFetchServiceByIdQuery();

  // Create service map for display
  const [serviceMap, setServiceMap] = useState({});

  // Fetch services when data changes to build service map
  useEffect(() => {
    const fetchServiceNames = async () => {
      const serviceIds = [...new Set(dataSource.map((item) => item.serviceId))];
      const missingIds = serviceIds.filter(
        (id) => id && !serviceMap[id]
      );

      if (missingIds.length === 0) return;

      try {
        const results = await Promise.all(
          missingIds.map((id) =>
            triggerFetchServiceById(id).unwrap().catch((err) => {
              console.error(`Error fetching service ${id}:`, err);
              return null;
            })
          )
        );

        const newMap = { ...serviceMap };
        results.forEach((result, index) => {
          if (result) {
            newMap[missingIds[index]] = result;
          }
        });
        setServiceMap(newMap);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServiceNames();
  }, [dataSource, serviceMap, triggerFetchServiceById]);

  // Fetch branches for SelectShared
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

  // Fetch services for SelectShared
  const fetchServices = useCallback(
    async (page, pageSize, search, branchIdOverride = null) => {
      const filters = {};
      const branchId = branchIdOverride ?? selectedBranchId;
      if (branchId) filters.branchId = branchId;
      if (search) filters.name = search;

      const result = await triggerFetchServices({
        page,
        limit: pageSize,
        filters,
      }).unwrap();

      return result;
    },
    [selectedBranchId, triggerFetchServices],
  );

  const fetchServiceById = useCallback(
    async (id) => {
      const result = await triggerFetchServiceById(id).unwrap();
      return result;
    },
    [triggerFetchServiceById],
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
        serviceId: record.serviceId,
        isActive: record.isActive,
      });

      // Fetch service to get branchId for filtering
      try {
        if (record.serviceId) {
          const service = await triggerFetchServiceById(record.serviceId).unwrap();
          const branchId = service?.branchId ?? selectedBranchId ?? null;
          setModalBranchId(branchId);
        } else {
          setModalBranchId(selectedBranchId || null);
        }
      } catch (error) {
        console.error("Failed to fetch service for edit modal:", error);
        setModalBranchId(selectedBranchId || null);
      }

      setModalKey((prev) => prev + 1);
      setIsModalOpen(true);
    },
    [form, triggerFetchServiceById, selectedBranchId],
  );

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setModalBranchId(null);
    form.resetFields();
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
      Modal.confirm({
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
        title: "Dịch vụ",
        dataIndex: "serviceId",
        key: "service",
        width: 200,
        render: (serviceId) => {
          const service = serviceMap[serviceId];
          return service ? (
            <Tag color="cyan">{service.name}</Tag>
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
    [page, pageSize, serviceMap, handleOpenEdit, handleDeleteRecord],
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
              fetchFn={(page, pageSize, search) =>
                fetchServices(page, pageSize, search, selectedBranchId)
              }
              fetchItemById={fetchServiceById}
              placeholder="Lọc theo dịch vụ"
              searchable={true}
              getLabel={getItemLabel}
              getValue={getItemValue}
              value={selectedServiceId}
              onChange={(item) => handleServiceChange(item?.id || null)}
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
            ? "Chỉnh sửa nội dung đánh giá dịch vụ"
            : "Thêm mới nội dung đánh giá dịch vụ"
        }
        okText={editingRecord ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={isCreating || isUpdating}
      >
        <EvaluationContentFormService
          key={modalKey}
          form={form}
          type="service"
          fetchBranches={fetchBranches}
          fetchBranchById={fetchBranchById}
          fetchServices={fetchServices}
          fetchServiceById={fetchServiceById}
          selectedBranchId={modalBranchId}
        />
      </ModalShared>
    </div>
  );
}
