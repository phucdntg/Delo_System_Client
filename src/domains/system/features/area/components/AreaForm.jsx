import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useLayoutEffect } from "react";
import {
  useFetchBranchesQuery,
  useFetchBranchByIdQuery,
} from "../../branch";

const AreaForm = ({ form, initialValue }) => {
  const { translate } = useTranslate();
  const areaText = translate("area") || {};
  const areaFormText = areaText?.form || {};
  const commonText = translate("common") || {};
  const { selectedOrg } = useAuth();

  const handleBranchChange = (branch) => {
    form.setFieldValue("branchId", branch?.id);
  };

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({
        isActive: true,
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
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="name"
        label={areaFormText?.name}
        rules={[
          { required: true, message: areaFormText?.nameRequired },
          { min: 5, message: areaFormText?.nameMinLength },
        ]}
      >
        <Input placeholder={areaFormText?.namePlaceholder} />
      </Form.Item>

      <Form.Item
        name="branchId"
        label={areaFormText?.branch}
        rules={[{ required: true, message: areaFormText?.branchRequired }]}
      >
        <SelectShared
          style={{ width: "100%" }}
          useQueryHook={useFetchBranchesQuery}
          useItemQueryHook={useFetchBranchByIdQuery}
          searchField="name"
          defaultId={initialValue?.branchId}
          pageSize={10}
          searchable={true}
          placeholder={commonText?.placeholder?.selectBranch}
          getLabel={(item) => item.name}
          getValue={(item) => item.id}
          onChange={handleBranchChange}
          resetKey={selectedOrg}
        />
      </Form.Item>

      <Form.Item name="description" label={areaFormText?.description}>
        <Input.TextArea
          rows={3}
          placeholder={areaFormText?.descriptionPlaceholder}
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label={areaFormText?.status || commonText?.status?.statusLabel}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default AreaForm;
