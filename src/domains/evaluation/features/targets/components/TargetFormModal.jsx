import { useTranslate } from "@core/providers/translate";
import { useLazyGetTopicsQuery } from "@domains/evaluation";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useLayoutEffect } from "react";

export default function TargetFormModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  confirmLoading,
}) {
  const { translate } = useTranslate();
  const translateEval = translate("evaluation") || {};
  const [form] = useForm();
  const [triggerFetchTopics] = useLazyGetTopicsQuery();

  const fetchTopics = useCallback(
    async (page, pageSize, query) => {
      try {
        const res = await triggerFetchTopics({
          pagination: { current: page, pageSize },
          search: query ? "name" : null,
          keyword: query,
        }).unwrap();
        return res;
      } catch (err) {
        console.error("fetchTopics failed", err);
        return { data: [], meta: { totalPages: 0 } };
      }
    },
    [triggerFetchTopics],
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
            style={{ width: "100%" }}
            fetchFn={fetchTopics}
            defaultId={initialValue?.topicId}
            pageSize={10}
            searchable
            placeholder={translateEval?.form?.placeholder?.selectTopic}
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
