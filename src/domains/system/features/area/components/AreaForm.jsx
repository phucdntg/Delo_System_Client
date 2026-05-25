import { Form, Input, Switch } from "antd";
import { useLayoutEffect } from "react";
import { useTranslate } from "@core/providers/TranslateProvider";
import { useAuth } from "@core/providers/AuthProvider";
import {
  useLazyFetchBranchesQuery,
  useLazyFetchBranchByIdQuery,
} from "../../branch";
import SelectShared from "@shared/components/SelectShared";

const AreaForm = ({ form, initialValue }) => {
  const { translate } = useTranslate();
  const areaText = translate("area") || {};
  const areaFormText = areaText?.form || {};
  const commonText = translate("common") || {};
  const { selectedOrg } = useAuth();

  const [fetchBranches] = useLazyFetchBranchesQuery();
  const [fetchBranchById] = useLazyFetchBranchByIdQuery();

  const fetchBranchesFn = async (page, pageSize, query) => {
    try {
      const res = await fetchBranches({
        keyword: query,
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
      }).unwrap();
      return res;
    } catch (err) {
      console.error("AreaForm: fetchBranchesFn failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchBranchDetails = async (id) => {
    try {
      const res = await fetchBranchById(id).unwrap();
      return res;
    } catch (err) {
      console.error("AreaForm: fetchBranchDetails failed", err);
      return null;
    }
  };

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
          fetchFn={fetchBranchesFn}
          fetchItemById={fetchBranchDetails}
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
