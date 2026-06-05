import { useTranslate } from "@core/providers/translate";
import {
  useLazyGetActionByIdQuery,
  useLazyGetActionsQuery,
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
import { useLayoutEffect, useRef, useState } from "react";

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

  const [triggerFetchBranches] = useLazyFetchBranchesQuery();
  const [triggerFetchBranchById] = useLazyFetchBranchByIdQuery();
  const [triggerFetchTopics] = useLazyGetTopicsQuery();
  const [triggerFetchTopicById] = useLazyGetTopicByIdQuery();
  const [triggerFetchActions] = useLazyGetActionsQuery();
  const [triggerFetchActionById] = useLazyGetActionByIdQuery();

  // ─── Branch/topic derived state ──────────────────────────────────────
  const [userBranchId, setUserBranchId] = useState(null);
  const [userTopicId, setUserTopicId] = useState(null);

  // Reset user overrides when switching to a different record
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

  // ─── Action fetch (filtered by selected topic) ──────────────────────
  const fetchActions = async (page, pageSize, query) => {
    if (!selectedTopicId) {
      return { data: [], meta: { totalPages: 0 } };
    }
    try {
      const res = await triggerFetchActions({
        pagination: { current: page, pageSize },
        search: query ? "label" : null,
        keyword: query,
        filters: { topicId: selectedTopicId },
      }).unwrap();
      return res;
    } catch (err) {
      console.error("fetchActions failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchActionById = async (id) => {
    try {
      return await triggerFetchActionById(id).unwrap();
    } catch {
      return null;
    }
  };

  // ─── Populate form khi modal mở ─────────────────────────────────────
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

        {/* ─── Branch (not bound to form — used to filter topics) ──── */}
        <Form.Item
          label={translateEval?.form?.topic?.branch || "Chi nhánh"}
          required
          tooltip="Chọn chi nhánh trước, sau đó chọn chủ đề"
        >
          <SelectShared
            style={{ width: "100%" }}
            fetchFn={fetchBranchesFn}
            fetchItemById={fetchBranchById}
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

        {/* ─── Topic (standalone, used to filter actions) ──────────── */}
        <Form.Item
          label={translateEval?.form?.topicSection}
          required
          tooltip="Chọn chủ đề để lọc hành động"
        >
          <SelectShared
            key={selectedBranchId || "no-branch"}
            style={{ width: "100%" }}
            fetchFn={fetchTopics}
            fetchItemById={fetchTopicById}
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

        {/* ─── Action (filtered by selected topic) ─────────────────── */}
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
            fetchFn={fetchActions}
            fetchItemById={fetchActionById}
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
