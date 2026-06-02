import { useTranslate } from "@core/providers/TranslateProvider";
import ModalShared from "@shared/components/ModalShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect } from "react";

export default function TopicFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const [form] = useForm();

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({ ...initialValue });
    } else {
      form.setFieldsValue({ isActive: true });
    }

    return () => {
      form.resetFields();
    };
  }, [initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      if (error?.errorFields) return;
    }
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
          name="name"
          label={translateEval?.form?.topic?.name}
          rules={[
            {
              required: true,
              message: translateEval?.form?.topic?.validation?.nameRequired,
            },
          ]}
        >
          <Input placeholder={translateEval?.form?.topic?.placeholder?.name} />
        </Form.Item>

        <Form.Item
          name="description"
          label={translateEval?.form?.topic?.description}
        >
          <Input.TextArea
            rows={4}
            placeholder={translateEval?.form?.topic?.placeholder?.description}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={translateEval?.form?.topic?.isActive}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
