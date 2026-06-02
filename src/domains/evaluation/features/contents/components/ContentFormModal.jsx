import { useTranslate } from "@core/providers/translate";
import ModalShared from "@shared/components/ModalShared";
import { useLazyGetActionsQuery } from "@domains/evaluation";
import { Form, Input, InputNumber, Select, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export default function ContentFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
  topicOptions = [],
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const [form] = useForm();
  const [actionOptions, setActionOptions] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [triggerFetchActions] = useLazyGetActionsQuery();

  const fetchActionsByTopic = useCallback(
    async (topicId) => {
      if (!topicId) {
        setActionOptions([]);
        form.setFieldValue("actionId", null);
        return;
      }
      try {
        const res = await triggerFetchActions({
          pagination: { current: 1, pageSize: 1000 },
          filters: { topicId },
        }).unwrap();
        setActionOptions(
          (res.data || []).map((a) => ({ label: a.label, value: a.id })),
        );
      } catch {
        setActionOptions([]);
      }
    },
    [triggerFetchActions, form],
  );

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({ ...initialValue });
    } else {
      form.setFieldsValue({ isActive: true, displayOrder: 0 });
    }

    return () => {
      form.resetFields();
    };
  }, [initialValue, form, open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActionsByTopic(selectedTopicId);
  }, [selectedTopicId, fetchActionsByTopic]);

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

        <Form.Item label={translateEval?.form?.topicSection}>
          <Select
            placeholder={translateEval?.form?.placeholder?.selectTopic}
            options={topicOptions}
            onChange={(value) => setSelectedTopicId(value)}
            allowClear
            value={selectedTopicId}
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
          <Select
            placeholder={translateEval?.form?.placeholder?.selectAction}
            options={actionOptions}
            disabled={!selectedTopicId}
          />
        </Form.Item>

        <Form.Item name="displayOrder" label={translateEval?.form?.displayOrder}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="isActive" label={translateEval?.form?.isActive} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
