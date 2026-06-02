import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useEffect, useState } from "react";

export default function EvaluationContentForm({
  form,
  type,
  fetchAreas,
  fetchAreaById,
  fetchBranches,
  fetchBranchById,
  fetchServices,
  fetchServiceById,
  selectedBranchId: parentSelectedBranchId,
  onBranchChange,
}) {
  const [selectedBranchId, setSelectedBranchId] = useState(
    parentSelectedBranchId || null,
  );

  useEffect(() => {
    setSelectedBranchId(parentSelectedBranchId || null);
  }, [parentSelectedBranchId]);

  const isEmployee = type === "employee";
  const isService = type === "service";

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

      {isEmployee && (
        <>
          <Form.Item label="Chi nhánh" name="branchId" rules={[]}>
            <SelectShared
              fetchFn={fetchBranches}
              fetchItemById={fetchBranchById}
              placeholder="Chọn chi nhánh"
              searchable={true}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={(item) => {
                const id = item?.id || null;
                setSelectedBranchId(id);
                form.setFieldValue("areaId", null);
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="areaId"
            label="Khu vực"
            rules={[
              {
                validator: () => {
                  if (!selectedBranchId)
                    return Promise.reject("Vui lòng chọn chi nhánh trước");
                  if (!form.getFieldValue("areaId"))
                    return Promise.reject("Vui lòng chọn khu vực");
                  return Promise.resolve();
                },
              },
            ]}
            getValueFromEvent={(item) => item?.id || null}
          >
            <SelectShared
              fetchFn={(page, pageSize, search) =>
                fetchAreas(page, pageSize, search, selectedBranchId)
              }
              fetchItemById={fetchAreaById}
              placeholder="Chọn khu vực"
              searchable={true}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              disabled={!selectedBranchId}
              resetKey={selectedBranchId}
            />
          </Form.Item>
        </>
      )}

      {isService && (
        <>
          <Form.Item
            label="Chi nhánh"
            name="branchId"
            rules={[]}
            getValueFromEvent={(item) => item?.id || null}
          >
            <SelectShared
              fetchFn={fetchBranches}
              fetchItemById={fetchBranchById}
              placeholder="Chọn chi nhánh"
              searchable={true}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              onChange={(item) => {
                const id = item?.id || null;
                setSelectedBranchId(id);
                form.setFieldValue("serviceId", null);
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Dịch vụ"
            name="serviceId"
            rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
            getValueFromEvent={(item) => item?.id || null}
          >
            <SelectShared
              fetchFn={(page, pageSize, search) =>
                fetchServices(page, pageSize, search, selectedBranchId)
              }
              fetchItemById={fetchServiceById}
              placeholder="Chọn dịch vụ"
              searchable={true}
              getLabel={(item) => item.name}
              getValue={(item) => item.id}
              defaultId={form.getFieldValue("serviceId")}
              value={form.getFieldValue("serviceId")}
              onChange={(item) =>
                form.setFieldValue("serviceId", item?.id || null)
              }
              style={{ width: "100%" }}
              disabled={!selectedBranchId}
              resetKey={selectedBranchId}
            />
          </Form.Item>
        </>
      )}

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
