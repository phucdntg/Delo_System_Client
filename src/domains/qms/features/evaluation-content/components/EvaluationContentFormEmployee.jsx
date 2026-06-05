import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function EvaluationContentFormEmployee({
  form,
  useQueryHook,
  useItemQueryHook,
  useAreaQueryHook,
  useAreaItemQueryHook,
  selectedBranchId: parentSelectedBranchId,
}) {
  const [selectedBranchId, setSelectedBranchId] = useState(
    parentSelectedBranchId || null,
  );

  const getItemLabel = useCallback((item) => item?.name || "", []);
  const getItemValue = useCallback((item) => item?.id, []);

  useEffect(() => {
    setSelectedBranchId(parentSelectedBranchId || null);
  }, [parentSelectedBranchId]);

  const areaQueryParams = useMemo(
    () => {
      const filters = {};
      if (selectedBranchId) filters.branchId = selectedBranchId;
      return { filters };
    },
    [selectedBranchId],
  );

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="content"
        label="Nội dung đánh giá"
        rules={[
          { required: true, message: "Vui lòng nhập nội dung đánh giá" },
          { max: 500, message: "Nội dung không được vượt quá 500 ký tự" },
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập nội dung đánh giá mà khách hàng có thể chọn khi chưa hài lòng hoặc không hài lòng"
        />
      </Form.Item>

      {/* Visible branch selector */}
      <Form.Item label="Chi nhánh">
        <SelectShared
          useQueryHook={useQueryHook}
          useItemQueryHook={useItemQueryHook}
          searchField="name"
          placeholder="Chọn chi nhánh"
          searchable={true}
          getLabel={getItemLabel}
          getValue={getItemValue}
          value={selectedBranchId}
          defaultId={parentSelectedBranchId}
          onChange={(item) => {
            const id = item?.id || null;
            setSelectedBranchId(id);
            form.setFieldValue("areaId", null);
          }}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item label="Khu vực">
        <SelectShared
          useQueryHook={useAreaQueryHook}
          useItemQueryHook={useAreaItemQueryHook}
          queryParams={areaQueryParams}
          placeholder="Chọn khu vực"
          searchable={true}
          getLabel={getItemLabel}
          getValue={getItemValue}
          value={form.getFieldValue("areaId")}
          defaultId={form.getFieldValue("areaId")}
          onChange={(item) => form.setFieldValue("areaId", item?.id || null)}
          style={{ width: "100%" }}
          disabled={!selectedBranchId}
          resetKey={selectedBranchId}
        />
      </Form.Item>

      <Form.Item name="areaId" hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Trạng thái"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </Form>
  );
}
