import { useTranslate } from "@core/providers/translate";
import { useGetTopicsQuery, useGetTopicByIdQuery } from "@domains/evaluation";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useMemo, useRef, useState } from "react";

export default function TargetFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
  useQueryHook,
  useItemQueryHook,
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};
  const [form] = useForm();

  const [userBranchId, setUserBranchId] = useState(null);

  const lastRecordIdRef = useRef(null);
  const currentRecordId = open ? (initialValue?.id ?? null) : null;

  if (currentRecordId !== lastRecordIdRef.current) {
    lastRecordIdRef.current = currentRecordId;
    if (currentRecordId !== null) {
      setUserBranchId(null);
    }
  }

  const selectedBranchId = open
    ? (userBranchId ?? initialValue?.topic?.branchId ?? null)
    : null;

  const topicQueryParams = useMemo(
    () => (selectedBranchId ? { filters: { branchId: selectedBranchId } } : undefined),
    [selectedBranchId],
  );

  useEffect(() => {
    if (open && initialValue) {
      form.setFieldsValue({ ...initialValue });
    } else if (open && !initialValue) {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  }, [open, initialValue, form]);

  const handleBranchChange = (item) => {
    const branchId = item?.id || null;
    setUserBranchId(branchId);
    form.setFieldValue("topicId", undefined);
  };

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
          label={translateEval?.form?.name}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.nameRequired,
            },
          ]}
        >
          <Input placeholder={translateEval?.form?.placeholder?.name} />
        </Form.Item>

        <Form.Item
          label={translateEval?.form?.topic?.branch || "Chi nhánh"}
          required
        >
          <SelectShared
            style={{ width: "100%" }}
            useQueryHook={useQueryHook}
            useItemQueryHook={useItemQueryHook}
            searchField="name"
            defaultId={initialValue?.topic?.branchId}
            defaultValueItem={initialValue?.topic?.branch}
            value={initialValue?.topic?.branchId}
            pageSize={10}
            searchable
            placeholder={commonText?.placeholder?.selectBranch}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={handleBranchChange}
          />
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
          <SelectShared
            key={selectedBranchId || "no-branch"}
            style={{ width: "100%" }}
            useQueryHook={useGetTopicsQuery}
            useItemQueryHook={useGetTopicByIdQuery}
            queryParams={topicQueryParams}
            searchField="name"
            defaultId={initialValue?.topicId}
            value={initialValue?.topicId}
            pageSize={10}
            searchable
            disabled={!selectedBranchId}
            placeholder={commonText?.placeholder?.selectTopic}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={(item) => form.setFieldValue("topicId", item?.id || null)}
          />
        </Form.Item>

        <Form.Item name="description" label={translateEval?.form?.description}>
          <Input.TextArea
            rows={4}
            placeholder={translateEval?.form?.placeholder?.description}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={translateEval?.form?.isActive}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
