import { Form, Input, Switch } from "antd";
import { useLayoutEffect } from "react";
import { useTranslate } from "../../../../../core/providers/TranslateProvider";

const BranchForm = ({ form, initialValue }) => {
  const { translate } = useTranslate();
  const translateBranch = translate("branch") || {};

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({
        isActive: true,
        ...initialValue,
      });
    }

    return () => {
      form.resetFields();
    };
  }, [initialValue, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label={translateBranch?.form?.name}
        rules={[
          {
            required: true,
            message: translateBranch?.form?.validation?.nameRequired,
          },
        ]}
      >
        <Input placeholder={translateBranch?.form?.placeholder?.name} />
      </Form.Item>

      <Form.Item
        name="address"
        label={translateBranch?.form?.address}
        rules={[
          {
            required: true,
            message: translateBranch?.form?.validation?.addressRequired,
          },
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder={translateBranch?.form?.placeholder?.address}
        />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label={translateBranch?.form?.phoneNumber}
        rules={[
          {
            required: true,
            message: translateBranch?.form?.validation?.phoneRequired,
          },
        ]}
      >
        <Input placeholder={translateBranch?.form?.placeholder?.phoneNumber} />
      </Form.Item>

      <Form.Item
        name="isActive"
        label={translate("common.status.statusLabel")}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default BranchForm;
