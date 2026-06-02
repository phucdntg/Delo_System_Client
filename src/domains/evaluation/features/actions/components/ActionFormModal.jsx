import { useTranslate } from "@core/providers/translate";
import ModalShared from "@shared/components/ModalShared";
import { Form, Input, InputNumber, Select, Switch, Upload } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useRef } from "react";
import { PlusOutlined } from "@ant-design/icons";

export default function ActionFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
  topics = [],
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const [form] = useForm();
  const iconFileRef = useRef(null);

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({ ...initialValue });
    } else {
      form.setFieldsValue({ isActive: true, displayOrder: 0 });
    }

    return () => {
      form.resetFields();
    };
  }, [initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        _iconFile: iconFileRef.current || null,
      });
    } catch (error) {
      if (error?.errorFields) return;
    }
  };

  const topicOptions = topics.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    const file = e?.fileList?.[0]?.originFileObj || null;
    iconFileRef.current = file;
    return e?.fileList;
  };

  return (
    <ModalShared
      title={
        initialValue
          ? translateEval?.modal?.editTitle
          : translateEval?.modal?.createTitle
      }
      open={open}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="label"
          label={translateEval?.form?.label}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.labelRequired,
            },
          ]}
        >
          <Input placeholder={translateEval?.form?.placeholder?.label} />
        </Form.Item>

        <Form.Item
          name="topicId"
          label={translateEval?.form?.topicSection}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.topicRequired,
            },
          ]}
        >
          <Select
            placeholder={translateEval?.form?.placeholder?.selectTopic}
            options={topicOptions}
          />
        </Form.Item>

        <Form.Item name="color" label={translateEval?.form?.color}>
          <Input placeholder={translateEval?.form?.placeholder?.color || "#22c55e"} />
        </Form.Item>

        <Form.Item name="displayOrder" label={translateEval?.form?.displayOrder}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label={translateEval?.form?.icon} getValueFromEvent={normFile}>
          <Upload
            key="icon-upload"
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
            accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item name="isActive" label={translateEval?.form?.isActive} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
