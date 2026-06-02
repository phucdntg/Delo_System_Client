import { Form, Input, Switch } from "antd";
import { useLayoutEffect } from "react";
import { useTranslate } from "@core/providers/translate";

const OrganizationForm = ({ form, initialValue }) => {
  const { translate } = useTranslate();
  const translateOrgPage = translate("organization") || {};

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue(initialValue);
    }

    if (!initialValue) {
      form.setFieldsValue({
        monitorUrl:
          translateOrgPage?.form?.monitorUrlDefault || "/display-center",
        kioskUrl: translateOrgPage?.form?.kioskUrlDefault || "/take-number",
        kioskReviewUrl:
          translateOrgPage?.form?.kioskReviewUrlDefault || "/review",
        counterUrl:
          translateOrgPage?.form?.counterUrlDefault || "/display-counter",
      });
    }

    return () => {
      form.resetFields();
    };
  }, [initialValue, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="id" label="id" hidden={true}>
        <Input />
      </Form.Item>
      <Form.Item
        name="name"
        label={translateOrgPage?.form?.name}
        rules={[{ required: true, message: translateOrgPage?.form?.nameError }]}
      >
        <Input placeholder={translateOrgPage?.form?.namePlaceholder} />
      </Form.Item>

      <Form.Item
        name="subdomain"
        label={translateOrgPage?.form?.subdomain}
        rules={[
          { required: true, message: translateOrgPage?.form?.subdomainError },
        ]}
      >
        <Input placeholder={translateOrgPage?.form?.subdomainPlaceholder} />
      </Form.Item>

      <Form.Item
        name="monitorUrl"
        label={translateOrgPage?.form?.monitorUrl || "Link màn trung tâm"}
      >
        <Input
          placeholder={
            translateOrgPage?.form?.monitorUrlPlaceholder || "/display-center"
          }
        />
      </Form.Item>

      <Form.Item
        name="kioskUrl"
        label={translateOrgPage?.form?.kioskUrl || "Link Kiosk"}
      >
        <Input
          placeholder={
            translateOrgPage?.form?.kioskUrlPlaceholder || "/take-number"
          }
        />
      </Form.Item>

      <Form.Item
        name="kioskReviewUrl"
        label={translateOrgPage?.form?.kioskReviewUrl || "Link Kiosk đánh giá"}
      >
        <Input
          placeholder={
            translateOrgPage?.form?.kioskReviewUrlPlaceholder || "/review"
          }
        />
      </Form.Item>

      <Form.Item
        name="counterUrl"
        label={translateOrgPage?.form?.counterUrl || "Link Counter"}
      >
        <Input
          placeholder={
            translateOrgPage?.form?.counterUrlPlaceholder || "/display-counter"
          }
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label={translateOrgPage?.form?.isActive}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default OrganizationForm;
