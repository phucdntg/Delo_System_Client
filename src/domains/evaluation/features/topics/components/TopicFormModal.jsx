import { useTranslate } from "@core/providers/translate";
import {
  useLazyFetchBranchByIdQuery,
  useLazyFetchBranchesQuery,
} from "@domains/system";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useLayoutEffect } from "react";

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

  const [fetchBranches] = useLazyFetchBranchesQuery();
  const [fetchBranchById] = useLazyFetchBranchByIdQuery();

  const fetchBranchesFn = useCallback(
    async (page, pageSize, query) => {
      try {
        return await fetchBranches({
          keyword: query,
          pagination: { current: page, pageSize },
          search: query ? "name" : null,
        }).unwrap();
      } catch (err) {
        console.error("fetchBranchesFn failed", err);
        return { data: [], meta: { totalPages: 0 } };
      }
    },
    [fetchBranches],
  );

  const fetchBranchDetails = useCallback(
    async (id) => {
      try {
        return await fetchBranchById(id).unwrap();
      } catch (err) {
        console.error("fetchBranchDetails failed", err);
        return null;
      }
    },
    [fetchBranchById],
  );

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

        <Form.Item name="branchId" label={translateEval?.form?.topic?.branch}>
          <SelectShared
            style={{ width: "100%" }}
            fetchFn={fetchBranchesFn}
            fetchItemById={fetchBranchDetails}
            defaultId={initialValue?.branchId}
            pageSize={10}
            searchable
            placeholder={translateEval?.form?.placeholder?.branch}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={(branch) =>
              form.setFieldValue("branchId", branch?.id || null)
            }
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
