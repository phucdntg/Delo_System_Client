import { useTranslate } from "@core/providers/translate";
import {
  useLazyGetTopicByIdQuery,
  useLazyGetTopicsQuery,
} from "@domains/evaluation";
import {
  useLazyFetchBranchByIdQuery,
  useLazyFetchBranchesQuery,
} from "@domains/system";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";

export default function TargetFormModal({
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

  // ─── User's branch selection (changes via dropdown) ──────────────────
  const [userBranchId, setUserBranchId] = useState(null);

  // Derived from props — resets when editing different record
  const lastRecordIdRef = useRef(null);
  const currentRecordId = open ? (initialValue?.id ?? null) : null;

  // Reset user selection when switching to a different record
  if (currentRecordId !== lastRecordIdRef.current) {
    lastRecordIdRef.current = currentRecordId;
    if (currentRecordId !== null) {
      // Editing a (possibly different) record — reset user override
      setUserBranchId(null);
    }
  }

  // Current effective values (user override or from record)
  const selectedBranchId = open
    ? (userBranchId ?? initialValue?.topic?.branchId ?? null)
    : null;

  const [triggerFetchBranches] = useLazyFetchBranchesQuery();
  const [triggerFetchBranchById] = useLazyFetchBranchByIdQuery();

  const fetchBranchesFn = async (page, pageSize, query) => {
    try {
      return await triggerFetchBranches({
        keyword: query,
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
      }).unwrap();
    } catch (err) {
      console.error("fetchBranches failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchBranchById = async (id) => {
    try {
      return await triggerFetchBranchById(id).unwrap();
    } catch {
      return null;
    }
  };

  const [triggerFetchTopics] = useLazyGetTopicsQuery();
  const [triggerFetchTopicById] = useLazyGetTopicByIdQuery();

  const fetchTopics = async (page, pageSize, query) => {
    if (!selectedBranchId) {
      return { data: [], meta: { totalPages: 0 } };
    }
    try {
      const res = await triggerFetchTopics({
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
        keyword: query,
        filters: { branchId: selectedBranchId },
      }).unwrap();
      return res;
    } catch (err) {
      console.error("fetchTopics failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchTopicById = async (id) => {
    try {
      return await triggerFetchTopicById(id).unwrap();
    } catch {
      return null;
    }
  };

  // ─── Populate form khi modal mở ─────────────────────────────────────
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
            fetchFn={fetchBranchesFn}
            fetchItemById={fetchBranchById}
            defaultId={initialValue?.topic?.branchId}
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
            fetchFn={fetchTopics}
            fetchItemById={fetchTopicById}
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

        {/* ─── Description ─────────────────────────────────────────── */}
        <Form.Item name="description" label={translateEval?.form?.description}>
          <Input.TextArea
            rows={4}
            placeholder={translateEval?.form?.placeholder?.description}
          />
        </Form.Item>

        {/* ─── Status ──────────────────────────────────────────────── */}
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
