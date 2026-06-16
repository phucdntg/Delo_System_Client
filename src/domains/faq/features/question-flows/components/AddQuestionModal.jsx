import ModalShared from "@shared/components/ModalShared";
import { Form, Input, Select, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect } from "react";

const NODE_TYPES = [
  { value: "question", label: "question" },
  { value: "sub_question", label: "sub_question" },
  { value: "info_screen", label: "info_screen" },
];

export default function AddQuestionModal({
  open,
  onClose,
  onSubmit,
  questions,
  initialValue,
}) {
  const [form] = useForm();

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue(initialValue);
    } else {
      form.setFieldsValue({
        nodeType: "question",
        isTerminal: false,
        parentRef: null,
      });
    }
    return () => form.resetFields();
  }, [initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {
      if (err?.errorFields) return;
    }
  };

  // Lọc ra các question có thể làm parent
  const parentOptions = (questions || [])
    .filter((q) => !q.isTerminal)
    .map((q) => ({
      label: `${q.ref || ""}: ${q.title || "(Chưa có tiêu đề)"}`,
      value: q.ref,
    }));

  return (
    <ModalShared
      title={initialValue ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="parentRef" label="Câu hỏi cha">
          <Select
            allowClear
            placeholder="(Bỏ trống = root question)"
            options={parentOptions}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề câu hỏi" }]}
        >
          <Input placeholder="Nhập tiêu đề câu hỏi" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} placeholder="Nhập mô tả (không bắt buộc)" />
        </Form.Item>

        <Form.Item name="nodeType" label="Loại node">
          <Select options={NODE_TYPES} />
        </Form.Item>

        <Form.Item name="isTerminal" label="Terminal" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
