import { useFetchBranchesQuery } from "@domains/system";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input } from "antd";

export default function FlowInfoSection({ form, selectedOrg }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Thông tin cơ bản
      </h3>

      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên flow"
          rules={[{ required: true, message: "Vui lòng nhập tên flow" }]}
        >
          <Input placeholder="Nhập tên flow" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} placeholder="Nhập mô tả (không bắt buộc)" />
        </Form.Item>

        <Form.Item
          name="branchId"
          label="Chi nhánh"
          rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
        >
          <SelectShared
            useQueryHook={useFetchBranchesQuery}
            searchField="name"
            placeholder="-- Chọn chi nhánh --"
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            resetKey={selectedOrg}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
