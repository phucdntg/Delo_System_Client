import { useTranslate } from "@core/providers/translate";
import {
  useGetTopicsQuery,
  useGetTopicByIdQuery,
  useGetActionsQuery,
  useGetActionByIdQuery,
} from "@domains/evaluation";
import {
  useFetchBranchesQuery,
  useFetchBranchByIdQuery,
} from "@domains/system";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

export default function ContentFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const commonText = translate("common") || {};
  const [form] = useForm();

  const [userBranchId, setUserBranchId] = useState(null);
  const [userTopicId, setUserTopicId] = useState(null);

  const lastRecordIdRef = useRef(null);
  const currentRecordId = open ? (initialValue?.id ?? null) : null;

  if (currentRecordId !== lastRecordIdRef.current) {
    lastRecordIdRef.current = currentRecordId;
    if (currentRecordId !== null) {
      setUserBranchId(null);
      setUserTopicId(null);
    }
  }

  const getBranchId = (iv) => iv?.action?.topic?.branchId || iv?.topic?.branchId || null;
  const getTopicId = (iv) => iv?.action?.topicId || iv?.topicId || null;

  const selectedBranchId = open
    ? (userBranchId ?? getBranchId(initialValue))
    : null;
  const selectedTopicId = open
    ? (userTopicId ?? getTopicId(initialValue))
    : null;

  const topicQueryParams = useMemo(
    () => (selectedBranchId ? { filters: { branchId: selectedBranchId } } : undefined),
    [selectedBranchId],
  );

  const actionQueryParams = useMemo(
    () => (selectedTopicId ? { filters: { topicId: selectedTopicId } } : undefined),
    [selectedTopicId],
  );

  useLayoutEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValue) {
        form.setFieldsValue({ ...initialValue });
      } else {
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, initialValue, form]);

  const handleBranchChange = (item) => {
    const branchId = item?.id || null;
    setUserBranchId(branchId);
    setUserTopicId(null);
    form.setFieldValue("actionId", null);
  };

  const handleTopicChange = (item) => {
    const topicId = item?.id || null;
    setUserTopicId(topicId);
    form.setFieldValue("actionId", null);
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
          name="content"
          label={translateEval?.form?.content}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.contentRequired,
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={translateEval?.form?.placeholder?.content}
          />
        </Form.Item>

        <Form.Item
          label={translateEval?.form?.topic?.branch || "Chi nhánh"}
          required
          tooltip="Chọn chi nhánh trước, sau đó chọn chủ đề"
        >
          <SelectShared
            style={{ width: "100%" }}
            useQueryHook={useFetchBranchesQuery}
            useItemQueryHook={useFetchBranchByIdQuery}
            searchField="name"
            defaultId={
              initialValue?.action?.topic?.branchId || initialValue?.topic?.branchId
            }
            value={
              initialValue?.action?.topic?.branchId || initialValue?.topic?.branchId
            }
            pageSize={10}
            searchable
            placeholder={commonText?.placeholder?.selectBranch}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={handleBranchChange}
          />
        </Form.Item>

        <Form.Item
          label={translateEval?.form?.topicSection}
          required
          tooltip="Chọn chủ đề để lọc hành động"
        >
          <SelectShared
            key={selectedBranchId || "no-branch"}
            style={{ width: "100%" }}
            useQueryHook={useGetTopicsQuery}
            useItemQueryHook={useGetTopicByIdQuery}
            queryParams={topicQueryParams}
            searchField="name"
            defaultId={
              initialValue?.action?.topicId || initialValue?.topicId
            }
            value={
              initialValue?.action?.topicId || initialValue?.topicId
            }
            pageSize={10}
            searchable
            disabled={!selectedBranchId}
            placeholder={commonText?.placeholder?.selectTopic}
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            onChange={handleTopicChange}
          />
        </Form.Item>

        <Form.Item
          name="actionId"
          label={translateEval?.form?.action}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.actionRequired,
            },
          ]}
        >
          <SelectShared
            key={selectedTopicId || "no-topic"}
            style={{ width: "100%" }}
            useQueryHook={useGetActionsQuery}
            useItemQueryHook={useGetActionByIdQuery}
            queryParams={actionQueryParams}
            searchField="label"
            defaultId={initialValue?.actionId}
            value={initialValue?.actionId}
            pageSize={10}
            searchable
            disabled={!selectedTopicId}
            placeholder={commonText?.placeholder?.selectAction}
            getLabel={(item) => item.label}
            getValue={(item) => item.id}
            onChange={(item) =>
              form.setFieldValue("actionId", item?.id || null)
            }
          />
        </Form.Item>

        <Form.Item name="isActive" label={translateEval?.form?.isActive} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
