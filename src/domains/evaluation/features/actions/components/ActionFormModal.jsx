import { PlusOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/translate";
import { config } from "@core/config";
import {
  useGetTopicsQuery,
  useGetTopicByIdQuery,
} from "@domains/evaluation";
import {
  useFetchBranchesQuery,
  useFetchBranchByIdQuery,
} from "@domains/system";
import ModalShared from "@shared/components/ModalShared";
import SelectShared from "@shared/components/SelectShared";
import { Form, Input, Switch, Upload } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGetActionsQuery } from "../services/actionService";

export default function ActionFormModal({
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
  const iconFileRef = useRef(null);
  const iconRemovedRef = useRef(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  const isCreateMode = !initialValue;
  const topicId = Form.useWatch("topicId", form);

  const [userBranchId, setUserBranchId] = useState(null);

  const lastRecordIdRef = useRef(null);
  const currentRecordId = open ? (initialValue?.id ?? null) : null;
  if (currentRecordId !== lastRecordIdRef.current) {
    lastRecordIdRef.current = currentRecordId;
    if (currentRecordId !== null) setUserBranchId(null);
  }

  const selectedBranchId = open
    ? (userBranchId ?? initialValue?.topic?.branchId ?? null)
    : null;

  const topicQueryParams = useMemo(
    () => (selectedBranchId ? { filters: { branchId: selectedBranchId } } : undefined),
    [selectedBranchId],
  );

  const buildInitialFileList = (record) => {
    if (!record?.icon) return [];
    return [
      {
        uid: "-1",
        name: record.icon,
        status: "done",
        url: `${config.baseUrl}/download/evaluation-icons/${record.icon}`,
      },
    ];
  };

  const [iconFileList, setIconFileList] = useState([]);

  useLayoutEffect(() => {
    if (open) {
      form.resetFields();
      iconRemovedRef.current = false;
      if (initialValue) {
        form.setFieldsValue({ ...initialValue });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayOrder(initialValue.displayOrder ?? 0);
        setIconFileList(buildInitialFileList(initialValue));
      } else {
        form.setFieldsValue({ isActive: true });
        setDisplayOrder(0);
        setIconFileList([]);
      }
    }
  }, [open, initialValue, form]);

  const { data: actionsData } = useGetActionsQuery(
    { pagination: { current: 1, pageSize: 1 }, filters: { topicId } },
    { skip: !isCreateMode || !topicId },
  );

  useEffect(() => {
    if (isCreateMode && topicId) {
      const count = actionsData?.meta?.totalItems || 0;
      setDisplayOrder(count + 1);
    } else if (!topicId) {
      setDisplayOrder(0);
    }
  }, [actionsData, topicId, isCreateMode]);

  const handleBranchChange = (item) => {
    const branchId = item?.id || null;
    setUserBranchId(branchId);
    form.setFieldValue("topicId", undefined);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        displayOrder: initialValue
          ? (initialValue.displayOrder ?? 0)
          : displayOrder,
        _iconFile: iconFileRef.current || null,
        _iconRemoved: iconRemovedRef.current,
      });
    } catch (error) {
      if (error?.errorFields) return;
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return;
    const fileList = e?.fileList || [];
    const file = fileList[0]?.originFileObj || null;
    iconFileRef.current = file;
    setIconFileList(fileList);
  };

  const onRemoveIcon = () => {
    iconFileRef.current = null;
    iconRemovedRef.current = true;
    setIconFileList([]);
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
          name="label"
          label={translateEval?.form?.label}
          rules={[
            {
              required: true,
              message: translateEval?.form?.validation?.labelRequired,
            },
          ]}
        >
          <Input placeholder={translateEval?.form?.placeholder?.label} />
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
            onChange={(item) =>
              form.setFieldValue("topicId", item?.id || null)
            }
          />
        </Form.Item>

        <Form.Item label={translateEval?.form?.icon}>
          <Upload
            key={
              initialValue?.id
                ? `icon-upload-${initialValue.id}`
                : "icon-upload-new"
            }
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
            accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
            fileList={iconFileList}
            onChange={normFile}
            onRemove={onRemoveIcon}
          >
            {iconFileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
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
