import { Form, Input, Switch } from "antd";
import { useLayoutEffect } from "react";
import { useTranslate } from "@core/providers/translate";

const BranchForm = ({ form, initialValue }) => {
  const { translate } = useTranslate();
  const translateBranch = translate("branch") || {};

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({
        ...initialValue,
      });
    } else {
      form.setFieldsValue({
        isActive: true,
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
          {
            pattern: /^(\+84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/,
            message: translateBranch?.form?.validation?.phoneInvalid,
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
